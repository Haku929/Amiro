"use client";

import SlotManager from "@/components/layout/SlotManager";
import { User } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import type { UserProfile } from "@/lib/types";
import ProfileEditDialog from "@/components/profile/ProfileEditDialog";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(() => {
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: UserProfile) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const displayName = profile?.displayName ?? "";
  const avatarUrl = profile?.avatarUrl ?? null;
  const bio = profile?.bio ?? "";

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col p-4 lg:p-8 overflow-hidden w-full max-w-7xl mx-auto">
      <div className="shrink-0 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          プロフィール
        </h1>
        <p className="text-xs text-zinc-500 mt-1 mb-4">
          アカウント情報とマッチングスロットの管理
        </p>
        
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-20 h-20 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 shadow-sm overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User strokeWidth={1.5} size={40} />
            )}
          </div>
          
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-none truncate">
                {displayName || "—"}
              </p>
              {profile && (
                <ProfileEditDialog profile={profile} onUpdate={fetchProfile} />
              )}
            </div>
            
            <div className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800/50 mt-2 max-w-2xl">
              {bio ? (
                <p className="whitespace-pre-wrap">{bio}</p>
              ) : (
                <p className="italic text-zinc-400 dark:text-zinc-500">自己紹介はまだありません</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 w-full rounded-3xl">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 lg:p-6 shadow-inner h-fit min-h-min w-full">
          <SlotManager />
        </div>
      </div>
    </div>
  );
}