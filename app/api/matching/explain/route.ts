import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResonanceExplanation } from "@/lib/ai/explain";
import type { Big5Vector } from "@/lib/types";

type SlotRow = {
  slot_index: number;
  self_vector: Big5Vector;
  resonance_vector: Big5Vector;
  persona_icon: string;
  persona_summary: string;
  created_at: string;
};

function slotRowToExplain(row: SlotRow) {
  return {
    selfVector: row.self_vector,
    resonanceVector: row.resonance_vector,
    personaSummary: row.persona_summary,
  };
}

/**
 * POST /api/matching/explain: 二人の関係性を AI が解説
 * body: { otherUserId: string, matchedSlotIndexSelf?: number, matchedSlotIndexOther?: number }
 */
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

    let body: { otherUserId?: unknown; matchedSlotIndexSelf?: number; matchedSlotIndexOther?: number };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const otherUserId =
      typeof body.otherUserId === "string" && body.otherUserId.trim()
        ? body.otherUserId.trim()
        : null;
    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId is required (non-empty string)" },
        { status: 400 }
      );
    }

    const slotSelf = Math.min(3, Math.max(1, body.matchedSlotIndexSelf ?? 1));
    const slotOther = Math.min(3, Math.max(1, body.matchedSlotIndexOther ?? 1));

    const { data: selfRows } = await supabase
      .from("slots")
      .select("slot_index, self_vector, resonance_vector, persona_icon, persona_summary, created_at")
      .eq("user_id", user.id)
      .eq("slot_index", slotSelf)
      .maybeSingle();

    const { data: otherRows } = await supabase
      .from("slots")
      .select("slot_index, self_vector, resonance_vector, persona_icon, persona_summary, created_at")
      .eq("user_id", otherUserId)
      .eq("slot_index", slotOther)
      .maybeSingle();

    const selfRow = selfRows as SlotRow | null;
    const otherRow = otherRows as SlotRow | null;

    if (!selfRow) {
      return NextResponse.json(
        { error: "Self slot not found for the given index" },
        { status: 404 }
      );
    }
    if (!otherRow) {
      return NextResponse.json(
        { error: "Other user slot not found" },
        { status: 404 }
      );
    }

    const explanation = await getResonanceExplanation(
      slotRowToExplain(selfRow),
      slotRowToExplain(otherRow)
    );

    return NextResponse.json(explanation);
  } catch (err) {
    console.error("[POST /api/matching/explain]", err);
    return NextResponse.json(
      { error: "Explanation failed" },
      { status: 500 }
    );
  }
}
