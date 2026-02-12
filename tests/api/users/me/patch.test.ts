import { vi, describe, it, expect } from "vitest";
import { PATCH } from "@/app/api/users/me/route";

const LOG_PREFIX = "[PATCH /api/users/me]";

function stepLog(...args: unknown[]) {
  console.log(LOG_PREFIX, ...args);
}

function logResponseJson(status: number, json: unknown) {
  console.log("\n--- Response ---");
  console.log("Status:", status);
  console.log("JSON:\n" + JSON.stringify(json, null, 2));
  console.log("----------------\n");
}

function buildRequest(body: { displayName?: string; avatarUrl?: string | null }) {
  return new Request("http://localhost/api/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const defaultProfile = {
  user_id: "user-uuid-1",
  display_name: "Test User",
  avatar_url: "https://example.com/avatar.png",
};

const defaultSlots = [
  {
    slot_index: 1,
    self_vector: { o: 0.8, c: 0.5, e: 0.6, a: 0.7, n: 0.3 },
    resonance_vector: { o: 0.7, c: 0.6, e: 0.5, a: 0.8, n: 0.2 },
    persona_icon: "https://example.com/icon.png",
    persona_summary: "Summary",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => {
    stepLog("1. Supabase クライアント取得");
    return Promise.resolve({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("2. 認証チェック (getUser)");
          return {
            data: { user: { id: "user-uuid-1" } },
            error: null,
          };
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          stepLog("3. profiles (update or select)");
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: defaultProfile,
              error: null,
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === "slots") {
          stepLog("4. slots 取得");
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: defaultSlots,
              error: null,
            }),
          };
        }
        return {};
      }),
    });
  }),
}));

describe("PATCH /api/users/me", () => {
  it("returns 401 when not authenticated", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: null },
          error: null,
        })),
      },
      from: vi.fn(),
    } as never);

    const res = await PATCH(buildRequest({ displayName: "New" }));
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/users/me", {
      method: "PATCH",
      body: "not json",
    });
    const res = await PATCH(req);
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid JSON");
  });

  it("returns 200 with UserProfile when updating displayName", async () => {
    const res = await PATCH(buildRequest({ displayName: "Updated Name" }));
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(json.userId).toBe("user-uuid-1");
    expect(json.displayName).toBe("Test User");
    expect(json.avatarUrl).toBe("https://example.com/avatar.png");
    expect(Array.isArray(json.slots)).toBe(true);
    expect(json.slots).toHaveLength(1);
  });

  it("returns 200 with UserProfile when body is empty (no update)", async () => {
    const res = await PATCH(buildRequest({}));
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(json.userId).toBe("user-uuid-1");
    expect(json.slots).toHaveLength(1);
  });

  it("returns 200 when sending avatarUrl in body", async () => {
    const res = await PATCH(buildRequest({ avatarUrl: null }));
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("avatarUrl");
    expect(json).toHaveProperty("slots");
  });
});
