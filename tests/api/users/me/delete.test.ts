import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { DELETE } from "@/app/api/users/me/route";

const LOG_PREFIX = "[DELETE /api/users/me]";

const DEFAULT_TEST_USER_ID = "user-uuid-delete-1";

function stepLog(...args: unknown[]) {
  console.log(LOG_PREFIX, ...args);
}

function logRequest(method: string, path: string, context?: { userId?: string; description?: string }) {
  console.log("\n--- Request ---");
  console.log(LOG_PREFIX, method, path);
  if (context?.userId) {
    console.log(LOG_PREFIX, "Target userId:", context.userId);
  }
  if (context?.description) {
    console.log(LOG_PREFIX, "Context:", context.description);
  }
  console.log("---------------\n");
}

function logResponseJson(status: number, json: unknown, context?: { deletedUserId?: string }) {
  console.log("\n--- Response ---");
  console.log("Status:", status);
  console.log("JSON:\n" + JSON.stringify(json, null, 2));
  if (context?.deletedUserId) {
    console.log(LOG_PREFIX, "Deleted userId:", context.deletedUserId);
  }
  console.log("----------------\n");
}

const deleteUserMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => {
    stepLog("1. Supabase クライアント取得");
    return Promise.resolve({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("2. 認証チェック (getUser)");
          return {
            data: { user: { id: DEFAULT_TEST_USER_ID } },
            error: null,
          };
        }),
        signOut: vi.fn(async () => {
          stepLog("6. signOut");
          return { error: null };
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "slots") {
          stepLog("3. slots delete");
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "profiles") {
          stepLog("4. profiles delete");
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      }),
    });
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => {
    stepLog("5. Admin クライアント取得");
    return {
      auth: {
        admin: {
          deleteUser: deleteUserMock,
        },
      },
    };
  }),
}));

describe("DELETE /api/users/me", () => {
  const originalEnv = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    deleteUserMock.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv;
    deleteUserMock.mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    logRequest("DELETE", "/api/users/me", { description: "未認証のため削除対象ユーザーなし" });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => {
          stepLog("認証チェック → 未認証");
          return { data: { user: null }, error: null };
        }),
        signOut: vi.fn(),
      },
      from: vi.fn(),
    } as never);

    const res = await DELETE();
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 503 when SUPABASE_SERVICE_ROLE_KEY is not set", async () => {
    logRequest("DELETE", "/api/users/me", { userId: DEFAULT_TEST_USER_ID });
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const res = await DELETE();
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(503);
    expect(json.error).toContain("SUPABASE_SERVICE_ROLE_KEY");

    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  });

  it("returns 500 when slots delete fails", async () => {
    const userId = "user-uuid-1";
    logRequest("DELETE", "/api/users/me", { userId, description: "slots 削除でエラーになるモック" });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: userId } },
          error: null,
        })),
        signOut: vi.fn(),
      },
      from: vi.fn((table: string) => {
        if (table === "slots") {
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
          };
        }
        if (table === "profiles") {
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      }),
    } as never);

    const res = await DELETE();
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(500);
    expect(json.error).toBe("Account deletion failed");
  });

  it("returns 500 when admin deleteUser fails", async () => {
    logRequest("DELETE", "/api/users/me", { userId: DEFAULT_TEST_USER_ID });
    deleteUserMock.mockResolvedValueOnce({ error: { message: "Auth error" } });

    const res = await DELETE();
    const json = await res.json();
    logResponseJson(res.status, json);
    expect(res.status).toBe(500);
    expect(json.error).toBe("Account deletion failed");
  });

  it("returns 200 with ok true when deletion succeeds", async () => {
    logRequest("DELETE", "/api/users/me", { userId: DEFAULT_TEST_USER_ID });

    const res = await DELETE();
    const json = await res.json();
    logResponseJson(res.status, json, { deletedUserId: DEFAULT_TEST_USER_ID });
    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(deleteUserMock).toHaveBeenCalledWith(DEFAULT_TEST_USER_ID);
  });
});
