"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, User, Sparkles, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
// モック API 関数 (本来はサーバーサイド実装)
// -----------------------------------------------------------------------------

// 会話APIのモック
const mockChatApi = async (
  message: string,
  situation: string,
  big5: Big5
): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 簡易的な性格反映ロジック（デモ用）
      let prefix = "";
      if (big5.e > 0.6) prefix += "（元気よく）";
      if (big5.n > 0.6) prefix += "（少し心配そうに）";
      if (big5.o > 0.6) prefix += "なるほど、興味深いですね！";
      
      const responses = [
        `その件について、${situation}の観点から考えるとどう思いますか？`,
        "それは新しい発見ですね。詳しく教えてください。",
        "ふむふむ、それで？",
        `今の言葉、すごくあなたらしい響きがしました。`,
      ];
      
      const randomRes = responses[Math.floor(Math.random() * responses.length)];
      resolve(`${prefix} ${message}ですね。${randomRes}`);
    }, 1000); // 1秒の遅延
  });
};

// 分析APIのモック
const mockAnalyzeApi = async (messages: Message[]): Promise<{ selfVector: Big5; summary: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        selfVector: {
          o: Math.random(),
          c: Math.random(),
          e: Math.random(),
          a: Math.random(),
          n: Math.random(),
        },
        summary: "今回の会話から、あなたは非常に論理的でありながら、新しい可能性に対して開かれた姿勢を持っていることが読み取れました。特に後半の問いかけには、自身の内面を深く見つめようとする意志が感じられます。",
      });
    }, 2000); // 2秒の遅延
  });
};

// -----------------------------------------------------------------------------
// メインコンポーネント
// -----------------------------------------------------------------------------

export default function ChatPage() {
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

  const MAX_TURNS = 10;

  // 自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // 初回メッセージ（オプション：鏡からの挨拶を入れる場合）
  useEffect(() => {
    if (messages.length === 0) {
       // ここで初期メッセージを入れることも可能ですが、
       // 仕様では「ユーザー送信のたびに...」とあるため、最初は空か、システムメッセージのみとします。
    }
  }, []);

  // 送信ハンドラ
  const handleSend = async () => {
    if (!input.trim() || loading || analyzing || turnCount >= MAX_TURNS) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // 1. AI応答の取得 (Mock)
      const aiResponse = await mockChatApi(userMsg, situation, mirrorBig5);
      
      setMessages((prev) => [...prev, { role: "model", content: aiResponse }]);
      setTurnCount((prev) => prev + 1);

    } catch (error) {
      console.error("Chat Error:", error);
      // エラー処理（トーストなどを出すのが望ましい）
    } finally {
      setLoading(false);
    }
  };

  // 終了・分析ハンドラ
  const handleFinish = async () => {
    if (messages.length === 0) return; // 会話なしでは終了不可
    setAnalyzing(true);

    try {
      // 1. 分析実行 (Mock)
      const result = await mockAnalyzeApi(messages);

      // 2. レポートページへ遷移 (クエリパラメータで結果を渡す)
      const query = new URLSearchParams({
        // 分析結果 (Self)
        s_o: result.selfVector.o.toString(),
        s_c: result.selfVector.c.toString(),
        s_e: result.selfVector.e.toString(),
        s_a: result.selfVector.a.toString(),
        s_n: result.selfVector.n.toString(),
        summary: result.summary,
        // 鏡の設定 (Resonanceとして保存するため引き継ぐ)
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
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full p-4">
      {/* ヘッダー情報 */}
      <Card className="mb-4 shadow-sm shrink-0">
        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback><Sparkles className="h-5 w-5 text-primary" /></AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Mirror Situation</h2>
              <p className="font-bold text-base">{situation}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Turn</span>
              <p className={`font-mono font-bold ${turnCount >= MAX_TURNS ? "text-destructive" : ""}`}>
                {turnCount} / {MAX_TURNS}
              </p>
            </div>
            
            {/* 任意終了ボタン */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFinish}
              disabled={analyzing || messages.length === 0}
              className="hidden sm:flex"
            >
              {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              終了して分析
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* チャットエリア */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
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
                      <AvatarImage src="" /> {/* ユーザーアイコンがあれば */}
                      <AvatarFallback className="bg-slate-200"><User className="h-4 w-4 text-slate-600" /></AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-primary/10"><Sparkles className="h-4 w-4 text-primary" /></AvatarFallback>
                  )}
                </Avatar>
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10"><Sparkles className="h-4 w-4 text-primary" /></AvatarFallback>
                </Avatar>
                <div className="bg-muted text-foreground rounded-lg p-3 flex items-center">
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
        <CardFooter className="p-3 bg-card border-t">
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
              disabled={loading || analyzing || turnCount >= MAX_TURNS}
              className="flex-1"
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