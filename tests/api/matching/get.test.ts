import { vi, describe, it, expect } from "vitest";
import { GET } from "@/app/api/matching/route";

const LOG_PREFIX = "[GET /api/matching]";

function stepLog(...args: unknown[]) {
  console.log(LOG_PREFIX, ...args);
}

function logResponseJson(status: number, json: unknown) {
  console.log("\n--- Response ---");
  console.log("Status:", status);
  console.log("JSON:\n" + JSON.stringify(json, null, 2));
  console.log("----------------\n");
}

function buildRequest(url = "http://localhost/api/matching") {
  return new Request(url);
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => {
    stepLog("1. Supabase クライアント取得");
    return Promise.resolve({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("2. 認証チェック (getUser)");
          return {
            data: { user: { id: "self-uuid-1" } },
            error: null,
          };
        }),
      },
      rpc: vi.fn(async (_name: string, _params: unknown) => {
        stepLog("3. RPC get_matching_scores 呼び出し");
        return {
          data: [
            {
              other_user_id: "other-uuid-1",
              resonance_score: 0.92,
              matched_slot_index_self: 2,
              matched_slot_index_other: 1,
            },
          ],
          error: null,
        };
      }),
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          stepLog("4. profiles 取得");
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [
                {
                  user_id: "other-uuid-1",
                  display_name: "Other User",
                  avatar_url: "https://example.com/other.png",
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

describe("GET /api/matching", () => {
  it("returns 401 when not authenticated", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("認証チェック → 未認証");
          return { data: { user: null }, error: null };
        }),
      },
      rpc: vi.fn(),
      from: vi.fn(),
    } as never);

    const res = await GET(buildRequest());
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 503 when RPC errors", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "self-uuid-1" } },
          error: null,
        })),
      },
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "RPC not found" },
      }),
      from: vi.fn(),
    } as never);

    const res = await GET(buildRequest());
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(503);
    expect(json.error).toBe("Matching scores unavailable");
  });

  it("returns 200 with empty array when RPC returns empty", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "self-uuid-1" } },
          error: null,
        })),
      },
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
      from: vi.fn(),
    } as never);

    const res = await GET(buildRequest());
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(json).toEqual([]);
  });

  it("returns 200 with MatchingResult[] when RPC returns rows and profiles exist", async () => {
    const res = await GET(buildRequest());
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(1);
    expect(json[0].userId).toBe("other-uuid-1");
    expect(json[0].displayName).toBe("Other User");
    expect(json[0].avatarUrl).toBe("https://example.com/other.png");
    expect(json[0].resonanceScore).toBe(0.92);
    expect(json[0].matchedSlotIndexSelf).toBe(2);
    expect(json[0].matchedSlotIndexOther).toBe(1);
  });

  it("passes limit and offset from query to RPC", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const rpcMock = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "self-uuid-1" } },
          error: null,
        })),
      },
      rpc: rpcMock,
      from: vi.fn(),
    } as never);

    await GET(buildRequest("http://localhost/api/matching?limit=5&offset=10"));
    expect(rpcMock).toHaveBeenCalledWith("get_matching_scores", {
      my_user_id: "self-uuid-1",
      limit_n: 5,
      offset_n: 10,
    });
  });
});
