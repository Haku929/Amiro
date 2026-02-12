import { NextResponse } from "next/server";
import { getChatReply } from "@/lib/ai/chat";
import type { Big5Vector } from "@/lib/types";

type ChatRequestBody = {
  messages?: unknown;
  situation?: unknown;
  mirrorBig5?: unknown;
};

function isBig5Vector(v: unknown): v is Big5Vector {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  const keys = ["o", "c", "e", "a", "n"] as const;
  for (const k of keys) {
    if (typeof o[k] !== "number" || (o[k] as number) < 0 || (o[k] as number) > 1)
      return false;
  }
  return true;
}

function parseMessage(m: unknown): { role: "user" | "model"; content: string } | null {
  if (!m || typeof m !== "object") return null;
  const o = m as Record<string, unknown>;
  if (o.role !== "user" && o.role !== "model") return null;
  if (typeof o.content !== "string") return null;
  return { role: o.role as "user" | "model", content: o.content };
}

/**
 * POST /api/ai/chat: 鏡のキャラで 1 発言を返す
 */
export async function POST(request: Request) {
  try {
    let body: ChatRequestBody;
    try {
      body = (await request.json()) as ChatRequestBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const situation =
      typeof body.situation === "string" && body.situation.trim()
        ? body.situation.trim()
        : null;
    if (!situation) {
      return NextResponse.json(
        { error: "situation is required (non-empty string)" },
        { status: 400 }
      );
    }

    if (!isBig5Vector(body.mirrorBig5)) {
      return NextResponse.json(
        { error: "mirrorBig5 is required (Big5Vector: o,c,e,a,n each 0-1)" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "messages must be an array" },
        { status: 400 }
      );
    }

    const messages: { role: "user" | "model"; content: string }[] = [];
    for (const m of body.messages) {
      const parsed = parseMessage(m);
      if (!parsed) {
        return NextResponse.json(
          { error: "Each message must have role (user|model) and content (string)" },
          { status: 400 }
        );
      }
      messages.push(parsed);
    }

    const content = await getChatReply(
      messages,
      situation,
      body.mirrorBig5 as Big5Vector
    );
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[POST /api/ai/chat]", err);
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}
