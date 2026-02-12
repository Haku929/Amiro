import { NextResponse } from "next/server";
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const { data: slotRows, error: slotsError } = await supabase
      .from("slots")
      .select("slot_index, self_vector, resonance_vector, persona_icon, persona_summary, created_at")
      .eq("user_id", user.id)
      .order("slot_index", { ascending: true });

    if (slotsError) {
      return NextResponse.json(
        { error: "Slots fetch failed" },
        { status: 500 }
      );
    }

    const slots: Slot[] = (slotRows ?? []).map(mapSlot);

    const body: UserProfile = {
      userId: profile.user_id,
      displayName: profile.display_name ?? "",
      avatarUrl: profile.avatar_url ?? null,
      slots,
    };

    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
