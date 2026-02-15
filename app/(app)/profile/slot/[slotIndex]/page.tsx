"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, User, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Slot } from "@/lib/types";

const VALID_SLOTS = [1, 2, 3] as const;

export default function ProfileSlotConversationPage() {
  const params = useParams();
  const slotIndexParam = Number(params.slotIndex);
  const slotIndex = VALID_SLOTS.includes(slotIndexParam as 1 | 2 | 3)
    ? (slotIndexParam as 1 | 2 | 3)
    : 1;
  const [slot, setSlot] = useState<Slot | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { slots: Slot[] }) => {
        const found = data.slots.find((s) => s.slotIndex === slotIndex);
        setSlot(found ?? null);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [slotIndex]);

  if (status === "loading") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4">
        <Card className="mb-4 shadow-sm shrink-0 dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader className="py-4 px-6 flex flex-row items-center gap-3 space-y-0">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="dark:bg-zinc-800">
                <Sparkles className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">会話履歴</h2>
              <p className="font-bold text-base dark:text-zinc-100">イロ{slotIndex}</p>
            </div>
          </CardHeader>
        </Card>
        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="flex-1 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm">読み込み中…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4">
        <p className="text-red-600 dark:text-red-400">取得できませんでした。</p>
      </div>
    );
  }
  if (!slot) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4">
        <p className="text-zinc-600 dark:text-zinc-400">このスロットは未設定です。</p>
        <Link href="/profile" className="mt-2 inline-block text-sm text-zinc-500 underline">
          プロフィールへ戻る
        </Link>
      </div>
    );
  }

  const messages = slot.conversation?.messages ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4">
      <Card className="mb-4 shadow-sm shrink-0 dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors -ml-2"
            >
              <ArrowLeft className="text-zinc-600 dark:text-zinc-400" size={20} />
            </Link>
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="dark:bg-zinc-800">
                <Sparkles className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">会話履歴</h2>
              <p className="font-bold text-base dark:text-zinc-100">イロ{slotIndex}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <CardContent className="flex-1 p-0 relative">
          <div className="absolute inset-0 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                <Sparkles className="h-12 w-12" />
                <p>会話履歴はありません</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8 mt-1 shrink-0">
                    {msg.role === "user" ? (
                      <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
                        <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-primary/10 dark:bg-zinc-800">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground"
                        : "bg-muted text-foreground dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
