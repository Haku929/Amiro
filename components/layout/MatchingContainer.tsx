'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MyProfileCard from './MyProfileCard';
import MatchingList from './MatchingList';
import type { UserProfile, MatchingResult } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function MatchingContainer() {
  const searchParams = useSearchParams();
  const slotParam = searchParams.get('slot');
  const initialSlot = slotParam ? parseInt(slotParam, 10) : 1;

  const [currentSlotIndex, setCurrentSlotIndex] = useState(initialSlot);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allCandidates, setAllCandidates] = useState<MatchingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Parallel fetch
        // Fetch all matches (API now returns list for all slots)
        const [profileRes, matchingRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/matching?limit=100') // Fetch more to cover all slots
        ]);

        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            setError('ログインが必要です');
            return;
          }
          if (profileRes.status === 404) {
            setError('プロフィールが見つかりません');
            return;
          }
          throw new Error('Failed to load profile');
        }
        if (!matchingRes.ok) throw new Error('Failed to load matches');

        const profileData = await profileRes.json();
        const matchingData = await matchingRes.json();

        setProfile(profileData);
        setAllCandidates(matchingData);
      } catch (err) {
        console.error(err);
        setError('データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter candidates based on selected slot
  const candidates = allCandidates.filter(c => c.matchedSlotIndexSelf === currentSlotIndex);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-red-500">
        <p>{error || 'プロフィールの取得に失敗しました'}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] w-full max-w-[1600px] mx-auto overflow-hidden bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">

      {/* Left Panel: My Profile (Fixed) */}
      <div className="hidden md:flex w-80 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-6 z-10 shrink-0">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">You (あなた)</h2>
        <div className="flex-1 overflow-hidden">
          <MyProfileCard
            profile={profile}
            currentSlotIndex={currentSlotIndex}
            onSlotChange={setCurrentSlotIndex}
          />
        </div>
      </div>

      {/* Right Panel: Matching List (Scrollable) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white/30 dark:bg-zinc-900/30 relative">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-10 sticky top-0 shrink-0 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">共鳴マッチング</h1>
            <p className="text-zinc-500 text-sm">あなたのイロと共鳴するユーザー</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-[95%] mx-auto">
            <MatchingList candidates={candidates} />
          </div>
        </div>
      </div>
    </div>
  );
}
