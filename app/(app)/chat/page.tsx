"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, User, Sparkles, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

// 型定義
type Message = {
  role: "user" | "model";
  content: string;
};

type Big5 = {
  o: number;
  c: number;
  e: number;
  a: number;
  n: number;
};



// -----------------------------------------------------------------------------
// メインコンポーネント
// -----------------------------------------------------------------------------

import { Suspense } from 'react';

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // URLパラメータから鏡の設定を取得
  const situation = searchParams.get("situation") || "未設定のシチュエーション";
  const mirrorBig5: Big5 = {
    o: parseFloat(searchParams.get("o") || "0.5"),
    c: parseFloat(searchParams.get("c") || "0.5"),
    e: parseFloat(searchParams.get("e") || "0.5"),
    a: parseFloat(searchParams.get("a") || "0.5"),
    n: parseFloat(searchParams.get("n") || "0.5"),
  };

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // プロフィールからアバターURLを取得
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("user_id", user.id)
          .single();
        
        if (profile?.avatar_url) {
          setUserAvatarUrl(profile.avatar_url);
        } else if (user.user_metadata?.avatar_url) {
          setUserAvatarUrl(user.user_metadata.avatar_url);
        }
      }
    };
    fetchUser();
  }, []);

  const MAX_TURNS = 10;

  // 自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // 初回メッセージ（AIから会話を開始）
  const hasStarted = useRef(false);

  useEffect(() => {
    if (messages.length === 0 && !hasStarted.current && situation !== "未設定のシチュエーション") {
       hasStarted.current = true;
       const startChat = async () => {
         setLoading(true);
         try {
           // システムからの指示として、AIに挨拶を求める（ユーザーには見せないメッセージ）
           const hiddenInitiatorMessage = { 
             role: "user" as const, 
             content: "（システム指示：このシチュエーションで、あなたからユーザーに話しかけて会話を始めてください。100文字以内で、自然な問いかけや挨拶を行ってください。）" 
           };
           
           const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [hiddenInitiatorMessage],
              situation,
              mirrorBig5,
            }),
          });
    
          if (!res.ok) throw new Error("Init chat failed");
          const data = await res.json();
          if (data.error) throw new Error(data.error);

          // AIの応答のみをメッセージ履歴に追加
          setMessages([{ role: "model", content: data.content }]);
         } catch (e) {
           console.error("Auto start chat failed", e);
           // 失敗時は何も表示しないか、エラーを表示（今回は静観し、ユーザー入力を待つ）
         } finally {
           setLoading(false);
         }
       };
       startChat();
    }
  }, [situation]);

  // Focus management
  const inputRef = useRef<HTMLInputElement>(null);

  // 送信直後にフォーカスを維持する
  useEffect(() => {
    if (!loading && !analyzing && turnCount < MAX_TURNS) {
       // 初回マウント時や、何らかの理由でフォーカスが外れた場合に戻す処理は
       // ユーザーの意図しない挙動になる可能性があるため、
       // ここでは「送信ボタン押下直後」のフォーカス維持・復帰を主に行う。
    }
  }, [loading]); 

  // 送信ハンドラ
  const handleSend = async () => {
    if (!input.trim() || loading || analyzing || turnCount >= MAX_TURNS) return;

    const userMsg = input;
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    // 送信直後にフォーカスを入力欄に戻す (ボタンクリックで送信した場合対策)
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    try {
      // 1. AI応答の取得 (Real API)
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          situation,
          mirrorBig5,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Chat API error: ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMessages((prev) => [...prev, { role: "model", content: data.content }]);
      setTurnCount((prev) => prev + 1);

    } catch (error) {
      console.error("Chat Error:", error);
      // エラー処理（トーストなどを出すのが望ましい）
      setMessages((prev) => [...prev, { role: "model", content: "すみません、エラーが発生しました。" }]);
    } finally {
      setLoading(false);
      // AI応答完了後もフォーカスを確保（念のため）
      setTimeout(() => {
        if (!analyzing && turnCount < MAX_TURNS) {
            inputRef.current?.focus();
        }
      }, 0);
    }
  };

  // 終了・分析ハンドラ
  const handleFinish = async () => {
    if (messages.length === 0) return; // 会話なしでは終了不可
    setAnalyzing(true);

    try {
      // 1. 分析実行 (Real API)
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        throw new Error(`Analyze API error: ${res.status}`);
      }

      const result = await res.json();
      if (result.error) {
        throw new Error(result.error);
      }

      try {
        sessionStorage.setItem(
          "amiro_report_conversation",
          JSON.stringify({ messages })
        );
      } catch {
        // ignore storage errors
      }

      const query = new URLSearchParams({
        s_o: result.selfVector.o.toString(),
        s_c: result.selfVector.c.toString(),
        s_e: result.selfVector.e.toString(),
        s_a: result.selfVector.a.toString(),
        s_n: result.selfVector.n.toString(),
        summary: result.personaSummary,
        r_o: mirrorBig5.o.toString(),
        r_c: mirrorBig5.c.toString(),
        r_e: mirrorBig5.e.toString(),
        r_a: mirrorBig5.a.toString(),
        r_n: mirrorBig5.n.toString(),
        situation: situation,
      });

      router.push(`/report?${query.toString()}`);

    } catch (error) {
      console.error("Analysis Error:", error);
      alert("分析中にエラーが発生しました。");
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4">
      {/* ヘッダー情報 */}
      <Card className="mb-4 shadow-sm shrink-0 dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="dark:bg-zinc-800"><Sparkles className="h-5 w-5 text-primary" /></AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Mirror Situation</h2>
              <p className="font-bold text-base dark:text-zinc-100">{situation}</p>
            </div>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center">
             <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Turn</span>
             <p className={`font-mono text-xl font-bold leading-none ${turnCount >= MAX_TURNS ? "text-destructive" : ""}`}>
               {turnCount} <span className="text-sm font-normal text-muted-foreground">/ {MAX_TURNS}</span>
             </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile用 Turn Count (Right aligned when button is hidden or just on right) */}
            <div className="md:hidden flex flex-col items-end gap-0.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Turn</span>
              <p className={`font-mono text-lg font-bold leading-none dark:text-zinc-100 ${turnCount >= MAX_TURNS ? "text-destructive" : ""}`}>
                {turnCount} <span className="text-sm font-normal text-muted-foreground">/ {MAX_TURNS}</span>
              </p>
            </div>

            {/* 任意終了ボタン */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFinish}
              disabled={analyzing || messages.length === 0}
              className="hidden sm:flex border-primary/20 hover:bg-primary/5 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
            >
              {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              終了して分析
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* チャットエリア */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <CardContent className="flex-1 p-0 relative">
          <div 
            ref={scrollRef} 
            className="absolute inset-0 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                <Sparkles className="h-12 w-12" />
                <p>新しい自分を見つけましょう</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="h-8 w-8 mt-1">
                  {msg.role === "user" ? (
                    <>
                      <AvatarImage src={userAvatarUrl || ""} /> {/* ユーザーアイコンがあれば */}
                      <AvatarFallback className="bg-slate-200 dark:bg-slate-700"><User className="h-4 w-4 text-slate-600 dark:text-slate-300" /></AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-primary/10 dark:bg-zinc-800"><Sparkles className="h-4 w-4 text-primary" /></AvatarFallback>
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
            ))}

            {loading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10 dark:bg-zinc-800"><Sparkles className="h-4 w-4 text-primary" /></AvatarFallback>
                </Avatar>
                <div className="bg-muted text-foreground dark:bg-zinc-800 dark:text-zinc-100 rounded-lg p-3 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-xs text-muted-foreground">思考中...</span>
                </div>
              </div>
            )}
            
            {/* ターン数上限到達時のメッセージ */}
            {turnCount >= MAX_TURNS && !analyzing && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <p>会話の上限に達しました。</p>
                <Button variant="link" onClick={handleFinish}>分析結果を見る</Button>
              </div>
            )}
          </div>
        </CardContent>

        {/* 入力エリア */}
        <CardFooter className="p-3 bg-card border-t dark:bg-zinc-900 dark:border-zinc-800">
          <form 
            className="flex w-full gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              placeholder={turnCount >= MAX_TURNS ? "会話終了" : "メッセージを入力..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={analyzing || turnCount >= MAX_TURNS}
              className="flex-1 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
              ref={inputRef}
              autoFocus
            />
            {turnCount >= MAX_TURNS ? (
              <Button 
                type="button" 
                onClick={handleFinish} 
                disabled={analyzing}
                variant="default" // 目立たせる
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : "分析へ"}
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim() || loading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            )}
          </form>
        </CardFooter>
      </Card>
      
      {/* モバイル用終了ボタン（ヘッダーに入りきらない場合用） */}
      <div className="sm:hidden mt-2 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleFinish}
          disabled={analyzing || messages.length === 0}
          className="text-muted-foreground"
        >
          {analyzing ? "分析中..." : "会話を終了して分析結果を見る"}
        </Button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <ChatContent />
    </Suspense>
  );
}