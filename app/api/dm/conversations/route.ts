import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type ConversationItem = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  lastMessage?: { content: string; createdAt: string };
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: contactRows, error: contactError } = await supabase
      .from("contacts")
      .select("other_user_id")
      .eq("user_id", user.id);

    if (contactError) {
      return NextResponse.json(
        { error: "Failed to fetch contacts" },
        { status: 500 }
      );
    }

    const { data: sentRows, error: sentError } = await supabase
      .from("dm_messages")
      .select("receiver_id")
      .eq("sender_id", user.id);

    if (sentError) {
      return NextResponse.json(
        { error: "Failed to fetch dm_messages" },
        { status: 500 }
      );
    }

    const { data: receivedRows, error: receivedError } = await supabase
      .from("dm_messages")
      .select("sender_id")
      .eq("receiver_id", user.id);

    if (receivedError) {
      return NextResponse.json(
        { error: "Failed to fetch dm_messages" },
        { status: 500 }
      );
    }

    const otherIds = new Set<string>();
    (contactRows ?? []).forEach((r) => otherIds.add(r.other_user_id));
    (sentRows ?? []).forEach((r) => otherIds.add(r.receiver_id));
    (receivedRows ?? []).forEach((r) => otherIds.add(r.sender_id));
    otherIds.delete(user.id);

    if (otherIds.size === 0) {
      return NextResponse.json([]);
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", Array.from(otherIds));

    if (profilesError) {
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 }
      );
    }

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.user_id, p])
    );

    const list: ConversationItem[] = Array.from(otherIds).map((id) => {
      const p = profileMap.get(id);
      return {
        userId: id,
        displayName: p?.display_name ?? "",
        avatarUrl: p?.avatar_url ?? null,
      };
    });

    for (const item of list) {
      const { data: msgs } = await supabase
        .from("dm_messages")
        .select("content, created_at")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${item.userId}),and(sender_id.eq.${item.userId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: false })
        .limit(1);
      if (msgs?.[0]) {
        item.lastMessage = {
          content: msgs[0].content,
          createdAt: msgs[0].created_at,
        };
      }
    }

    list.sort((a, b) => {
      const aAt = a.lastMessage?.createdAt ?? "";
      const bAt = b.lastMessage?.createdAt ?? "";
      return bAt.localeCompare(aAt);
    });

    return NextResponse.json(list);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
