// components/layout/SlotManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Slot, Big5Vector } from '@/lib/types';
import { User, Trash2, RefreshCw, Plus } from 'lucide-react';

const MAX_SLOTS = 3;

// 詳細ページと統一したマッピング定義
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

// ▼ モックデータ
const MOCK_DB_DATA: Slot[] = [
  {
    slotIndex: 1,
    personaSummary: '論理的思考を好み、効率性を重視するエンジニア気質の分人。',
    personaIcon: '',
    selfVector: { n: 0.2, c: 0.8, e: 0.4, a: 0.5, o: 0.7 },
    resonanceVector: { n: 0.3, c: 0.6, e: 0.6, a: 0.7, o: 0.8 },
    createdAt: '2023-10-01T10:00:00Z',
  },
  {
    slotIndex: 2,
    personaSummary: '親しい友人と過ごす時の、冗談を好みリラックスした分人。',
    personaIcon: '',
    selfVector: { n: 0.4, c: 0.3, e: 0.8, a: 0.9, o: 0.6 },
    resonanceVector: { n: 0.2, c: 0.5, e: 0.7, a: 0.8, o: 0.5 },
    createdAt: '2023-10-05T14:30:00Z',
  },
];

export default function SlotManager() {
  const [slots, setSlots] = useState<Record<number, Slot | null>>({
    1: null, 2: null, 3: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); 
      const data = MOCK_DB_DATA;
      
      const slotsMap: Record<number, Slot | null> = { 1: null, 2: null, 3: null };
      data.forEach(slot => {
        if (slot.slotIndex >= 1 && slot.slotIndex <= MAX_SLOTS) {
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
    if (!confirm(`スロット${slotIndex}のデータを削除してもよろしいですか？`)) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const targetIndex = MOCK_DB_DATA.findIndex(s => s.slotIndex === slotIndex);
      if (targetIndex !== -1) {
        MOCK_DB_DATA.splice(targetIndex, 1);
      }
      await fetchSlots();
    } catch (error) {
      console.error("削除エラー", error);
      setIsLoading(false);
    }
  };

  const activeSlotCount = Object.values(slots).filter(slot => slot !== null).length;

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* ヘッダーエリア */}
      <div className="flex justify-between items-center px-2 shrink-0 border-b border-zinc-200 pb-4">
        <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-3">
          スロット一覧
          <span className="text-xs font-normal text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
            {activeSlotCount} / {MAX_SLOTS} 使用中
          </span>
        </h3>
        <button 
          onClick={fetchSlots} 
          disabled={isLoading}
          className="text-zinc-400 hover:text-zinc-700 transition-colors p-2 rounded-full hover:bg-zinc-100"
          title="データを再取得"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* スロットグリッド (カードサイズを自然に戻す) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-10">
        {[1, 2, 3].map((index) => {
          const slot = slots[index];

          // --- ケースA: データなし ---
          if (!slot) {
            return (
              <div key={index} className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] bg-zinc-50/30 text-zinc-400 transition-colors hover:bg-zinc-50/60">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                  <Plus size={24} className="text-zinc-300" />
                </div>
                <p className="text-sm font-bold text-zinc-500">Slot {index}</p>
                <p className="text-xs mt-2 text-center text-zinc-400">
                  未設定 (Empty)<br/>
                  <span className="opacity-70">チャット分析後に生成されます</span>
                </p>
              </div>
            );
          }
          
          // --- ケースB: データあり ---
          return (
            <div key={index} className="relative border border-zinc-200 rounded-2xl p-5 shadow-sm bg-white flex flex-col min-h-[480px] hover:shadow-md transition-shadow group">
              
              {/* スロット番号バッジ */}
              <div className="absolute top-4 left-4 bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                Slot {index}
              </div>

              {/* アイコン */}
              <div className="flex justify-center mt-2 mb-5 shrink-0">
                <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center text-zinc-500 shadow-sm group-hover:scale-105 transition-transform">
                  <User strokeWidth={1.5} size={32} />
                </div>
              </div>

              {/* ベクトル情報 (2カラム) */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5 px-1">
                
                {/* 左: 自己ベクトル */}
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 text-center border-b border-zinc-100 pb-1.5 mb-3 tracking-wider">
                    自己 (Real)
                  </p>
                  <div className="space-y-3">
                    {TRAIT_MAPPING.map((trait) => {
                      const val = (slot.selfVector[trait.key] ?? 0.5) * 100;
                      return (
                        <div key={`self-${trait.key}`} className="relative h-4">
                          {/* ラベル行 */}
                          <div className="relative flex justify-between items-end mb-1 px-1 h-3">
                            <span className="text-[8px] text-zinc-400 font-medium">{trait.leftLabel}</span>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-[9px] font-bold text-zinc-600">{trait.label}</span>
                            <span className="text-[8px] text-zinc-400 font-medium">{trait.rightLabel}</span>
                          </div>
                          {/* プロット線 */}
                          <div className={`h-1.5 w-full rounded-full relative ${trait.barColor}`}>
                             <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-zinc-300/40"></div>
                             {/* ドット (w-2 h-2) */}
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

                {/* 右: 共鳴ベクトル */}
                <div>
                  <p className="text-[10px] font-bold text-rose-400 text-center border-b border-rose-50 pb-1.5 mb-3 tracking-wider">
                    共鳴 (Ideal)
                  </p>
                  <div className="space-y-3">
                    {TRAIT_MAPPING.map((trait) => {
                      const val = (slot.resonanceVector[trait.key] ?? 0.5) * 100;
                      return (
                        <div key={`res-${trait.key}`} className="relative h-4">
                          {/* ラベル行 */}
                          <div className="relative flex justify-between items-end mb-1 px-1 h-3">
                            <span className="text-[8px] text-zinc-400 font-medium">{trait.leftLabel}</span>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-[9px] font-bold text-zinc-600">{trait.label}</span>
                            <span className="text-[8px] text-zinc-400 font-medium">{trait.rightLabel}</span>
                          </div>
                          {/* プロット線 */}
                          <div className={`h-1.5 w-full rounded-full relative ${trait.barColor}`}>
                             <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-zinc-300/40"></div>
                             {/* ドット (w-2 h-2) */}
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

              {/* 分人要約文 (適度な高さに) */}
              <div className="mb-4">
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 min-h-[80px]">
                  <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">分人要約</p>
                  <p className="text-xs text-zinc-700 leading-relaxed line-clamp-3">
                    {slot.personaSummary}
                  </p>
                </div>
              </div>
              
              {/* フッター */}
              <div className="pt-3 border-t border-zinc-100 mt-auto flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 font-mono pl-1">
                  Updated: {new Date(slot.createdAt).toLocaleDateString('ja-JP')}
                </span>
                <button 
                  onClick={() => handleDeleteSlot(index)}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="削除"
                >
                  <Trash2 size={14} />
                  削除
                </button>
              </div>

              {isLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-2xl">
                  <div className="animate-spin text-zinc-400">
                    <RefreshCw size={24} />
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