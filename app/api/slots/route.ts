import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  parseSaveSlotBody,
  buildSlot,
} from "@/lib/slot-request";

/**
 * ユーザーの全スロットデータを取得する。
 * @returns 200: `Slot[]`. 401: `{ error: "Unauthorized" }`. 500: `{ error: "Internal server error" }`.
 */
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

    const { data: slots, error: selectError } = await supabase
      .from("slots")
      .select("*")
      .eq("user_id", user.id)
      .order("slot_index", { ascending: true });

    if (selectError) {
      console.error("GET /api/slots: Failed to fetch slots", selectError);
      return NextResponse.json(
        { error: "Failed to fetch slots" },
        { status: 500 }
      );
    }

    // DBのカラム名(snake_case)からフロントエンドの型(camelCase)へ変換
    const result = (slots || []).map((s: any) => ({
      slotIndex: s.slot_index,
      selfVector: s.self_vector,
      resonanceVector: s.resonance_vector,
      personaIcon: s.persona_icon,
      personaSummary: s.persona_summary,
      createdAt: s.created_at,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/slots: Internal server error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 空いているスロット（1〜3のうち未使用）に新規分人データを保存する。
 * @param request - JSON body: SaveSlotRequest (selfVector, resonanceVector, personaIcon, personaSummary). Auth required.
 * @returns 201: `Slot`. 401: `{ error: "Unauthorized" }`. 400: `{ error: "Invalid request body" }`. 409: `{ error: "No slot available" }`. 500: `{ error: "Failed to save slot" }` or `{ error: "Internal server error" }`.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("POST /api/slots: Unauthorized", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = parseSaveSlotBody(body);
    if (!parsed) {
      console.error("POST /api/slots: Invalid body", body);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { data: existing, error: selectError } = await supabase
      .from("slots")
      .select("slot_index")
      .eq("user_id", user.id);

    if (selectError) {
      console.error("POST /api/slots: Failed to check existing slots", selectError);
      return NextResponse.json(
        { error: "Failed to check existing slots" },
        { status: 500 }
      );
    }

    const used = new Set((existing ?? []).map((r) => r.slot_index));
    const slotIndex = ([1, 2, 3] as const).find((i) => !used.has(i));
    if (slotIndex === undefined) {
      return NextResponse.json(
        { error: "No slot available" },
        { status: 409 }
      );
    }

    // Convert Big5Vector object to array string for pgvector: '[o, c, e, a, n]'
    const toVectorString = (v: any) => {
      // Order: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
      const arr = [v.o, v.c, v.e, v.a, v.n];
      return JSON.stringify(arr);
    };

    const createdAt = new Date().toISOString();
    const { error: insertError } = await supabase.from("slots").insert({
      user_id: user.id,
      slot_index: slotIndex,
      self_vector: toVectorString(parsed.selfVector), 
      resonance_vector: toVectorString(parsed.resonanceVector),
      persona_icon: parsed.personaIcon,
      persona_summary: parsed.personaSummary,
      created_at: createdAt,
    });

    if (insertError) {
      console.error("POST /api/slots: Failed to insert slot", insertError);
      return NextResponse.json(
        { error: `Failed to save slot: ${insertError.message || JSON.stringify(insertError)}` },
        { status: 500 }
      );
    }

    const slot = buildSlot(slotIndex, parsed, createdAt);
    return NextResponse.json(slot, { status: 201 });
  } catch (err) {
    console.error("POST /api/slots: Internal server error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
