import { vi, describe, it, expect } from "vitest";
import { GET } from "@/app/api/users/me/route";

const LOG_PREFIX = "[GET /api/users/me]";

function stepLog(...args: unknown[]) {
  console.log(LOG_PREFIX, ...args);
}

function logResponseJson(status: number, json: unknown) {
  console.log("\n--- Response ---");
  console.log("Status:", status);
  console.log("JSON:\n" + JSON.stringify(json, null, 2));
  console.log("----------------\n");
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => {
    stepLog("1. Supabase クライアント取得");
    return Promise.resolve({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("2. 認証チェック (getUser)");
          const res = {
            data: { user: { id: "user-uuid-1" } },
            error: null,
          };
          stepLog("2. 認証OK userId:", res.data.user.id);
          return res;
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          stepLog("3. profiles 取得");
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                user_id: "user-uuid-1",
                display_name: "Test User",
                avatar_url: "https://example.com/avatar.png",
              },
              error: null,
            }),
          };
        }
        if (table === "slots") {
          stepLog("4. slots 取得");
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  slot_index: 1,
                  self_vector: { o: 0.8, c: 0.5, e: 0.6, a: 0.7, n: 0.3 },
                  resonance_vector: { o: 0.7, c: 0.6, e: 0.5, a: 0.8, n: 0.2 },
                  persona_icon: "https://example.com/icon.png",
                  persona_summary: "Summary",
                  created_at: "2026-01-01T00:00:00.000Z",
                },
              ],
              error: null,
            }),
          };
        }
        return {};
      }),
    });
  }),
}));

describe("GET /api/users/me", () => {
  it("returns UserProfile with mock data when env is missing (mock client flows data through)", async () => {
    const mockProfile = {
      user_id: "mock-user-no-env",
      display_name: "Mock User (no env)",
      avatar_url: null as string | null,
    };
    const mockSlots = [
      {
        slot_index: 2 as const,
        self_vector: { o: 0.1, c: 0.2, e: 0.3, a: 0.4, n: 0.5 },
        resonance_vector: { o: 0.5, c: 0.4, e: 0.3, a: 0.2, n: 0.1 },
        persona_icon: "",
        persona_summary: "Mock summary",
        created_at: "2026-06-15T12:00:00.000Z",
      },
    ];
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockImplementationOnce(() => {
      stepLog("1. Supabase クライアント取得");
      return Promise.resolve({
        auth: {
          getUser: vi.fn(async () => {
            stepLog("2. 認証チェック (getUser)");
            stepLog("2. 認証OK userId:", mockProfile.user_id);
            return { data: { user: { id: mockProfile.user_id } }, error: null };
          }),
        },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          stepLog("3. profiles 取得");
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          };
        }
        if (table === "slots") {
          stepLog("4. slots 取得");
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockSlots, error: null }),
          };
        }
        return {};
      }),
      });
    });

    const res = await GET();
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(json.userId).toBe(mockProfile.user_id);
    expect(json.displayName).toBe(mockProfile.display_name);
    expect(json.avatarUrl).toBe(mockProfile.avatar_url);
    expect(json.slots).toHaveLength(1);
    expect(json.slots[0].slotIndex).toBe(mockSlots[0].slot_index);
    expect(json.slots[0].selfVector).toEqual(mockSlots[0].self_vector);
    expect(json.slots[0].resonanceVector).toEqual(mockSlots[0].resonance_vector);
    expect(json.slots[0].personaIcon).toBe(mockSlots[0].persona_icon);
    expect(json.slots[0].personaSummary).toBe(mockSlots[0].persona_summary);
    expect(json.slots[0].createdAt).toBe(mockSlots[0].created_at);
  });

  it("returns 401 when not authenticated", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("1. Supabase クライアント取得");
          stepLog("2. 認証チェック (getUser)");
          stepLog("2. 認証NG → 401");
          return { data: { user: null }, error: null };
        }),
      },
      from: vi.fn(),
    } as never);

    const res = await GET();
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 404 when profile row does not exist", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("1. Supabase クライアント取得");
          stepLog("2. 認証チェック (getUser)");
          stepLog("2. 認証OK userId: user-uuid-1");
          return { data: { user: { id: "user-uuid-1" } }, error: null };
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          stepLog("3. profiles 取得");
          stepLog("3. プロフィールなし → 404");
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Profile not found" },
            }),
          };
        }
        return { select: vi.fn(), eq: vi.fn(), order: vi.fn().mockResolvedValue({ data: [], error: null }) };
      }),
    } as never);

    const res = await GET();
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(404);
    expect(json.error).toBe("Profile not found");
  });

  it("returns UserProfile when authenticated", async () => {
    const res = await GET();
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(json.userId).toBe("user-uuid-1");
    expect(json.displayName).toBe("Test User");
    expect(json.avatarUrl).toBe("https://example.com/avatar.png");
    expect(Array.isArray(json.slots)).toBe(true);
    expect(json.slots).toHaveLength(1);
    expect(json.slots[0].slotIndex).toBe(1);
    expect(json.slots[0].selfVector).toEqual({ o: 0.8, c: 0.5, e: 0.6, a: 0.7, n: 0.3 });
    expect(json.slots[0].resonanceVector).toEqual({ o: 0.7, c: 0.6, e: 0.5, a: 0.8, n: 0.2 });
    expect(json.slots[0].personaIcon).toBe("https://example.com/icon.png");
    expect(json.slots[0].personaSummary).toBe("Summary");
    expect(json.slots[0].createdAt).toBe("2026-01-01T00:00:00.000Z");
  });
});
