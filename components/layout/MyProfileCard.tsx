// components/layout/MyProfileCard.tsx
'use client';

import { User } from 'lucide-react';
import { Slot } from '@/lib/types';

const TRAIT_MAPPING = [
  { 
    key: 'e', label: '外向性', leftLabel: '内向', rightLabel: '外向',
    color: 'bg-orange-500 border-orange-600', barColor: 'bg-orange-50/50' 
  },
  { 
    key: 'a', label: '協調性', leftLabel: '独立', rightLabel: '協調',
    color: 'bg-emerald-500 border-emerald-600', barColor: 'bg-emerald-50/50' 
  },
  { 
    key: 'c', label: '勤勉性', leftLabel: '衝動', rightLabel: '計画',
    color: 'bg-blue-500 border-blue-600', barColor: 'bg-blue-50/50' 
  },
  { 
    key: 'n', label: '情動性', leftLabel: '安定', rightLabel: '敏感',
    color: 'bg-rose-500 border-rose-600', barColor: 'bg-rose-50/50' 
  },
  { 
    key: 'o', label: '創造性', leftLabel: '保守', rightLabel: '革新',
    color: 'bg-purple-500 border-purple-600', barColor: 'bg-purple-50/50' 
  },
] as const;

interface MyProfileCardProps {
  slots: Slot[];
  currentSlot: Slot;
  onSlotChange: (index: number) => void;
}

export default function MyProfileCard({ slots, currentSlot, onSlotChange }: MyProfileCardProps) {
  return (
    <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col xl:flex-row items-stretch gap-6">
        
        {/* 1. 左ブロック：基本情報 & スイッチ (w-64でリストと統一) */}
        <div className="flex flex-col items-center justify-center gap-5 xl:w-72 shrink-0 xl:border-r xl:border-zinc-100 xl:pr-8">
          <div className="relative">
            <div className="w-20 h-20 bg-zinc-50 border-2 border-zinc-100 rounded-full flex items-center justify-center text-zinc-400 shadow-sm">
              <User strokeWidth={1.5} size={40} />
            </div>
          </div>
          
          <div className="text-center w-full">
            <h2 className="text-2xl font-bold text-zinc-900">あなた</h2>
            <div className="flex gap-2.5 mt-4 flex-wrap justify-center">
              {slots.map((slot) => (
                <button
                  key={slot.slotIndex}
                  onClick={() => onSlotChange(slot.slotIndex)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all border ${
                    currentSlot.slotIndex === slot.slotIndex
                      ? 'bg-zinc-800 text-white border-zinc-800 shadow-md transform scale-105'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  分人{slot.slotIndex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 右ブロック：ベクトル表示 & 要約 */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* 上段: ベクトル2カラム */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* 自己ベクトル */}
            <div className="flex-1 bg-zinc-50/50 rounded-xl p-5 border border-zinc-200">
              <p className="text-xs font-bold text-zinc-600 border-b border-zinc-200 pb-2.5 mb-3.5 text-center tracking-wider">
                自己ベクトル (現実)
              </p>
              <div className="space-y-4">
                {TRAIT_MAPPING.map((trait) => {
                  const val = (currentSlot.selfVector[trait.key] ?? 0.5) * 100;
                  return (
                    <div key={`my-self-${trait.key}`} className="relative h-6">
                      <div className="relative flex justify-between items-end mb-1 px-1 h-4">
                        <span className="text-[10px] text-zinc-400 font-medium">{trait.leftLabel}</span>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-xs font-bold text-zinc-600">
                          {trait.label}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">{trait.rightLabel}</span>
                      </div>

                      <div className={`h-2.5 w-full rounded-full relative ${trait.barColor}`}>
                         <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-zinc-300/40"></div>
                         {/* ドットを少し大きく w-3.5 h-3.5 */}
                         <div 
                           className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border shadow-sm ${trait.color}`}
                           style={{ left: `calc(${val}% - 7px)` }}
                         ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 共鳴ベクトル */}
            <div className="flex-1 bg-zinc-50/50 rounded-xl p-5 border border-zinc-200">
              <p className="text-xs font-bold text-zinc-600 border-b border-zinc-200 pb-2.5 mb-3.5 text-center tracking-wider">
                共鳴ベクトル (理想)
              </p>
              <div className="space-y-4">
                {TRAIT_MAPPING.map((trait) => {
                  const val = (currentSlot.resonanceVector[trait.key] ?? 0.5) * 100;
                  return (
                    <div key={`my-res-${trait.key}`} className="relative h-6">
                      <div className="relative flex justify-between items-end mb-1 px-1 h-4">
                        <span className="text-[10px] text-zinc-400 font-medium">{trait.leftLabel}</span>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-xs font-bold text-zinc-600">
                          {trait.label}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">{trait.rightLabel}</span>
                      </div>

                      <div className={`h-2.5 w-full rounded-full relative ${trait.barColor}`}>
                         <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-zinc-300/40"></div>
                         {/* ドットを少し大きく w-3.5 h-3.5 */}
                         <div 
                           className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border shadow-sm ${trait.color}`}
                           style={{ left: `calc(${val}% - 7px)` }}
                         ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 下段: 要約文 */}
          <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
            <p className="text-xs font-semibold text-zinc-400 mb-1.5">分人要約文</p>
            <p className="text-base text-zinc-700 leading-relaxed line-clamp-3">
              {currentSlot.personaSummary}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}