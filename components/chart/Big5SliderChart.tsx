"use client";

import React from "react";
import { Big5Vector } from "@/lib/types";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Constants / Definitions
// -----------------------------------------------------------------------------

// Labels directly from the reference image
const TRAIT_CONFIG = [
  { 
    key: "e", 
    label: "外向性", 
    left: "外向(E)", 
    right: "内向(I)", 
    color: "bg-orange-500", 
    lightColor: "bg-orange-100",
    dotColor: "bg-orange-500",
    mirrorDotColor: "bg-orange-200 border-orange-500" 
  },
  { 
    key: "a", 
    label: "協調性", 
    left: "協調(A)", 
    right: "排他(H)", 
    color: "bg-emerald-500", 
    lightColor: "bg-emerald-100",
    dotColor: "bg-emerald-500",
    mirrorDotColor: "bg-emerald-200 border-emerald-500"
  },
  { 
    key: "c", 
    label: "勤勉性", 
    left: "勤勉(C)", 
    right: "怠惰(R)", 
    color: "bg-blue-500", 
    lightColor: "bg-blue-100",
    dotColor: "bg-blue-500",
    mirrorDotColor: "bg-blue-200 border-blue-500"
  },
  { 
    key: "n", 
    label: "情動性", 
    left: "論理(N)", 
    right: "情動(T)", 
    color: "bg-rose-500", 
    lightColor: "bg-rose-100",
    dotColor: "bg-rose-500",
    mirrorDotColor: "bg-rose-200 border-rose-500"
  },
  { 
    key: "o", 
    label: "創造性", 
    left: "創造(O)", 
    right: "保守(S)", 
    color: "bg-purple-500", 
    lightColor: "bg-purple-100",
    dotColor: "bg-purple-500",
    mirrorDotColor: "bg-purple-200 border-purple-500"
  },
] as const;

type SliderRowProps = {
  config: typeof TRAIT_CONFIG[number];
  selfValue: number;
  mirrorValue: number;
};

const SliderRow = ({ config, selfValue, mirrorValue }: SliderRowProps) => {
  // Ensure values are 0-1
  const sVal = Math.max(0, Math.min(1, selfValue));
  const mVal = Math.max(0, Math.min(1, mirrorValue));

  const renderTooltip = (val: number) => {
    const rightPct = Math.round(val * 100);
    const leftPct = 100 - rightPct;
    const isRightDominant = rightPct >= 50;

    return (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-popover text-popover-foreground text-xs rounded shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className={cn("flex justify-between gap-3", !isRightDominant && "font-bold text-red-500")}>
          <span>{config.left}</span>
          <span>{leftPct}%</span>
        </div>
        <div className={cn("flex justify-between gap-3", isRightDominant && "font-bold text-red-500")}>
          <span>{config.right}</span>
          <span>{rightPct}%</span>
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover" />
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Label Row */}
      <div className="flex justify-between items-end text-sm">
        <span className="text-muted-foreground text-xs w-16 text-left">{config.left}</span>
        <span className="font-bold text-foreground">{config.label}</span>
        <span className="text-muted-foreground text-xs w-16 text-right">{config.right}</span>
      </div>

      {/* Slider Track Area */}
      <div className="relative h-10 flex items-center"> {/* Increased height for hit area/tooltip space */}
        {/* Background Track Line */}
        <div className={cn("absolute w-full h-1.5 rounded-full", config.lightColor)} />

        {/* Mirror Dot (AI) */}
        <div 
          className={cn(
            "absolute w-5 h-5 rounded-full border-2 transform -translate-x-1/2 transition-all duration-700 shadow-sm z-10 group cursor-help",
            config.mirrorDotColor
          )}
          style={{ left: `${mVal * 100}%` }}
        >
          {renderTooltip(mVal)}
        </div>

        {/* Self Dot (User) */}
        <div 
          className={cn(
            "absolute w-5 h-5 rounded-full transform -translate-x-1/2 transition-all duration-700 shadow-sm z-20 group cursor-help",
            config.dotColor
          )}
          style={{ left: `${sVal * 100}%` }}
        >
          {renderTooltip(sVal)}
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

type Big5SliderChartProps = {
  selfVector: Big5Vector;
  resonanceVector: Big5Vector;
  className?: string;
};

export function Big5SliderChart({ selfVector, resonanceVector, className }: Big5SliderChartProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Legend */}
      <div className="flex justify-center items-center gap-6 text-xs text-muted-foreground bg-muted/30 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="block w-3 h-3 rounded-full bg-slate-500"></span>
          <span>あなた (Self)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="block w-3 h-3 rounded-full bg-slate-200 border border-slate-400"></span>
          <span>鏡 (Mirror)</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {TRAIT_CONFIG.map((config) => (
          <SliderRow 
            key={config.key} 
            config={config} 
            selfValue={selfVector[config.key as keyof Big5Vector]} 
            mirrorValue={resonanceVector[config.key as keyof Big5Vector]} 
          />
        ))}
      </div>
    </div>
  );
}
