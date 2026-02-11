import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  parseSaveSlotBody,
  buildSlot,
} from "@/lib/slot-request";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = parseSaveSlotBody(body);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("slots")
      .select("slot_index")
      .eq("user_id", user.id);

    const used = new Set((existing ?? []).map((r) => r.slot_index));
    const slotIndex = ([1, 2, 3] as const).find((i) => !used.has(i));
    if (slotIndex === undefined) {
      return NextResponse.json(
        { error: "No slot available" },
        { status: 409 }
      );
    }

    const createdAt = new Date().toISOString();
    const { error: insertError } = await supabase.from("slots").insert({
      user_id: user.id,
      slot_index: slotIndex,
      self_vector: parsed.selfVector,
      resonance_vector: parsed.resonanceVector,
      persona_icon: parsed.personaIcon,
      persona_summary: parsed.personaSummary,
      created_at: createdAt,
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to save slot" },
        { status: 500 }
      );
    }

    const slot = buildSlot(slotIndex, parsed, createdAt);
    return NextResponse.json(slot, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
