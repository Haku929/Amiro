/**
 * 会話ログから selfVector と personaSummary を返す分析ロジック
 * issue: ai_analyze_self / ai_prompts
 */

import {
  type ObjectSchema as GeminiObjectSchema,
  SchemaType,
} from "@google/generative-ai";
import { z } from "zod";
import { getGeminiClient } from "@/lib/gemini";
import { GEMINI_MODEL_NAME } from "@/lib/gemini";
import { buildAnalyzePrompt, type AnalyzeMessage } from "@/lib/prompts/analyze";
import type { Big5Vector } from "@/lib/types";

const MAX_RETRIES = 2;

/** Gemini 用の JSON 出力スキーマ（selfVector + personaSummary） */
const analyzeResponseSchema: GeminiObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    selfVector: {
      type: SchemaType.OBJECT,
      properties: {
        o: { type: SchemaType.NUMBER },
        c: { type: SchemaType.NUMBER },
        e: { type: SchemaType.NUMBER },
        a: { type: SchemaType.NUMBER },
        n: { type: SchemaType.NUMBER },
      },
      required: ["o", "c", "e", "a", "n"],
    },
    personaSummary: { type: SchemaType.STRING },
  },
  required: ["selfVector", "personaSummary"],
};

/** 分析結果の Zod スキーマ（0〜1 の範囲チェック） */
const big5Schema = z
  .object({
    o: z.number().min(0).max(1),
    c: z.number().min(0).max(1),
    e: z.number().min(0).max(1),
    a: z.number().min(0).max(1),
    n: z.number().min(0).max(1),
  })
  .strict();

const analyzeResultSchema = z
  .object({
    selfVector: big5Schema,
    personaSummary: z.string(),
  })
  .strict();

export type AnalyzeResult = {
  selfVector: Big5Vector;
  personaSummary: string;
};

/**
 * 会話ログを渡し、Gemini で Big5 と要約を推定して返す。
 * 検証失敗時はリトライ（最大 MAX_RETRIES 回）、それでも失敗ならエラーを投げる。
 */
export async function analyzeFromMessages(
  messages: AnalyzeMessage[]
): Promise<AnalyzeResult> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: analyzeResponseSchema,
    },
  });

  const prompt = buildAnalyzePrompt(messages);
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) {
        throw new Error("Empty response from Gemini");
      }
      const parsed = JSON.parse(text) as unknown;
      const validated = analyzeResultSchema.parse(parsed);
      return {
        selfVector: validated.selfVector,
        personaSummary: validated.personaSummary,
      };
    } catch (err) {
      lastError = err;
      if (attempt === MAX_RETRIES) break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError));
}
