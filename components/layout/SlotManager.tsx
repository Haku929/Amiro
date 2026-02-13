// components/layout/SlotManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Slot, Big5Vector } from '@/lib/types';
import { User, Trash2, RefreshCw, Plus } from 'lucide-react';

const MAX_SLOTS = 3;

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

// ▼ モックデータ削除

export default function SlotManager() {
  const [slots, setSlots] = useState<Record<number, Slot | null>>({
    1: null, 2: null, 3: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Helper to parse vector (string or array) to Big5 object
  const parseVector = (v: any) => {
      let arr = v;
      if (typeof v === 'string') {
        try {
          arr = JSON.parse(v);
        } catch (e) {
          console.error("Failed to parse vector string", v);
          arr = []; // Fallback
        }
      }
      if (Array.isArray(arr) && arr.length >= 5) {
        // Order: O, C, E, A, N (must match toVectorString in POST)
        return { o: arr[0], c: arr[1], e: arr[2], a: arr[3], n: arr[4] };
      }
      // Check if it's already an object
      if (typeof v === 'object' && v !== null && 'o' in v) {
          return v;
      }
      // Default fallback
      return { o: 0.5, c: 0.5, e: 0.5, a: 0.5, n: 0.5 };
  };

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/slots');
      if (!res.ok) throw new Error('Failed to fetch slots');
      const rawData: any[] = await res.json();
      
      const slotsMap: Record<number, Slot | null> = { 1: null, 2: null, 3: null };
      rawData.forEach((s: any) => {
        if (s.slotIndex >= 1 && s.slotIndex <= MAX_SLOTS) {
          // Parse vectors here
          const slot: Slot = {
              ...s,
              selfVector: parseVector(s.selfVector),
              resonanceVector: parseVector(s.resonanceVector),
          };
          slotsMap[slot.slotIndex] = slot;
        }
      });
      setSlots(slotsMap);
    } catch (error) {
      console.error("スロットの取得に失敗しました", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleDeleteSlot = async (slotIndex: number) => {
    alert("削除機能は現在未実装です。");
    // Original implementation disabled as per request
    /*
    if (!confirm(`スロット${slotIndex}のデータを削除してもよろしいですか？`)) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/slots', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotIndex }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete slot');
      }

      await fetchSlots();
    } catch (error) {
      console.error("削除エラー", error);
      setIsLoading(false);
    }
    */
  };

  const activeSlotCount = Object.values(slots).filter(slot => slot !== null).length;

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* ヘッダーエリア */}
      <div className="flex justify-between items-center px-1 shrink-0">
        <h3 className="text-base font-bold text-zinc-700 flex items-center gap-2">
          マッチングスロット設定
          <span className="text-xs font-normal text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
            {activeSlotCount} / {MAX_SLOTS}
          </span>
        </h3>
        <button 
          onClick={fetchSlots} 
          disabled={isLoading}
          className="text-zinc-400 hover:text-zinc-700 transition-colors p-1.5 rounded-full hover:bg-zinc-100"
          title="データを再取得"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* スロットグリッド (h-full等を削除し、内容に合わせて伸縮) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((index) => {
          const slot = slots[index];

          // --- ケースA: データなし ---
          if (!slot) {
            return (
              <div key={index} className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-zinc-50/30 text-zinc-400 transition-colors hover:bg-zinc-50/60 min-h-[320px]">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                  <Plus size={20} className="text-zinc-300" />
                </div>
                <p className="text-sm font-bold text-zinc-500">Slot {index}</p>
                <p className="text-xs mt-1 text-center text-zinc-400">
                  未設定
                </p>
              </div>
            );
          }
          
          // --- ケースB: データあり ---
          return (
            <div key={index} className="relative border border-zinc-200 rounded-2xl p-4 shadow-sm bg-white flex flex-col hover:shadow-md transition-shadow group">
              
              {/* スロット番号 & 日付 */}
              <div className="flex justify-between items-center mb-3">
                <span className="bg-zinc-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Slot {index}
                </span>
                <span className="text-[9px] text-zinc-300 font-mono">
                  {new Date(slot.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>

              {/* アイコン */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center text-zinc-500 shadow-sm group-hover:scale-105 transition-transform">
                  <User strokeWidth={1.5} size={24} />
                </div>
              </div>

              {/* ベクトル情報 (1カラム: 自己ベクトルのみ) */}
              <div className="mb-4">
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 text-center border-b border-zinc-100 pb-1 mb-2 tracking-wider">
                    自己 (Real)
                  </p>
                  <div className="space-y-2.5">
                    {TRAIT_MAPPING.map((trait) => {
                      const val = (slot.selfVector[trait.key] ?? 0.5) * 100;
                      return (
                        <div key={`self-${trait.key}`} className="relative h-3">
                          <div className="relative flex justify-between items-end mb-0.5 px-0.5 h-2.5">
                            <span className="text-[8px] text-zinc-400 scale-90 origin-left">{trait.leftLabel}</span>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-[8px] font-bold text-zinc-600 scale-90">{trait.label}</span>
                            <span className="text-[8px] text-zinc-400 scale-90 origin-right">{trait.rightLabel}</span>
                          </div>
                          <div className={`h-1 w-full rounded-full relative ${trait.barColor}`}>
                             <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-zinc-300/40"></div>
                             <div 
                               className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border shadow-sm ${trait.color}`}
                               style={{ left: `calc(${val}% - 4px)` }}
                             ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 分人要約文 */}
              <div className="mb-4 flex-grow">
                <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-100">
                  <p className="text-[9px] font-bold text-zinc-400 mb-0.5">分人要約</p>
                  <p className="text-[10px] text-zinc-700 leading-relaxed line-clamp-3">
                    {slot.personaSummary}
                  </p>
                </div>
              </div>
              
              {/* フッター */}
              <div className="pt-2 border-t border-zinc-100 mt-auto flex justify-end">
                <button 
                  onClick={() => handleDeleteSlot(index)}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  title="削除"
                >
                  <Trash2 size={12} />
                  削除
                </button>
              </div>

              {isLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-2xl">
                  <div className="animate-spin text-zinc-400">
                    <RefreshCw size={20} />
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}