"use client";

import React from "react";
import { Big5Vector } from "@/lib/types";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// 定数・ヘルパー
// -----------------------------------------------------------------------------

// ラベル定義
const BIG5_LABELS = {
  o: { label: "開放性", left: "保守的", right: "革新的", desc: "知的好奇心・独創性" },
  c: { label: "誠実性", left: "衝動的", right: "計画的", desc: "勤勉さ・規律性" },
  e: { label: "外向性", left: "内向的", right: "外向的", desc: "社交性・活発さ" },
  a: { label: "協調性", left: "独立的", right: "協調的", desc: "他者への配慮" },
  n: { label: "情緒", left: "安定", right: "敏感", desc: "感受性の強さ" },
};

// 特性ごとのカラー定義
// TailwindのJITコンパイラに認識させるため、文字列結合せず完全に記述します
const TRAIT_COLORS: Record<keyof Big5Vector, { self: string; mirror: string; text: string }> = {
  o: { self: "bg-purple-500/70", mirror: "bg-purple-500/30", text: "text-purple-500" },
  c: { self: "bg-blue-500/70",   mirror: "bg-blue-500/30",   text: "text-blue-500" },
  e: { self: "bg-orange-500/70", mirror: "bg-orange-500/30", text: "text-orange-500" },
  a: { self: "bg-green-500/70",  mirror: "bg-green-500/30",  text: "text-green-500" },
  n: { self: "bg-rose-500/70",   mirror: "bg-rose-500/30",   text: "text-rose-500" },
};

type SplitBarProps = {
  value: number;
  type: "self" | "mirror";
  traitKey: keyof Big5Vector;
};

const SplitBar = ({ value, type, traitKey }: SplitBarProps) => {
  const isSelf = type === "self";
  
  // 色の決定
  // 定義済みのクラスをそのまま使用する
  const activeColorClass = isSelf 
    ? TRAIT_COLORS[traitKey].self 
    : TRAIT_COLORS[traitKey].mirror;
  
  // 非アクティブ（短い方）の色
  const inactiveColorClass = "bg-slate-200 dark:bg-slate-700"; 

  // 描画ロジック
  const pointPos = value * 100;
  const isLeftActive = value >= 0.5;

  return (
    <div className="relative h-3 w-full rounded-full overflow-hidden flex">
      {/* 左側の区間 */}
      <div 
        className={cn(
          "h-full transition-all duration-700",
          isLeftActive ? activeColorClass : inactiveColorClass
        )}
        style={{ width: `${pointPos}%` }}
      />

      {/* 右側の区間 */}
      <div 
        className={cn(
          "h-full flex-1 transition-all duration-700",
          !isLeftActive ? activeColorClass : inactiveColorClass
        )}
      />
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

type Big5BarChartProps = {
  selfVector: Big5Vector;
  resonanceVector: Big5Vector;
  className?: string;
};

export function Big5BarChart({ selfVector, resonanceVector, className }: Big5BarChartProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* 凡例 */}
      <div className="flex justify-end items-center gap-4 text-xs mb-4">
        <span className="flex items-center gap-1">
          {/* Mirror: 薄いグレーの丸 */}
          <span className="block w-3 h-3 rounded-full bg-slate-300/50 border border-slate-300"></span>
          Mirror (共鳴)
        </span>
        <span className="flex items-center gap-1">
          {/* You: 濃いグレーの丸 */}
          <span className="block w-3 h-3 rounded-full bg-slate-600"></span>
          You (自己)
        </span>
      </div>

      {/* チャート本体 */}
      {(Object.keys(BIG5_LABELS) as (keyof Big5Vector)[]).map((key) => {
        const def = BIG5_LABELS[key];
        const colors = TRAIT_COLORS[key];

        return (
          <div key={key} className="space-y-2">
            {/* ラベル行 */}
            <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
              <span>{def.left}</span>
              <span className={cn("font-semibold", colors.text)}>
                {def.label}
              </span>
              <span>{def.right}</span>
            </div>
            
            {/* 2本のバーを表示 */}
            <div className="space-y-1.5">
              {/* 上段: Mirror (薄い同色) */}
              <div className="relative">
                <SplitBar value={resonanceVector[key]} type="mirror" traitKey={key} />
              </div>
              
              {/* 下段: Self (濃い同色) */}
              <div className="relative">
                <SplitBar value={selfVector[key]} type="self" traitKey={key} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}