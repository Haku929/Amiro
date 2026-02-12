// components/layout/MyProfileCard.tsx
'use client';

import { User, ChevronDown } from 'lucide-react';
import { Slot, Big5Vector } from '@/lib/types';

// 定数定義（MatchingContainerと共通化が望ましいが、ここでは再定義）
const VECTOR_TRAITS = ['神経症傾向', '誠実性', '外向性', '協調性', '開放性'] as const;
const VECTOR_KEYS: (keyof Big5Vector)[] = ['n', 'c', 'e', 'a', 'o'];

interface MyProfileCardProps {
  slots: Slot[];
  currentSlot: Slot;
  onSlotChange: (slotIndex: number) => void;
}

export default function MyProfileCard({ slots, currentSlot, onSlotChange }: MyProfileCardProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-zinc-100 border-2 border-white rounded-full flex items-center justify-center text-zinc-400 shadow-md mb-4 ring-4 ring-zinc-50">
          <User strokeWidth={1.5} size={48} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">あなた</h2>
        
        <div className="mt-3 relative inline-block group">
          <select 
            value={currentSlot.slotIndex}
            onChange={(e) => onSlotChange(Number(e.target.value))}
            className="appearance-none bg-zinc-100 text-sm font-bold text-zinc-700 py-2 pl-5 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer border border-zinc-200 hover:bg-zinc-200 hover:text-zinc-900 transition-all shadow-sm"
          >
            {slots.map(slot => (
              <option key={slot.slotIndex} value={slot.slotIndex}>分人 {slot.slotIndex}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 group-hover:text-zinc-900 transition-colors">
            <ChevronDown size={16} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 左: 自己ベクトル */}
        <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
          <p className="text-sm font-bold text-zinc-600 text-center border-b border-zinc-200 pb-2">自己ベクトル</p>
          <div className="space-y-2">
            {VECTOR_TRAITS.map((trait, idx) => (
              <div key={`my-self-${trait}`} className="flex justify-between items-center text-sm text-zinc-600 px-1">
                <span>{trait}</span>
                <span className="font-mono bg-zinc-200/50 px-2 py-0.5 rounded-md">
                  {/* オブジェクト形式の値(0.0-1.0)を%表記に変換 */}
                  {Math.round((currentSlot.selfVector[VECTOR_KEYS[idx]] ?? 0.5) * 100)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 右: 共鳴ベクトル */}
        <div className="space-y-3 bg-rose-50/50 p-4 rounded-2xl border border-rose-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-400 rounded-l-2xl"></div>
          <p className="text-sm font-bold text-rose-800 text-center border-b border-rose-200 pb-2">共鳴ベクトル</p>
          <div className="space-y-2">
            {VECTOR_TRAITS.map((trait, idx) => (
              <div key={`my-res-${trait}`} className="flex justify-between items-center text-sm text-rose-900 font-medium px-1">
                <span>{trait}</span>
                <span className="font-mono bg-rose-100/80 px-2 py-0.5 rounded-md">
                  {Math.round((currentSlot.resonanceVector[VECTOR_KEYS[idx]] ?? 0.5) * 100)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
        <p className="text-xs font-semibold text-zinc-400 mb-2 text-center tracking-widest">分人要約文</p>
        <p className="text-sm text-zinc-700 leading-relaxed text-center">
          {currentSlot.personaSummary}
        </p>
      </div>
    </div>
  );
}