/**
 * 共鳴詳細：二人の関係性を AI が解説するロジック
 * issue: [AI] 6. 共鳴詳細用プロンプト #55
 */

import { getFlashModel } from "@/lib/gemini";
import { buildExplainPrompt, type SlotInfoForExplain } from "@/lib/prompts/explain";

/**
 * 自分側・相手側のスロット情報を受け取り、「なぜこの二人だと好きな自分でいられるか」を
 * 2〜3 文の解説文で返す
 */
export async function getResonanceExplanation(
  selfSlot: SlotInfoForExplain,
  otherSlot: SlotInfoForExplain
): Promise<{ explanation: string }> {
  const model = getFlashModel();
  const prompt = buildExplainPrompt(selfSlot, otherSlot);

  const result = await model.generateContent(prompt);
  const text =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (text == null || text === "") {
    throw new Error("Empty explanation from Gemini");
  }

  return { explanation: text };
}
