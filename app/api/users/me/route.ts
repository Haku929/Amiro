import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile, Slot, Big5Vector } from "@/lib/types";

function mapSlot(row: {
  slot_index: number;
  self_vector: Big5Vector;
  resonance_vector: Big5Vector;
  persona_icon: string;
  persona_summary: string;
  created_at: string;
}): Slot {
  return {
    slotIndex: row.slot_index as 1 | 2 | 3,
    selfVector: row.self_vector,
    resonanceVector: row.resonance_vector,
    personaIcon: row.persona_icon,
    personaSummary: row.persona_summary,
    createdAt: row.created_at,
  };
}

/**
 * 認証ユーザーのプロフィールとスロット一覧を取得する。
 * @returns 200: `UserProfile` (userId, displayName, avatarUrl, slots). 401: `{ error: "Unauthorized" }`. 404: `{ error: "Profile not found" }`. 500: `{ error: "Slots fetch failed" }` or `{ error: "Internal server error" }`.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const fetched = await fetchUserProfile(supabase, user.id);
    if ("error" in fetched) {
      return NextResponse.json(
        fetched.error === 404 ? { error: "Profile not found" } : { error: "Slots fetch failed" },
        { status: fetched.error }
      );
    }

    const body: UserProfile = {
      userId: fetched.profile.user_id,
      displayName: fetched.profile.display_name ?? "",
      avatarUrl: fetched.profile.avatar_url ?? null,
      slots: fetched.slots,
    };

    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function fetchUserProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ profile: { user_id: string; display_name: string | null; avatar_url: string | null }; slots: Slot[] } | { error: number }> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    return { error: 404 };
  }

  const { data: slotRows, error: slotsError } = await supabase
    .from("slots")
    .select("slot_index, self_vector, resonance_vector, persona_icon, persona_summary, created_at")
    .eq("user_id", userId)
    .order("slot_index", { ascending: true });

  if (slotsError) {
    return { error: 500 };
  }

  const slots: Slot[] = (slotRows ?? []).map(mapSlot);
  return { profile, slots };
}

/**
 * 認証ユーザーのプロフィール（表示名・アバターURL）を部分的に更新する。body にない項目は変更しない。
 * @param request - JSON body: `{ displayName?: string; avatarUrl?: string | null }` のいずれかまたは両方。Auth required.
 * @returns 200: 更新後の `UserProfile`. 401: `{ error: "Unauthorized" }`. 400: `{ error: "Invalid JSON" }`. 404: `{ error: "Profile not found" }`. 500: `{ error: "Profile update failed" }`, `{ error: "Slots fetch failed" }` or `{ error: "Internal server error" }`.
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: { displayName?: string; avatarUrl?: string | null };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const updates: { display_name?: string; avatar_url?: string | null } = {};
    if (body.displayName !== undefined) {
      updates.display_name = typeof body.displayName === "string" ? body.displayName : "";
    }
    if (body.avatarUrl !== undefined) {
      updates.avatar_url = body.avatarUrl === null || typeof body.avatarUrl === "string" ? body.avatarUrl : null;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (updateError) {
        return NextResponse.json(
          { error: "Profile update failed" },
          { status: 500 }
        );
      }
    }

    const fetched = await fetchUserProfile(supabase, user.id);
    if ("error" in fetched) {
      return NextResponse.json(
        fetched.error === 404 ? { error: "Profile not found" } : { error: "Slots fetch failed" },
        { status: fetched.error }
      );
    }

    const result: UserProfile = {
      userId: fetched.profile.user_id,
      displayName: fetched.profile.display_name ?? "",
      avatarUrl: fetched.profile.avatar_url ?? null,
      slots: fetched.slots,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
