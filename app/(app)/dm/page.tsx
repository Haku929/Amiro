"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ConversationItem = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  lastMessage?: { content: string; createdAt: string };
};

function normalizeItem(raw: Record<string, unknown>): ConversationItem {
  const lastMsg = raw.lastMessage ?? raw.last_message;
  return {
    userId: String(raw.userId ?? raw.user_id ?? ""),
    displayName: String(raw.displayName ?? raw.display_name ?? ""),
    avatarUrl: raw.avatarUrl != null ? String(raw.avatarUrl) : raw.avatar_url != null ? String(raw.avatar_url) : null,
    lastMessage:
      lastMsg && typeof lastMsg === "object" && lastMsg !== null && "content" in lastMsg
        ? {
            content: String((lastMsg as Record<string, unknown>).content ?? ""),
            createdAt: String((lastMsg as Record<string, unknown>).createdAt ?? (lastMsg as Record<string, unknown>).created_at ?? ""),
          }
        : undefined,
  };
}

const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    userId: "mock-user-1",
    displayName: "モックユーザー1",
    avatarUrl: null,
    lastMessage: { content: "こんにちは、共鳴しましたね。", createdAt: new Date().toISOString() },
  },
  {
    userId: "mock-user-2",
    displayName: "モックユーザー2",
    avatarUrl: null,
    lastMessage: { content: "チャットしましょう。", createdAt: new Date().toISOString() },
  },
];

export default function DmListPage() {
  const [list, setList] = useState<ConversationItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    fetch("/api/dm/conversations")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: unknown) => {
        const items = Array.isArray(data) ? data.map((raw) => normalizeItem(typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {})) : [];
        setList(items);
        setStatus("ok");
      })
      .catch(() => {
        setList(MOCK_CONVERSATIONS);
        setIsMock(true);
        setStatus("ok");
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4">
      <Card className="mb-4 shadow-sm shrink-0 dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader className="py-4 px-6">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            チャット
            {isMock && (
              <span className="text-xs font-normal text-amber-600 dark:text-amber-400">
                （モック表示）
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            登録した相手やメッセージのやり取りがある相手とチャットできます
          </p>
        </CardHeader>
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <CardContent className="flex-1 p-0 overflow-y-auto">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">チャット相手がいません</p>
              <p className="text-xs mt-1">共鳴詳細から「チャット相手に追加」で追加できます</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {list.map((item) => (
                <li key={item.userId}>
                  <Link
                    href={`/dm/${encodeURIComponent(item.userId)}`}
                    className="flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      {item.avatarUrl ? (
                        <AvatarImage src={item.avatarUrl} alt={item.displayName} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700">
                        <User className="h-6 w-6 text-zinc-500" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {item.displayName || "—"}
                      </p>
                      {item.lastMessage && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {item.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
