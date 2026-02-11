import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in the environment");
}

const client = new GoogleGenerativeAI(apiKey);

// このプロジェクトで標準的に使う Gemini モデル名
export const GEMINI_MODEL_NAME = "gemini-2.5-flash";

// 生のクライアント（必要に応じて他のモデルも取得できる）
export function getGeminiClient() {
  return client;
}

// よく使う「テキスト用モデル」をすぐに取得するためのヘルパー
export function getFlashModel() {
  return client.getGenerativeModel({ model: GEMINI_MODEL_NAME });
}

