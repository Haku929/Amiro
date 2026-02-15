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
 * 認証ユーザーのプロフィールとスロット一覧を取得する。
 * @returns 200: `UserProfile` (userId, displayName, avatarUrl, bio, slots). 401: `{ error: "Unauthorized" }`. 404: `{ error: "Profile not found" }`. 500: `{ error: "Slots fetch failed" }` or `{ error: "Internal server error" }`.
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
      bio: fetched.profile.bio ?? null,
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
): Promise<{ profile: { user_id: string; display_name: string | null; avatar_url: string | null; bio: string | null }; slots: Slot[] } | { error: number }> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, bio")
    .eq("user_id", userId)
    .single();

  // プロフィールが見つからない場合、Auth情報から作成を試みる
  let currentProfile = profile;
  if (profileError || !profile) {
    // Authユーザー情報を取得してプロフィールを作成
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
        const avatarUrl = user.user_metadata?.avatar_url || null;

        const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .upsert({
                user_id: userId,
                display_name: displayName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
            .select("user_id, display_name, avatar_url, bio")
            .single();
        
        if (!createError && newProfile) {
            currentProfile = newProfile;
        } else {
            console.error("Failed to auto-create profile:", createError);
            return { error: 404 };
        }
    } else {
        return { error: 404 };
    }
  }

  const { data: slotRows, error: slotsError } = await supabase
    .from("slots")
    .select("slot_index, self_vector, resonance_vector, persona_icon, persona_summary, created_at, conversation")
    .eq("user_id", userId)
    .order("slot_index", { ascending: true });

  if (slotsError) {
    return { error: 500 };
  }

  const slots: Slot[] = (slotRows ?? []).map(mapSlot);
  return { profile: currentProfile!, slots };
}

/**
 * 認証ユーザーのプロフィール（表示名・アバターURL）を部分的に更新する。body にない項目は変更しない。
 * @param request - JSON body: `{ displayName?: string; avatarUrl?: string | null; bio?: string | null }` のいずれかまたは複数。Auth required.
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

    let body: { displayName?: string; avatarUrl?: string | null; bio?: string | null };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const updates: { display_name?: string; avatar_url?: string | null; bio?: string | null } = {};
    if (body.displayName !== undefined) {
      updates.display_name = typeof body.displayName === "string" ? body.displayName : "";
    }
    if (body.avatarUrl !== undefined) {
      updates.avatar_url = body.avatarUrl === null || typeof body.avatarUrl === "string" ? body.avatarUrl : null;
    }
    if (body.bio !== undefined) {
      updates.bio = body.bio === null || typeof body.bio === "string" ? body.bio : null;
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
      bio: fetched.profile.bio ?? null,
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

/**
 * 認証ユーザーのアカウントを削除する。slots → profiles → auth.users の順で削除し、セッションを破棄する。
 * @returns 200: `{ ok: true }`. 401: `{ error: "Unauthorized" }`. 500: `{ error: "..." }`.
 */
export async function DELETE() {
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

    const userId = user.id;

    const { error: slotsError } = await supabase
      .from("slots")
      .delete()
      .eq("user_id", userId);

    if (slotsError) {
      return NextResponse.json(
        { error: "Account deletion failed" },
        { status: 500 }
      );
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) {
      return NextResponse.json(
        { error: "Account deletion failed" },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Account deletion is not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 503 }
      );
    }

    const admin = createAdminClient();
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      return NextResponse.json(
        { error: "Account deletion failed" },
        { status: 500 }
      );
    }

    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
