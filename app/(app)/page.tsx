// app/(app)/page.tsx
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// -----------------------------------------------------------------------------
// Helper: Seeded Random Generator (Linear Congruential Generator)
// -----------------------------------------------------------------------------
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // 0 から 1 の間の乱数を返す
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // min から max の間の乱数を返す
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // 正規分布 (Box-Muller Transform)
  // mean: 平均, stdDev: 標準偏差
  normal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next(); // 0を回避 (log(0)を防ぐ)
    while (v === 0) v = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  }
}

// 日付文字列 (YYYY-MM-DD) からシードを生成
function getSeedFromDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = Math.imul(31, h) + dateStr.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
type Big5 = { o: number; c: number; e: number; a: number; n: number };

type AiCard = {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorClass: string;
  situation: string;
  big5: Big5;
};

// -----------------------------------------------------------------------------
// Constants / Fallback Data
// -----------------------------------------------------------------------------
const TRAIT_LABELS = [
  { key: 'o', label: '創造性', color: 'bg-purple-500' },
  { key: 'c', label: '勤勉性', color: 'bg-blue-500' },
  { key: 'e', label: '外向性', color: 'bg-orange-500' },
  { key: 'a', label: '協調性', color: 'bg-emerald-500' },
  { key: 'n', label: '情動性', color: 'bg-rose-500' },
] as const;

const FALLBACK_SITUATIONS = [
  "新たな挑戦への第一歩",
  "心安らぐ対話の時間",
  "論理の整理と深掘り",
];

const CARD_TEMPLATES = [
  {
    name: "鏡のイロ A",
    description: "あなたの隠れた一面を映し出す鏡。深層心理に問いかけます。",
    icon: "🔮",
    colorClass: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  },
  {
    name: "鏡のイロ B",
    description: "あなたの感情に寄り添う鏡。日々の機微をすくい上げます。",
    icon: "🌸",
    colorClass: "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
  },
  {
    name: "鏡のイロ C",
    description: "あなたの理性を磨く鏡。思考の枠組みを広げます。",
    icon: "💎",
    colorClass: "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800",
  },
];

export default function HomePage() {
  const [cards, setCards] = useState<AiCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initGacha = async () => {
      try {
        // 1. 本日の日付(UTC)を取得してシードにする
        const now = new Date();
        const yyyy = now.getUTCFullYear();
        const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(now.getUTCDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const seed = getSeedFromDate(dateStr);
        const rng = new SeededRandom(seed);

        // 2. シチュエーションを取得 (API or Mock)
        let situations: string[] = [];
        try {
          // APIが503/500を返す可能性があるためtry-catch
          const res = await fetch(`/api/ai/situations?date=${dateStr}`);
          if (res.ok) {
            const data = await res.json();
            if (data.situations && Array.isArray(data.situations) && data.situations.length === 3) {
              situations = data.situations;
            }
          }
        } catch (e) {
          console.warn("Failed to fetch situations via API, using fallback.", e);
        }

        // 失敗時や不足時はフォールバックを使用 (インデックスはランダムではなく固定またはシード依存でもよいが、簡易的に固定リストfallback)
        if (situations.length < 3) {
          const indices = [0, 1, 2].map(i => Math.floor(rng.range(0, FALLBACK_SITUATIONS.length)));
          // 重複排除ロジックは簡易版では省略、またはFALLBACK順に割り当て
          situations = FALLBACK_SITUATIONS.slice(0, 3);
        }

        // 3. 3枚のカードを生成
        const newCards: AiCard[] = situations.map((situation, i) => {
          const template = CARD_TEMPLATES[i % CARD_TEMPLATES.length];

          // 正規分布でBig5を生成 (mean=0.5, stdDev=0.18, clamp 0.1~0.9)
          const generateTrait = () => {
            // 生成
            const val = rng.normal(0.5, 0.18);
            // クリップ (0.1 ~ 0.9)
            return Math.max(0.1, Math.min(0.9, val));
          };

          const big5: Big5 = {
            o: parseFloat(generateTrait().toFixed(2)),
            c: parseFloat(generateTrait().toFixed(2)),
            e: parseFloat(generateTrait().toFixed(2)),
            a: parseFloat(generateTrait().toFixed(2)),
            n: parseFloat(generateTrait().toFixed(2)),
          };

          return {
            id: `mirror-${i}`,
            name: template.name,
            description: template.description,
            icon: template.icon,
            colorClass: template.colorClass,
            situation: situation,
            big5: big5,
          };
        });

        setCards(newCards);
      } catch (err) {
        console.error("Gacha init failed", err);
      } finally {
        setLoading(false);
      }
    };

    initGacha();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-12">

      {/* ページヘッダー部分 */}
      <div className="text-center space-y-4">
        <Link href="/" className="inline-block mb-10">
          <img src="/amiro_logo.svg" alt="Amiro" className="h-[5.25rem] md:h-24 w-auto mx-auto" />
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100">今日の「鏡」を選ぶ</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          話してみたいAIを選択してください。<br />対話を通じて、相手の性格に響き合うあなたの新しい「イロ」を引き出します。
        </p>
      </div>

      {/* AIカード一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((ai) => {
          const query = new URLSearchParams({
            situation: ai.situation,
            s_o: ai.big5.o.toString(),
            o: ai.big5.o.toString(),
            c: ai.big5.c.toString(),
            e: ai.big5.e.toString(),
            a: ai.big5.a.toString(),
            n: ai.big5.n.toString(),
          });

          return (
            <div
              key={ai.id}
              className="h-full border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col items-center text-center space-y-6"
            >
              {/* アイコン部分 */}
              <div className={`w-36 h-36 rounded-full flex items-center justify-center text-7xl border ${ai.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                {ai.icon}
              </div>

              {/* テキスト部分 */}
              <div className="flex-grow space-y-3">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{ai.name}</h2>
                <div className="text-sm font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded inline-block text-zinc-500">
                  {ai.situation}
                </div>
                <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {ai.description}
                </p>
              </div>

              {/* アクションボタン (ホバーでBig5表示) */}
              <div className="w-full pt-4 mt-auto relative">
                <Link
                  href={`/chat?${query.toString()}`}
                  className="group/btn relative block w-full py-4 px-5 bg-zinc-900 dark:bg-zinc-700 text-white dark:text-zinc-100 text-base font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-colors shadow-sm"
                >
                  このAIと話す

                  {/* Big5 Tooltip (ボタンの下に表示) */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] w-64 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-700 opacity-0 invisible translate-y-2 group-hover/btn:opacity-100 group-hover/btn:visible group-hover/btn:translate-y-0 transition-all duration-300 z-50 pointer-events-none text-left">
                    {/* 装飾: 吹き出しの三角 */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-white dark:bg-zinc-800 border-t border-l border-zinc-100 dark:border-zinc-700 transform rotate-45"></div>

                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 text-center mb-2 border-b border-zinc-50 dark:border-zinc-700 pb-2">性格特性 (Big5)</p>
                    <div className="space-y-2.5">
                      {TRAIT_LABELS.map((trait) => {
                        // @ts-ignore
                        const val = ai.big5[trait.key] * 100;
                        return (
                          <div key={trait.key} className="flex items-center gap-2 text-xs">
                            <span className="w-8 text-right text-zinc-500 dark:text-zinc-400 font-mono scale-90">{trait.key.toUpperCase()}</span>

                            {/* バーではなく点で表示 */}
                            <div className="flex-1 relative h-4 flex items-center">
                              {/* 背景線 */}
                              <div className="absolute w-full h-0.5 bg-zinc-100 dark:bg-zinc-700 rounded-full"></div>
                              {/* ドット */}
                              <div
                                className={`absolute w-3 h-3 rounded-full border border-white dark:border-zinc-800 shadow-sm ${trait.color}`}
                                style={{ left: `calc(${val}% - 6px)` }}
                              ></div>
                            </div>

                            <span className="w-6 text-right text-zinc-400 dark:text-zinc-500 font-mono scale-90">{Math.round(val)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  );
}