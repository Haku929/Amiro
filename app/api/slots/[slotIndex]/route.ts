import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseSaveSlotBody, buildSlot } from "@/lib/slot-request";

function parseSlotIndex(value: string): (1 | 2 | 3) | null {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 3) return n as 1 | 2 | 3;
  return null;
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slotIndex: string }> }
) {
  try {
    const { slotIndex: slotIndexParam } = await context.params;
    const slotIndex = parseSlotIndex(slotIndexParam);
    if (slotIndex === null) {
      return NextResponse.json(
        { error: "Invalid slot index" },
        { status: 400 }
      );
    }

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

    const { data: existing, error: selectError } = await supabase
      .from("slots")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("slot_index", slotIndex)
      .maybeSingle();

    if (selectError || existing === null) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("slots")
      .update({
        self_vector: parsed.selfVector,
        resonance_vector: parsed.resonanceVector,
        persona_icon: parsed.personaIcon,
        persona_summary: parsed.personaSummary,
      })
      .eq("user_id", user.id)
      .eq("slot_index", slotIndex);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update slot" },
        { status: 500 }
      );
    }

    const slot = buildSlot(slotIndex, parsed, existing.created_at);
    return NextResponse.json(slot, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
