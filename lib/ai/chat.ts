/**
 * 鏡キャラで 1 発言を返すチャットロジック
 * issue: [AI] 5. POST /api/ai/chat
 */

import type { Content } from "@google/generative-ai";
import { getFlashModel } from "@/lib/gemini";
import { buildChatSystemPrompt } from "@/lib/prompts/chat";
import type { Big5Vector } from "@/lib/types";

export type ChatMessage = {
  role: "user" | "model";
  content: string;
};

/**
 * 会話履歴とシチュエーション・鏡の Big5 を受け取り、鏡の 1 発言を返す
 */
export async function getChatReply(
  messages: ChatMessage[],
  situation: string,
  mirrorBig5: Big5Vector
): Promise<string> {
  const model = getFlashModel();
  const systemInstruction = buildChatSystemPrompt(situation, mirrorBig5);

  const contents: Content[] = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContent({
    contents,
    systemInstruction,
  });

  const text =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (text == null || text === "") {
    throw new Error("Empty reply from Gemini");
  }
  return text;
}
