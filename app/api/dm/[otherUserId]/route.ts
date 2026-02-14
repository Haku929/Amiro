import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DmMessage } from "@/lib/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ otherUserId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otherUserId } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? "50", 10), 1),
      100
    );
    const before = searchParams.get("before");

    let query = supabase
      .from("dm_messages")
      .select("id, sender_id, receiver_id, content, created_at")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      );

    if (before) {
      const { data: beforeRow } = await supabase
        .from("dm_messages")
        .select("created_at")
        .eq("id", before)
        .single();
      if (beforeRow?.created_at) {
        query = query.lt("created_at", beforeRow.created_at);
      }
    }

    const { data: rows, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    const messages: DmMessage[] = (rows ?? []).map((r) => ({
      id: r.id,
      senderId: r.sender_id,
      receiverId: r.receiver_id,
      content: r.content,
      createdAt: r.created_at,
    }));

    return NextResponse.json(messages.reverse());
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
