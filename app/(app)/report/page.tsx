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

export default function ReportPage() {
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
      // Mock save functionality (Backend/DB is not ready for frontend testing)
      // const body = {
      //   selfVector,
      //   resonanceVector,
      //   personaIcon: "🧩", 
      //   personaSummary: summary,
      // };

      if (isFull && selectedSlotIndex === null) {
          setError("上書きするスロットを選択してください");
          setLoading(false);
          return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // if (isFull) {
      //   // Overwrite existing slot
      //   const res = await fetch(`/api/slots/${selectedSlotIndex}`, { ... });
      // } else {
      //   // Create new slot
      //   const res = await fetch("/api/slots", { ... });
      // }
      
      alert("保存しました（モック）");
      router.push("/profile");
    } catch (err) {
      console.error(err);
      setError("保存に失敗しました。");
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
              {existingSlots.map((slot) => (
                <div key={slot.slotIndex}>
                  <RadioGroupItem
                    value={slot.slotIndex.toString()}
                    id={`slot-${slot.slotIndex}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`slot-${slot.slotIndex}`}
                    className="flex items-center justify-between rounded-md border border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar className="h-10 w-10 border shrink-0">
                        <AvatarImage src={slot.personaIcon} />
                        <AvatarFallback>{slot.slotIndex}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-mono bg-muted px-1.5 rounded text-muted-foreground">Slot {slot.slotIndex}</span>
                           <span className="text-xs text-muted-foreground">
                             {new Date(slot.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <div className="font-medium text-sm truncate">{slot.personaSummary}</div>
                      </div>
                    </div>
                    <RefreshCcw className="h-4 w-4 text-muted-foreground/50 peer-data-[state=checked]:text-primary shrink-0 ml-2" />
                  </Label>
                </div>
              ))}
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