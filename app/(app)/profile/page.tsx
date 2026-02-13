// app/(app)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import SlotManager from '@/components/layout/SlotManager';
import { User } from 'lucide-react';

interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  // slots: Slot[]; // API returns slots too, but currently unused here
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col p-4 lg:p-8 overflow-hidden w-full max-w-5xl mx-auto">
      
      {/* 1. ページヘッダー & ユーザー情報 */}
      <div className="shrink-0 mb-4 flex items-end justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">プロフィール</h1>
          <p className="text-xs text-zinc-500 mt-1">
            アカウント情報とマッチングスロットの管理
          </p>
          
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 shadow-sm overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <User strokeWidth={1.5} size={20} />
              )}
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900 leading-none">
                {user ? user.displayName : '...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. スロット管理エリア */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full rounded-3xl">
        <div className="bg-zinc-50 rounded-3xl border border-zinc-200 p-4 lg:p-6 shadow-inner h-fit min-h-min w-full">
          <SlotManager />
        </div>
      </div>
      
    </div>
  );
}