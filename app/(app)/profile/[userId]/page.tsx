"use client";

import { User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";

export default function ProfileUserIdPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (userId === "me") {
      router.replace("/profile");
      return;
    }
    fetch(`/api/users/${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data: UserProfile) => {
        setProfile(data);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [userId, router]);

  if (userId === "me") return null;
  if (status === "loading") {
    return (
      <div className="h-[calc(100vh-1rem)] flex flex-col p-4 lg:p-8 overflow-hidden w-full max-w-5xl mx-auto">
        <div className="shrink-0 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <p className="text-zinc-500 dark:text-zinc-400">読み込み中…</p>
        </div>
      </div>
    );
  }
  if (status === "error" || !profile) {
    return (
      <div className="h-[calc(100vh-1rem)] flex flex-col p-4 lg:p-8 overflow-hidden w-full max-w-5xl mx-auto">
        <div className="shrink-0 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <p className="text-red-600 dark:text-red-400">プロフィールを取得できませんでした。</p>
        </div>
      </div>
    );
  }

  const displayName = profile.displayName || "—";
  const avatarUrl = profile.avatarUrl ?? null;
  const bio = profile.bio ?? "";

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col p-4 lg:p-8 overflow-hidden w-full max-w-5xl mx-auto">
      <div className="shrink-0 mb-4 flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            プロフィール
          </h1>
          <p className="text-xs text-zinc-500 mt-1">公開プロフィール（閲覧専用）</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 shadow-sm overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User strokeWidth={1.5} size={20} />
              )}
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                {displayName}
              </p>
            </div>
          </div>
          {bio ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
              {bio}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 w-full rounded-3xl">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 lg:p-6 shadow-inner h-fit min-h-min w-full">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            スロット数: {profile.slots.length}
          </p>
        </div>
      </div>
    </div>
  );
}
