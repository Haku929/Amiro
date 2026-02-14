import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MatchingResult } from "@/lib/types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseLimit(value: string | null): number {
  if (value == null) return DEFAULT_LIMIT;
  const n = parseInt(value, 10);
  if (!Number.isInteger(n) || n < 0) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

function parseOffset(value: string | null): number {
  if (value == null) return 0;
  const n = parseInt(value, 10);
  if (!Number.isInteger(n) || n < 0) return 0;
  return n;
}

function parseSlot(value: string | null): 1 | 2 | 3 | null {
  if (value == null) return null;
  const n = parseInt(value, 10);
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}

type RpcRow = {
  other_user_id: string;
  resonance_score: number;
  matched_slot_index_self: number;
  matched_slot_index_other: number;
};

/**
 * 認証ユーザーと共鳴スコアの高い他ユーザーを取得する。RPC get_matching_scores の結果にプロフィールを結合して返す。
 * @param request - URL query: `slot` (required, 1|2|3), `limit` (optional, default 20, max 100), `offset` (optional, default 0). Auth required.
 * @returns 200: `MatchingResult[]`. 400: `slot` なしまたは無効. 401: `{ error: "Unauthorized" }`. 503: `{ error: "Matching scores unavailable" }`. 500: 同上.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const limit = parseLimit(searchParams.get("limit"));
    const offset = parseOffset(searchParams.get("offset"));

    const { data: rows, error: rpcError } = await supabase.rpc("get_matching_scores", {
      my_user_id: user.id,
      limit_n: MAX_LIMIT,
      offset_n: 0,
    }) as { data: RpcRow[] | null; error: unknown };

    if (rpcError) {
      return NextResponse.json(
        { error: "Matching scores unavailable" },
        { status: 503 }
      );
    }

    const list = (Array.isArray(rows) ? rows : []).slice(offset, offset + limit);
    if (list.length === 0) {
      return NextResponse.json([]);
    }

    const userIds = list.map((r) => r.other_user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, bio")
      .in("user_id", userIds);

    if (profilesError) {
      return NextResponse.json(
        { error: "Profiles fetch failed" },
        { status: 500 }
      );
    }

    const { data: slotRows, error: slotsError } = await supabase
      .from("slots")
      .select("user_id, slot_index, persona_summary")
      .in("user_id", userIds);

    if (slotsError) {
      return NextResponse.json(
        { error: "Slots fetch failed" },
        { status: 500 }
      );
    }

    const slotSummaryMap = new Map<string, string>(
      (slotRows ?? []).map((s) => [
        `${s.user_id}:${s.slot_index}`,
        s.persona_summary ?? "",
      ])
    );

    const profileMap = new Map(
      (profiles ?? []).map((p) => [
        p.user_id,
        {
          displayName: p.display_name ?? "",
          avatarUrl: p.avatar_url ?? null,
          bio: p.bio ?? null,
        },
      ])
    );

    const body: MatchingResult[] = list.map((r) => {
      const p = profileMap.get(r.other_user_id);
      const personaSummary =
        slotSummaryMap.get(`${r.other_user_id}:${r.matched_slot_index_other}`) ?? "";
      return {
        userId: r.other_user_id,
        displayName: p?.displayName ?? "",
        avatarUrl: p?.avatarUrl ?? null,
        bio: p?.bio ?? null,
        resonanceScore: r.resonance_score,
        matchedSlotIndexSelf: r.matched_slot_index_self,
        matchedSlotIndexOther: r.matched_slot_index_other,
        personaSummary,
      };
    });

    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
