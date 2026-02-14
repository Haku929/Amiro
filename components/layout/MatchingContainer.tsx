// components/layout/MatchingContainer.tsx
'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X, Settings2 } from 'lucide-react';
import MyProfileCard from './MyProfileCard';
import MatchingList from './MatchingList';
import { Slot, Big5Vector } from '@/lib/types';

type VectorKey = keyof Big5Vector;
const VECTOR_TRAITS = ['情動性', '勤勉性', '外向性', '協調性', '創造性'] as const;
const VECTOR_KEYS: VectorKey[] = ['n', 'c', 'e', 'a', 'o'];

export interface MatchUser {
  id: string;
  name: string;
  personaSummary: string;
  resonanceScore: number;
  resonanceVector: Big5Vector;
  selfVector: Big5Vector;
}

// ▼ モックデータ
const MOCK_SLOTS: Slot[] = [
  { 
    slotIndex: 1, 
    personaSummary: '相手の話を丁寧に聴き、共感を示す傾向が強く表れています。', 
    personaIcon: '',
    selfVector: { n: 0.2, c: 0.6, e: 0.3, a: 0.8, o: 0.5 }, 
    resonanceVector: { n: 0.3, c: 0.5, e: 0.8, a: 0.6, o: 0.9 },
    createdAt: new Date().toISOString()
  },
  { 
    slotIndex: 2, 
    personaSummary: '効率とロジックを重視し、知的な会話を好むペルソナです。', 
    personaIcon: '',
    selfVector: { n: 0.2, c: 0.9, e: 0.6, a: 0.4, o: 0.6 }, 
    resonanceVector: { n: 0.2, c: 0.8, e: 0.5, a: 0.5, o: 0.8 },
    createdAt: new Date().toISOString()
  },
  { 
    slotIndex: 3, 
    personaSummary: '新しいことへの好奇心が旺盛で、感情表現が豊かな状態です。', 
    personaIcon: '',
    selfVector: { n: 0.5, c: 0.3, e: 0.9, a: 0.7, o: 0.9 }, 
    resonanceVector: { n: 0.2, c: 0.6, e: 0.7, a: 0.8, o: 0.6 },
    createdAt: new Date().toISOString()
  },
];

const MOCK_MATCHES: Record<number, MatchUser[]> = {
  1: [
    { 
      id: 'u1', name: 'ミナト', resonanceScore: 92, 
      personaSummary: '穏やかで聞き上手な一面が強く出ています。休日は静かなカフェで読書を楽しむことが多いです。',
      selfVector: { n: 0.3, c: 0.6, e: 0.85, a: 0.5, o: 0.85 }, 
      resonanceVector: { n: 0.2, c: 0.5, e: 0.35, a: 0.9, o: 0.5 }
    },
    { 
      id: 'u2', name: 'ユイ', resonanceScore: 88, 
      personaSummary: '相手の感情に寄り添う共感性の高さが特徴です。リラックスした雰囲気作りが得意です。',
      selfVector: { n: 0.4, c: 0.6, e: 0.5, a: 0.9, o: 0.6 }, 
      resonanceVector: { n: 0.3, c: 0.5, e: 0.4, a: 0.8, o: 0.5 }
    },
    { 
      id: 'u3', name: 'ケンジ', resonanceScore: 81, 
      personaSummary: '趣味の話になると熱中するタイプですが、普段は協調性を大切にして周りに合わせます。',
      selfVector: { n: 0.6, c: 0.4, e: 0.8, a: 0.5, o: 0.7 }, 
      resonanceVector: { n: 0.3, c: 0.6, e: 0.7, a: 0.7, o: 0.8 }
    },
  ],
  2: [
    { 
      id: 'u4', name: 'サクラ', resonanceScore: 95, 
      personaSummary: '論理的な思考を好み、物事の効率化について議論することに喜びを感じるペルソナです。',
      selfVector: { n: 0.3, c: 0.85, e: 0.5, a: 0.4, o: 0.7 }, 
      resonanceVector: { n: 0.2, c: 0.9, e: 0.6, a: 0.5, o: 0.6 }
    },
    { 
      id: 'u5', name: 'リク', resonanceScore: 74, 
      personaSummary: '新しい技術やビジネスの話題に敏感で、常に自己研鑽を怠らない真面目な一面があります。',
      selfVector: { n: 0.5, c: 0.7, e: 0.6, a: 0.5, o: 0.8 }, 
      resonanceVector: { n: 0.4, c: 0.6, e: 0.6, a: 0.6, o: 0.7 }
    },
  ],
  3: [
    { 
      id: 'u6', name: 'ハル', resonanceScore: 89, 
      personaSummary: 'アウトドアやスポーツを好み、常に新しい体験を求めて行動するアクティブな状態です。',
      selfVector: { n: 0.2, c: 0.5, e: 0.9, a: 0.7, o: 0.8 }, 
      resonanceVector: { n: 0.3, c: 0.4, e: 0.8, a: 0.6, o: 0.9 }
    },
  ]
};

type FilterType = 'none' | 'self' | 'res';

export default function MatchingContainer() {
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(1);
  const [isSearching, setIsSearching] = useState(false);
  const [filterInput, setFilterInput] = useState<{ type: FilterType, vectorKey: VectorKey }>({ type: 'none', vectorKey: 'n' });
  const [activeFilter, setActiveFilter] = useState<{ type: FilterType, vectorKey: VectorKey }>({ type: 'none', vectorKey: 'n' });
  
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  const handleSlotChange = (slotIndex: number) => {
    if (slotIndex === currentSlotIndex) return;
    setIsSearching(true);
    setCurrentSlotIndex(slotIndex);
    setActiveFilter({ type: 'none', vectorKey: 'n' });
    setFilterInput({ type: 'none', vectorKey: 'n' });
    setTimeout(() => { setIsSearching(false); }, 600);
  };

  const handleApplyFilter = () => {
    setIsSearching(true);
    setActiveFilter(filterInput);
    setTimeout(() => { setIsSearching(false); }, 600);
  };

  const currentSlot = MOCK_SLOTS.find(s => s.slotIndex === currentSlotIndex) || MOCK_SLOTS[0];
  const baseMatches = MOCK_MATCHES[currentSlotIndex] || [];

  const filteredMatches = useMemo(() => {
    if (activeFilter.type === 'none') return baseMatches;
    const vKey = activeFilter.vectorKey;
    const myVal = activeFilter.type === 'self' ? currentSlot.selfVector[vKey] : currentSlot.resonanceVector[vKey];

    return [...baseMatches]
      .filter(match => {
        const theirVal = activeFilter.type === 'self' ? match.selfVector[vKey] : match.resonanceVector[vKey];
        return Math.abs(myVal - theirVal) <= 0.3; 
      })
      .sort((a, b) => {
        const aVal = activeFilter.type === 'self' ? a.selfVector[vKey] : a.resonanceVector[vKey];
        const bVal = activeFilter.type === 'self' ? b.selfVector[vKey] : b.resonanceVector[vKey];
        return Math.abs(myVal - aVal) - Math.abs(myVal - bVal);
      });
  }, [baseMatches, activeFilter, currentSlot]);

  return (
    <div className="fixed inset-0 lg:pl-20 z-0 flex flex-col h-screen bg-zinc-50/30 dark:bg-zinc-950 overflow-hidden">
      
      {/* 1. 上部固定エリア (タイトル + 自分カード) */}
      <div className="shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-30 relative">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
          
          {/* タイトル (独立した行) */}
          <div>
             <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
               <span className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></span>
               共鳴マッチング
             </h1>
             <p className="text-xs text-zinc-500 dark:text-zinc-400 ml-6 mt-1">あなたの「分人」と共鳴する相手を見つけます</p>
          </div>

          {/* 自分カード */}
          <div className="w-full">
             <MyProfileCard slots={MOCK_SLOTS} currentSlot={currentSlot} onSlotChange={handleSlotChange} />
          </div>

        </div>

        {/* ロード中表示 */}
        <div className={`absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center transition-opacity duration-300 ${isSearching ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-rose-500 tracking-wider">SEARCHING...</span>
            </div>
        </div>
      </div>

      {/* 2. 下部スクロールエリア (相手リスト) */}
      <div className="flex-1 overflow-y-auto scroll-smooth overscroll-contain bg-zinc-50/50 dark:bg-zinc-950">
          <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
             {/* 相手リスト (スペーサーなし、幅一杯でMyCardと揃う) */}
             <MatchingList matches={filteredMatches} currentSlotIndex={currentSlotIndex} />
             <div className="h-32" />
          </div>
      </div>

      {/* 3. 右下固定: 再検索設定パネル */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {!isFilterPanelOpen && (
          <button 
            onClick={() => setIsFilterPanelOpen(true)}
            className="bg-zinc-900 text-white p-4 rounded-full shadow-lg hover:bg-zinc-800 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Settings2 size={24} />
          </button>
        )}

        {isFilterPanelOpen && (
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-80 lg:w-96 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100 font-bold">
                <Filter size={18} className="text-rose-500" />
                再検索設定
              </div>
              <button 
                onClick={() => setIsFilterPanelOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">基準にするベクトル</label>
                <select 
                  value={filterInput.type} 
                  onChange={(e) => setFilterInput({ ...filterInput, type: e.target.value as FilterType })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-100 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
                >
                  <option value="none">指定なし (スコア順)</option>
                  <option value="self">自己ベクトルが近い人</option>
                  <option value="res">共鳴ベクトルが近い人</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">重視する項目</label>
                <select 
                  value={filterInput.vectorKey} 
                  onChange={(e) => setFilterInput({ ...filterInput, vectorKey: e.target.value as VectorKey })}
                  disabled={filterInput.type === 'none'}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-100 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900 transition-shadow"
                >
                  {VECTOR_KEYS.map((key, idx) => (
                    <option key={key} value={key}>{VECTOR_TRAITS[idx]}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleApplyFilter}
                className="w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm active:scale-[0.98]"
              >
                <Search size={16} />
                この条件で再検索
              </button>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}