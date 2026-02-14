import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DmMessage } from "@/lib/types";

async function canSend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  senderId: string,
  receiverId: string
): Promise<boolean> {
  const { data: contactRows } = await supabase
    .from("contacts")
    .select("user_id")
    .or(
      `and(user_id.eq.${senderId},other_user_id.eq.${receiverId}),and(user_id.eq.${receiverId},other_user_id.eq.${senderId})`
    )
    .limit(1);
  if ((contactRows?.length ?? 0) > 0) return true;

  const { data: msgRows } = await supabase
    .from("dm_messages")
    .select("id")
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
    )
    .limit(1);
  return (msgRows?.length ?? 0) > 0;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { otherUserId?: string; content?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const otherUserId = body.otherUserId;
    const content = body.content;
    if (typeof otherUserId !== "string" || !otherUserId) {
      return NextResponse.json(
        { error: "otherUserId is required" },
        { status: 400 }
      );
    }
    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    if (otherUserId === user.id) {
      return NextResponse.json(
        { error: "Cannot send to yourself" },
        { status: 400 }
      );
    }

    const allowed = await canSend(supabase, user.id, otherUserId);
    if (!allowed) {
      return NextResponse.json(
        { error: "Cannot send: add as contact first or wait for them to add you" },
        { status: 403 }
      );
    }

    const { data: row, error } = await supabase
      .from("dm_messages")
      .insert({
        sender_id: user.id,
        receiver_id: otherUserId,
        content: content.trim(),
      })
      .select("id, sender_id, receiver_id, content, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    const message: DmMessage = {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      createdAt: row.created_at,
    };

    return NextResponse.json(message);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
