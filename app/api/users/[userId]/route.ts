import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserProfile, Slot, Big5Vector } from "@/lib/types";

function mapSlot(row: {
  slot_index: number;
  self_vector: Big5Vector;
  resonance_vector: Big5Vector;
  persona_icon: string;
  persona_summary: string;
  created_at: string;
  conversation?: { messages: { role: string; content: string }[] } | null;
}): Slot {
  const conv = row.conversation;
  const conversation =
    conv && Array.isArray(conv.messages)
      ? { messages: conv.messages as { role: "user" | "model"; content: string }[] }
      : undefined;
  return {
    slotIndex: row.slot_index as 1 | 2 | 3,
    selfVector: row.self_vector,
    resonanceVector: row.resonance_vector,
    personaIcon: row.persona_icon,
    personaSummary: row.persona_summary,
    createdAt: row.created_at,
    ...(conversation && { conversation }),
  };
}

/**
 * 指定ユーザーのプロフィール（表示用）を取得する。認証必須。自分は userId=me で取得可能。
 * @returns 200: UserProfile. 401: Unauthorized. 404: Profile not found. 500: Internal server error.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: paramUserId } = await context.params;
    const userId = paramUserId === "me" ? currentUser.id : paramUserId;

    const isOwn = userId === currentUser.id;
    const db = isOwn ? supabase : createAdminClient();

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("user_id, display_name, avatar_url, bio")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: slotRows, error: slotsError } = await db
      .from("slots")
      .select("slot_index, self_vector, resonance_vector, persona_icon, persona_summary, created_at, conversation")
      .eq("user_id", userId)
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
      bio: profile.bio ?? null,
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
