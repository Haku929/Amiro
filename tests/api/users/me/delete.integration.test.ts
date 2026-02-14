import { vi, describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const LOG_PREFIX = "[DELETE /api/users/me integration]";

const cookieStore: { name: string; value: string }[] = [];

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      getAll: () => cookieStore,
      set: (name: string, value: string, _options?: unknown) => {
        const i = cookieStore.findIndex((c) => c.name === name);
        if (i >= 0) cookieStore[i] = { name, value };
        else cookieStore.push({ name, value });
      },
    }),
}));

const hasSupabaseEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

describe(
  "DELETE /api/users/me (integration: 実ユーザー作成 → 削除)",
  { skip: !hasSupabaseEnv },
  () => {
    it("creates a user with signUp, then DELETE removes the user", async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const email = `integration-delete-${Date.now()}@example.com`;
      const password = "integration-test-password-1";

      console.log("\n--- Request (integration) ---");
      console.log(LOG_PREFIX, "1. signUp:", email);
      const anon = createClient(url, anonKey);
      const {
        data: { user, session },
        error: signUpError,
      } = await anon.auth.signUp({ email, password });

      if (signUpError || !user || !session) {
        console.log(LOG_PREFIX, "signUp error:", signUpError?.message ?? "no user/session");
        throw new Error(signUpError?.message ?? "signUp failed");
      }
      console.log(LOG_PREFIX, "Created userId:", user.id);

      cookieStore.length = 0;
      const serverForCookies = createServerClient(url, anonKey, {
        cookies: {
          getAll: () => cookieStore,
          setAll: (toSet: { name: string; value: string }[]) => {
            toSet.forEach((c) => {
              const i = cookieStore.findIndex((x) => x.name === c.name);
              if (i >= 0) cookieStore[i] = { name: c.name, value: c.value };
              else cookieStore.push({ name: c.name, value: c.value });
            });
          },
        },
      });
      await serverForCookies.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      console.log(LOG_PREFIX, "2. Session injected into cookie store");

      const { DELETE } = await import("@/app/api/users/me/route");
      console.log(LOG_PREFIX, "3. DELETE /api/users/me");
      const res = await DELETE();
      const json = await res.json();

      console.log("\n--- Response ---");
      console.log("Status:", res.status);
      console.log("JSON:", JSON.stringify(json, null, 2));
      console.log("----------------\n");

      expect(res.status).toBe(200);
      expect(json).toEqual({ ok: true });

      const admin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: deletedUser } = await admin.auth.admin.getUserById(user.id);
      console.log(LOG_PREFIX, "4. Verify deleted: getUserById =>", deletedUser?.user ? "still exists" : "null (deleted)");
      expect(deletedUser?.user ?? null).toBeFalsy();
    });
  }
);
