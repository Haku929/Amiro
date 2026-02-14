"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, User, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { DmMessage } from "@/lib/types";

const POLL_INTERVAL_MS = 10000;

const MOCK_MESSAGES = (otherUserId: string, myId: string): DmMessage[] => [
  {
    id: "mock-1",
    senderId: otherUserId,
    receiverId: myId,
    content: "こんにちは、共鳴しましたね。",
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "mock-2",
    senderId: myId,
    receiverId: otherUserId,
    content: "はい、よろしくお願いします。",
    createdAt: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: "mock-3",
    senderId: otherUserId,
    receiverId: myId,
    content: "チャットできるようになって嬉しいです。",
    createdAt: new Date().toISOString(),
  },
];

export default function DmRoomPage() {
  const params = useParams();
  const userId = params.userId as string;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [isMock, setIsMock] = useState(false);

  const fetchMessages = () => {
    return fetch(`/api/dm/${encodeURIComponent(userId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: DmMessage[]) => {
        setMessages(data);
        setStatus("ok");
      });
  };

  useEffect(() => {
    fetch(`/api/users/${encodeURIComponent(userId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { displayName?: string; avatarUrl?: string | null }) => {
        setDisplayName(data.displayName ?? "—");
        setAvatarUrl(data.avatarUrl ?? null);
      })
      .catch(() => {});

    fetchMessages().catch(() => {
      setMessages(MOCK_MESSAGES(userId, "mock-me"));
      setDisplayName((prev) => prev || (userId === "mock-user-1" ? "モックユーザー1" : userId === "mock-user-2" ? "モックユーザー2" : "モックユーザー"));
      setIsMock(true);
      setStatus("ok");
    });
  }, [userId]);

  useEffect(() => {
    if (status !== "ok" || isMock) return;
    const t = setInterval(() => {
      fetch(`/api/dm/${encodeURIComponent(userId)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: DmMessage[]) => setMessages(data))
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [userId, status, isMock]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await fetch("/api/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: userId, content: text }),
      });
      if (res.ok) {
        const msg: DmMessage = await res.json();
        setMessages((prev) => [...prev, msg]);
      }
    } finally {
      setSending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4">
        <p className="text-red-600 dark:text-red-400">メッセージを取得できませんでした。</p>
        <Link href="/dm" className="mt-2 text-sm underline">チャット一覧へ</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4">
      <Card className="mb-4 shadow-sm shrink-0 dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader className="py-4 px-6 flex flex-row items-center gap-3 space-y-0">
          <Link
            href="/dm"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors -ml-2"
          >
            <ArrowLeft className="text-zinc-600 dark:text-zinc-400" size={20} />
          </Link>
          <Avatar className="h-10 w-10 border-2 border-zinc-200 dark:border-zinc-700">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700">
                <User className="h-5 w-5 text-zinc-500" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base dark:text-zinc-100 truncate">
              {displayName || "—"}
              {isMock && (
                <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400">
                  （モック）
                </span>
              )}
            </h2>
          </div>
        </CardHeader>
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <CardContent className="flex-1 p-0 relative">
          <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId !== userId;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="h-8 w-8 mt-1 shrink-0">
                    <AvatarFallback
                      className={
                        isMe
                          ? "bg-primary/20 dark:bg-primary/30"
                          : "bg-zinc-200 dark:bg-zinc-700"
                      }
                    >
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      isMe
                        ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground"
                        : "bg-muted text-foreground dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <form
          className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={sending}
            className="flex-1 dark:bg-zinc-800 dark:border-zinc-700"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
