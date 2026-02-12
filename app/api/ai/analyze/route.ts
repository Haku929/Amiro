import { NextResponse } from "next/server";
import { analyzeFromMessages } from "@/lib/ai/analyze";
import type { AnalyzeMessage } from "@/lib/prompts/analyze";

/** POST /api/ai/analyze: 会話ログから selfVector と personaSummary を返す */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: unknown };
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages must be a non-empty array" },
        { status: 400 }
      );
    }

    const typedMessages: AnalyzeMessage[] = [];
    for (const m of messages) {
      if (
        m &&
        typeof m === "object" &&
        "role" in m &&
        "content" in m &&
        (m.role === "user" || m.role === "model") &&
        typeof (m as { content: unknown }).content === "string"
      ) {
        typedMessages.push({
          role: m.role,
          content: (m as { content: string }).content,
        });
      } else {
        return NextResponse.json(
          { error: "Each message must have role (user|model) and content (string)" },
          { status: 400 }
        );
      }
    }

    const result = await analyzeFromMessages(typedMessages);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/ai/analyze]", err);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
