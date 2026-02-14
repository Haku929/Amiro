"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Big5SliderChart } from "@/components/chart/Big5SliderChart";
import { Big5Vector, Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// 型定義・定数 (BIG5_LABELS等はコンポーネント側に移動したため削除)
// -----------------------------------------------------------------------------



// -----------------------------------------------------------------------------
// メインコンポーネント
// -----------------------------------------------------------------------------

import { Suspense } from 'react';

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selfVector: Big5Vector = {
    o: parseFloat(searchParams.get("s_o") || "0.5"),
    c: parseFloat(searchParams.get("s_c") || "0.5"),
    e: parseFloat(searchParams.get("s_e") || "0.5"),
    a: parseFloat(searchParams.get("s_a") || "0.5"),
    n: parseFloat(searchParams.get("s_n") || "0.5"),
  };

  const resonanceVector: Big5Vector = {
    o: parseFloat(searchParams.get("r_o") || "0.5"),
    c: parseFloat(searchParams.get("r_c") || "0.5"),
    e: parseFloat(searchParams.get("r_e") || "0.5"),
    a: parseFloat(searchParams.get("r_a") || "0.5"),
    n: parseFloat(searchParams.get("r_n") || "0.5"),
  };

  const summary = searchParams.get("summary") || "分析結果を取得できませんでした。";
  const situation = searchParams.get("situation") || "不明なシチュエーション";

  const [loading, setLoading] = useState(false);
  const [existingSlots, setExistingSlots] = useState<Slot[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch("/api/slots");
        if (res.ok) {
          const data = await res.json();
          setExistingSlots(data);
          if (data.length >= 3) {
            setIsFull(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
      }
    };
    fetchSlots();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        selfVector,
        resonanceVector,
        personaIcon: "🧩", 
        personaSummary: summary,
      };

      if (isFull && selectedSlotIndex === null) {
          setError("上書きするスロットを選択してください");
          setLoading(false);
          return;
      }

      let res;
      if (isFull && selectedSlotIndex !== null) {
        // Overwrite existing slot
        res = await fetch(`/api/slots/${selectedSlotIndex}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        // Create new slot
        res = await fetch("/api/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "保存に失敗しました。");
      }
      
      router.push("/profile");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">分析レポート</h1>
        <p className="text-muted-foreground">
          「{situation}」での対話を通じて抽出された分人データです。
        </p>
      </div>

      {/* 1. 分人要約カード */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
            </Avatar>
            今回の分人
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-sm md:text-base font-medium text-foreground/80">
            {summary}
          </p>
        </CardContent>
      </Card>

      {/* 2. Big5 上下分割比較エリア */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">性格特性</CardTitle>
          <CardDescription>
            あなたと会話相手の波長の比較
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* コンポーネント呼び出し */}
          <Big5SliderChart 
            selfVector={selfVector} 
            resonanceVector={resonanceVector} 
          />
        </CardContent>
      </Card>

      {/* 3. 保存エリア（スロット選択） */}
      <Card className={cn(isFull && "border-primary/50 shadow-md ring-1 ring-primary/10")}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Save className="h-5 w-5" />
            この分人を保存する
          </CardTitle>
          {isFull ? (
            <CardDescription className="text-destructive font-medium">
              スロットが満杯です。上書きする分人を選択してください。
            </CardDescription>
          ) : (
            <CardDescription>
              プロフィールに保存して、いつでもこの自分を呼び出せるようにします。
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {isFull && (
            <RadioGroup 
              value={selectedSlotIndex?.toString()} 
              onValueChange={(val) => setSelectedSlotIndex(parseInt(val))}
              className="grid gap-3"
            >
              {existingSlots.map((slot) => {
                const isSelected = selectedSlotIndex === slot.slotIndex;
                return (
                  <div key={slot.slotIndex}>
                    <RadioGroupItem
                      value={slot.slotIndex.toString()}
                      id={`slot-${slot.slotIndex}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`slot-${slot.slotIndex}`}
                      className={cn(
                        "relative flex items-center gap-3 border py-3 pl-3 pr-4 cursor-pointer overflow-hidden transition-colors duration-200",
                        isSelected
                          ? "rounded-none border-muted/30 bg-muted/70 hover:bg-muted/80"
                          : "rounded-xl border-muted/20 bg-transparent hover:bg-muted/25 hover:border-muted/35"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-1 bg-foreground/80 transition-transform duration-200 ease-out origin-left",
                          isSelected ? "scale-x-100" : "scale-x-0"
                        )}
                        aria-hidden
                      />
                      <Avatar
                        className={cn(
                          "h-10 w-10 shrink-0 border transition-colors relative z-10",
                          !isSelected && "border-muted/30",
                          isSelected && "border-foreground/25 bg-background"
                        )}
                      >
                        <AvatarImage src={slot.personaIcon} />
                        <AvatarFallback className={isSelected ? "!bg-background" : undefined}>
                          {slot.slotIndex}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 min-w-0 flex-1 relative z-10">
                        <span className="text-xs text-muted-foreground shrink-0 block">
                          {new Date(slot.createdAt).toLocaleDateString()}
                        </span>
                        <p className={cn("font-medium text-sm break-words", isSelected ? "text-foreground" : "text-foreground/85")}>{slot.personaSummary}</p>
                      </div>
                      <RefreshCcw className={cn("h-4 w-4 shrink-0 transition-colors relative z-10", isSelected ? "text-foreground/70" : "text-muted-foreground/35")} />
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-2">
          <Button variant="ghost" onClick={() => router.push("/")} className="w-full sm:w-auto">
            保存せずに終了
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || (isFull && selectedSlotIndex === null)}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isFull ? "選択して上書き" : "保存する"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <ReportContent />
    </Suspense>
  );
}