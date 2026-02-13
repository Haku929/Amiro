import { describe, it, expect } from "vitest";
import { buildExplainPrompt, type SlotInfoForExplain } from "@/lib/prompts/explain";

const selfSlot: SlotInfoForExplain = {
  selfVector: { o: 0.8, c: 0.5, e: 0.6, a: 0.7, n: 0.3 },
  resonanceVector: { o: 0.7, c: 0.6, e: 0.5, a: 0.8, n: 0.2 },
  personaSummary: "自分らしく話せる相手と居たい",
};

const otherSlot: SlotInfoForExplain = {
  selfVector: { o: 0.7, c: 0.6, e: 0.5, a: 0.8, n: 0.2 },
  resonanceVector: { o: 0.8, c: 0.5, e: 0.6, a: 0.7, n: 0.3 },
  personaSummary: "相手の話を丁寧に聴き、共感を示す傾向",
};

describe("buildExplainPrompt", () => {
  it("returns a string with 自分側 and 相手側 sections", () => {
    const prompt = buildExplainPrompt(selfSlot, otherSlot);
    console.log(JSON.stringify({ prompt }, null, 2));
    expect(prompt).toContain("### 自分側（ユーザー）");
    expect(prompt).toContain("### 相手側");
  });

  it("includes formatted Big5 for self and other", () => {
    const prompt = buildExplainPrompt(selfSlot, otherSlot);
    expect(prompt).toContain("開放性=0.80");
    expect(prompt).toContain("誠実性=0.50");
    expect(prompt).toContain("神経症傾向=0.30");
    expect(prompt).toContain("神経症傾向=0.20");
  });

  it("includes personaSummary for both slots", () => {
    const prompt = buildExplainPrompt(selfSlot, otherSlot);
    expect(prompt).toContain(selfSlot.personaSummary);
    expect(prompt).toContain(otherSlot.personaSummary);
  });

  it("includes instruction for 2〜3 文 and 好きな自分", () => {
    const prompt = buildExplainPrompt(selfSlot, otherSlot);
    expect(prompt).toContain("2〜3 文");
    expect(prompt).toContain("好きな自分");
  });
});

describe.skipIf(!process.env.GEMINI_API_KEY)("getResonanceExplanation", () => {
  it(
    "returns explanation and logs prompt and response",
    async () => {
      const prompt = buildExplainPrompt(selfSlot, otherSlot);
      console.log(JSON.stringify({ prompt }, null, 2));
      const { getResonanceExplanation } = await import("@/lib/ai/explain");
      const response = await getResonanceExplanation(selfSlot, otherSlot);
      console.log(JSON.stringify(response, null, 2));
      expect(response).toHaveProperty("explanation");
      expect(typeof response.explanation).toBe("string");
      expect(response.explanation.length).toBeGreaterThan(0);
    },
    30000
  );
});
