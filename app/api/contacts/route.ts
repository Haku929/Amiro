import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Contact } from "@/lib/types";

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

    const { data: rows, error } = await supabase
      .from("contacts")
      .select("other_user_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch contacts" },
        { status: 500 }
      );
    }

    if (!rows?.length) {
      return NextResponse.json([]);
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in(
        "user_id",
        rows.map((r) => r.other_user_id)
      );

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.user_id, p])
    );

    const body: Contact[] = rows.map((r) => {
      const p = profileMap.get(r.other_user_id);
      return {
        userId: r.other_user_id,
        displayName: p?.display_name ?? "",
        avatarUrl: p?.avatar_url ?? null,
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

    let body: { otherUserId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const otherUserId = body.otherUserId;
    if (typeof otherUserId !== "string" || !otherUserId) {
      return NextResponse.json(
        { error: "otherUserId is required" },
        { status: 400 }
      );
    }

    if (otherUserId === user.id) {
      return NextResponse.json(
        { error: "Cannot add yourself" },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from("contacts").upsert(
      {
        user_id: user.id,
        other_user_id: otherUserId,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,other_user_id",
        ignoreDuplicates: false,
      }
    );

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to add contact" },
        { status: 500 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .eq("user_id", otherUserId)
      .single();

    const contact: Contact = {
      userId: otherUserId,
      displayName: profile?.display_name ?? "",
      avatarUrl: profile?.avatar_url ?? null,
    };

    return NextResponse.json(contact);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
