import { vi, describe, it, expect } from "vitest";
import { PUT } from "@/app/api/slots/[slotIndex]/route";

const LOG_PREFIX = "[PUT /api/slots/:slotIndex]";

function stepLog(...args: unknown[]) {
  console.log(LOG_PREFIX, ...args);
}

function logResponseJson(status: number, json: unknown) {
  console.log("\n--- Response ---");
  console.log("Status:", status);
  console.log("JSON:\n" + JSON.stringify(json, null, 2));
  console.log("----------------\n");
}

const validBody = {
  selfVector: { o: 0.8, c: 0.5, e: 0.6, a: 0.7, n: 0.3 },
  resonanceVector: { o: 0.7, c: 0.6, e: 0.5, a: 0.8, n: 0.2 },
  personaIcon: "https://example.com/icon.png",
  personaSummary: "Updated summary",
};

const existingCreatedAt = "2026-01-01T00:00:00.000Z";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "user-uuid-1" } },
          error: null,
        })),
      },
      from: vi.fn((table: string) => {
        if (table !== "slots") return {};
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { created_at: existingCreatedAt },
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
        };
      }),
    })
  ),
}));

describe("PUT /api/slots/:slotIndex", () => {
  it("returns 200 and Slot when authenticated and slot exists", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("1. 認証チェック");
          return {
            data: { user: { id: "user-uuid-1" } },
            error: null,
          };
        }),
      },
      from: vi.fn((table: string) => {
        if (table !== "slots") return {};
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: { created_at: existingCreatedAt },
            error: null,
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }),
    } as never);

    const req = new Request("http://localhost/api/slots/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await PUT(req, {
      params: Promise.resolve({ slotIndex: "1" }),
    });
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(json.slotIndex).toBe(1);
    expect(json.selfVector).toEqual(validBody.selfVector);
    expect(json.resonanceVector).toEqual(validBody.resonanceVector);
    expect(json.personaIcon).toBe(validBody.personaIcon);
    expect(json.personaSummary).toBe(validBody.personaSummary);
    expect(json.createdAt).toBe(existingCreatedAt);
  });

  it("returns 401 when not authenticated", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("1. 認証チェック → NG");
          return { data: { user: null }, error: null };
        }),
      },
      from: vi.fn(),
    } as never);

    const req = new Request("http://localhost/api/slots/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await PUT(req, {
      params: Promise.resolve({ slotIndex: "1" }),
    });
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 404 when slot does not exist for user", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "user-uuid-1" } },
          error: null,
        })),
      },
      from: vi.fn((table: string) => {
        if (table !== "slots") return {};
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
          update: vi.fn(),
        };
      }),
    } as never);

    const req = new Request("http://localhost/api/slots/2", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await PUT(req, {
      params: Promise.resolve({ slotIndex: "2" }),
    });
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(404);
    expect(json.error).toBe("Slot not found");
  });

  it("returns 400 when slotIndex is invalid", async () => {
    const req = new Request("http://localhost/api/slots/0", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await PUT(req, {
      params: Promise.resolve({ slotIndex: "0" }),
    });
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid slot index");
  });

  it("returns 400 when request body is invalid", async () => {
    const req = new Request("http://localhost/api/slots/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selfVector: validBody.selfVector }),
    });
    const res = await PUT(req, {
      params: Promise.resolve({ slotIndex: "1" }),
    });
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid request body");
  });
});
