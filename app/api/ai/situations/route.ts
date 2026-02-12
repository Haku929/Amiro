import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParam(value: string | null): string {
  if (value != null && ISO_DATE_REGEX.test(value)) {
    return value;
  }
  return new Date().toISOString().slice(0, 10);
}

function seedFromDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = Math.imul(31, h) + dateStr.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

function pickThreeIndices(seed: number, n: number): number[] {
  if (n < 3) return [];
  const indices: number[] = [];
  let s = seed;
  for (let i = 0; indices.length < 3; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    const idx = s % n;
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices;
}

/**
 * 指定日のシチュエーションをDBから取得し、日付シードで重複なく3件を選んで返す。ホームの「今日の3体」用。
 * @param request - URL query: `date` (optional) YYYY-MM-DD. Omit = today UTC.
 * @returns 200: `{ situations: string[] }` (length 3). 503: `{ error: "Failed to fetch situations" }` or `{ error: "Not enough situations in database" }`. 500: `{ error: "Internal server error" }`.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const dateStr = parseDateParam(searchParams.get("date"));
    const seed = seedFromDate(dateStr);

    const { data: rows, error } = await supabase
      .from("situations")
      .select("id, text")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch situations" },
        { status: 503 }
      );
    }

    const list = (rows ?? []).map((r: { id: number; text: string }) => r.text);
    if (list.length < 3) {
      return NextResponse.json(
        { error: "Not enough situations in database" },
        { status: 503 }
      );
    }

    const indices = pickThreeIndices(seed, list.length);
    const situations = indices.map((i) => list[i]);

    return NextResponse.json({ situations });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
