import { vi, describe, it, expect } from "vitest";
import { POST } from "@/app/api/slots/route";

const LOG_PREFIX = "[POST /api/slots]";

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
  personaSummary: "Summary text",
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
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
        stepLog("2. slots 参照");
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        };
      }),
    })
  ),
}));

describe("POST /api/slots", () => {
  it("returns 201 and Slot when authenticated and slot available", async () => {
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
          eq: vi.fn().mockResolvedValueOnce({
            data: [],
            error: null,
          }),
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        };
      }),
    } as never);

    const req = new Request("http://localhost/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(201);
    expect(json.slotIndex).toBe(1);
    expect(json.selfVector).toEqual(validBody.selfVector);
    expect(json.resonanceVector).toEqual(validBody.resonanceVector);
    expect(json.personaIcon).toBe(validBody.personaIcon);
    expect(json.personaSummary).toBe(validBody.personaSummary);
    expect(typeof json.createdAt).toBe("string");
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

    const req = new Request("http://localhost/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 409 when no slot available", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "user-full" } },
          error: null,
        })),
      },
      from: vi.fn((table: string) => {
        if (table !== "slots") return {};
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [
              { slot_index: 1 },
              { slot_index: 2 },
              { slot_index: 3 },
            ],
            error: null,
          }),
          insert: vi.fn(),
        };
      }),
    } as never);

    const req = new Request("http://localhost/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(409);
    expect(json.error).toBe("No slot available");
  });

  it("returns 400 when request body is invalid", async () => {
    const req = new Request("http://localhost/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selfVector: validBody.selfVector }),
    });
    const res = await POST(req);
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid request body");
  });
});
