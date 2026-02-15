"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const BIG5_ITEMS = [
  { key: "o", label: "開放性", desc: "新しいこと・芸術・想像力への興味の度合い" },
  { key: "c", label: "誠実性", desc: "計画的さ・責任感・自制心の強さ" },
  { key: "e", label: "外向性", desc: "人との関わり・活発さ・ポジティブ感情の傾向" },
  { key: "a", label: "協調性", desc: "信頼・協力・優しさといった対人姿勢" },
  { key: "n", label: "神経症傾向", desc: "感情の揺れ・不安・ストレスへの反応の強さ" },
] as const;

type Big5ExplanationProps = {
  className?: string;
  variant?: "inline" | "compact";
};

export function Big5Explanation({ className, variant = "inline" }: Big5ExplanationProps) {
  return (
    <details
      className={cn(
        "group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 min-w-[280px] max-w-full",
        className
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 [&::-webkit-details-marker]:hidden">
        <Info className="h-5 w-5 shrink-0" aria-hidden />
        <span>Big5とは</span>
      </summary>
      <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <p className="mb-4 text-base font-medium text-zinc-800 dark:text-zinc-200">
          性格を5つの軸で表した心理学のモデル（OCEAN）です。
        </p>
        <ul className={variant === "compact" ? "space-y-2" : "grid gap-3 sm:grid-cols-2 space-y-0"}>
          {BIG5_ITEMS.map(({ key, label, desc }) => (
            <li key={key} className="flex flex-col gap-0.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">{label}</span>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
