import { vi, describe, it, expect } from "vitest";
import { GET } from "@/app/api/ai/situations/route";

const SITUATIONS_MOCK = [
  { id: 1, text: "カフェで読書" },
  { id: 2, text: "散歩中" },
  { id: 3, text: "仕事の合間に" },
  { id: 4, text: "夜のリラックスタイム" },
  { id: 5, text: "朝の通勤中" },
];

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn((table: string) => {
        if (table !== "situations") return {};
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: SITUATIONS_MOCK,
            error: null,
          }),
        };
      }),
    })
  ),
}));

function request(url: string): Request {
  return new Request(url);
}

function logResponseJson(status: number, json: unknown) {
  console.log("\n--- Response ---");
  console.log("Status:", status);
  console.log("JSON:\n" + JSON.stringify(json, null, 2));
  console.log("----------------\n");
}

describe("GET /api/ai/situations", () => {
  it("returns 200 and situations array of length 3 when date is provided", async () => {
    const res = await GET(
      request("http://localhost/api/ai/situations?date=2026-02-11")
    );
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(Array.isArray(json.situations)).toBe(true);
    expect(json.situations).toHaveLength(3);
    json.situations.forEach((s: unknown) => {
      expect(typeof s).toBe("string");
    });
  });

  it("returns same 3 situations for same date (seed stability)", async () => {
    const url = "http://localhost/api/ai/situations?date=2026-01-01";
    const res1 = await GET(request(url));
    const res2 = await GET(request(url));
    const json1 = await res1.json();
    const json2 = await res2.json();
    logResponseJson(res1.status, json1);
    logResponseJson(res2.status, json2);
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(json1.situations).toEqual(json2.situations);
  });

  it("returns 200 when date is omitted (uses today UTC)", async () => {
    const res = await GET(request("http://localhost/api/ai/situations"));
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(json.situations).toHaveLength(3);
  });

  it("returns 503 when database returns error", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "DB error" },
        }),
      })),
    } as never);

    const res = await GET(
      request("http://localhost/api/ai/situations?date=2026-02-11")
    );
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(503);
    expect(json.error).toBe("Failed to fetch situations");
  });

  it("returns 503 when situations count is less than 3", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [{ id: 1, text: "A" }, { id: 2, text: "B" }],
          error: null,
        }),
      })),
    } as never);

    const res = await GET(
      request("http://localhost/api/ai/situations?date=2026-02-11")
    );
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(503);
    expect(json.error).toBe("Not enough situations in database");
  });
});
