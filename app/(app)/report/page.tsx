"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, ArrowRight, Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Big5Vector, Slot } from "@/lib/types";

// -----------------------------------------------------------------------------
// 型定義・定数
// -----------------------------------------------------------------------------

const BIG5_LABELS = {
  o: { ja: "開放性 (Openness)", desc: "知的好奇心・独創性" },
  c: { ja: "誠実性 (Conscientiousness)", desc: "勤勉さ・計画性" },
  e: { ja: "外向性 (Extraversion)", desc: "社交性・活発さ" },
  a: { ja: "協調性 (Agreeableness)", desc: "他者への配慮・優しさ" },
  n: { ja: "情緒 (Neuroticism)", desc: "感受性の強さ・繊細さ" },
};

// モック用の既存スロットデータ（満杯時のテスト用）
const MOCK_EXISTING_SLOTS: Slot[] = [
  {
    slotIndex: 1,
    selfVector: { o: 0.2, c: 0.8, e: 0.5, a: 0.4, n: 0.6 },
    resonanceVector: { o: 0.3, c: 0.7, e: 0.6, a: 0.5, n: 0.5 },
    personaIcon: "/avatars/slot1.png",
    personaSummary: "論理的で冷静な分析家",
    createdAt: "2026-02-10T10:00:00Z",
  },
  {
    slotIndex: 2,
    selfVector: { o: 0.8, c: 0.2, e: 0.9, a: 0.7, n: 0.3 },
    resonanceVector: { o: 0.7, c: 0.3, e: 0.8, a: 0.6, n: 0.4 },
    personaIcon: "/avatars/slot2.png",
    personaSummary: "情熱的な冒険者",
    createdAt: "2026-02-11T15:30:00Z",
  },
  {
    slotIndex: 3,
    selfVector: { o: 0.5, c: 0.5, e: 0.5, a: 0.9, n: 0.2 },
    resonanceVector: { o: 0.5, c: 0.5, e: 0.5, a: 0.8, n: 0.3 },
    personaIcon: "/avatars/slot3.png",
    personaSummary: "穏やかな聞き手",
    createdAt: "2026-02-12T09:00:00Z",
  },
];

// -----------------------------------------------------------------------------
// コンポーネント
// -----------------------------------------------------------------------------

export default function ReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URLパラメータから分析結果を取得
  const selfVector: Big5Vector = {
    o: parseFloat(searchParams.get("s_o") || "0"),
    c: parseFloat(searchParams.get("s_c") || "0"),
    e: parseFloat(searchParams.get("s_e") || "0"),
    a: parseFloat(searchParams.get("s_a") || "0"),
    n: parseFloat(searchParams.get("s_n") || "0"),
  };

  const resonanceVector: Big5Vector = {
    o: parseFloat(searchParams.get("r_o") || "0"),
    c: parseFloat(searchParams.get("r_c") || "0"),
    e: parseFloat(searchParams.get("r_e") || "0"),
    a: parseFloat(searchParams.get("r_a") || "0"),
    n: parseFloat(searchParams.get("r_n") || "0"),
  };

  const summary = searchParams.get("summary") || "分析結果を取得できませんでした。";
  const situation = searchParams.get("situation") || "不明なシチュエーション";

  // State
  const [loading, setLoading] = useState(false);
  const [existingSlots, setExistingSlots] = useState<Slot[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初回ロード時にユーザーのスロット状況を確認（モック）
  useEffect(() => {
    const checkSlots = async () => {
      // 本来は GET /api/users/me を呼ぶ
      // 今回はテスト用にモックデータを使用
      // 挙動確認のため、ここで「空きがある場合」「満杯の場合」を切り替えられます
      const useFullSlotsMock = true; // ★ここを false にすると「即時保存」モードになります

      if (useFullSlotsMock) {
        setExistingSlots(MOCK_EXISTING_SLOTS);
        setIsFull(true);
      } else {
        setExistingSlots([MOCK_EXISTING_SLOTS[0]]); // 1つだけ埋まっている想定
        setIsFull(false);
      }
    };
    checkSlots();
  }, []);

  // 保存処理（モック）
  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // 上書きが必要なのに選択されていない場合
      if (isFull && selectedSlotIndex === null) {
        setError("上書きするスロットを選択してください");
        setLoading(false);
        return;
      }

      // API呼び出しのシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Saving to slot:", isFull ? selectedSlotIndex : "New Slot");
      console.log("Data:", { selfVector, resonanceVector, summary });

      // 保存完了後はプロフィールへ
      router.push("/profile");
    } catch (err) {
      console.error(err);
      setError("保存に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">分析レポート</h1>
        <p className="text-muted-foreground">
          「{situation}」での対話を通じて、新しい分人が抽出されました。
        </p>
      </div>

      {/* 1. 分人要約カード */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            今回の分人
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-sm md:text-base">
            {summary}
          </p>
        </CardContent>
      </Card>

      {/* 2. Big5 バーチャート比較エリア */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">性格特性の共鳴</CardTitle>
          <CardDescription>
            あなた（青）と、あなたが会話した鏡（グレー）の波長
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.keys(BIG5_LABELS) as (keyof Big5Vector)[]).map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-bold text-sm">{BIG5_LABELS[key].ja}</div>
                  <div className="text-xs text-muted-foreground">{BIG5_LABELS[key].desc}</div>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold text-lg">
                    {Math.round(selfVector[key] * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="relative pt-1">
                {/* 鏡（相手）のバー：薄いグレーで表示 */}
                <div className="absolute top-0 w-full flex items-center gap-2 opacity-40">
                   <span className="text-[10px] w-8 text-right shrink-0">Mirror</span>
                   <Progress value={resonanceVector[key] * 100} className="h-1.5 bg-muted-foreground/20 [&>*]:!bg-slate-500" />
                </div>
                
                {/* 自分（Self）のバー：メインカラーで表示 */}
                <div className="relative top-3 w-full flex items-center gap-2 z-10">
                   <span className="text-[10px] w-8 text-right font-bold text-primary shrink-0">You</span>
                   <Progress value={selfVector[key] * 100} className="h-2.5" />
                </div>
              </div>
              <div className="h-2" />{/* スペーサー */}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. 保存エリア（スロット選択） */}
      <Card className={isFull ? "border-primary/50 shadow-md" : ""}>
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
              className="grid gap-4"
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
                    className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <Avatar>
                          <AvatarImage src={slot.personaIcon} />
                          <AvatarFallback>{slot.slotIndex}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-mono text-muted-foreground">Slot {slot.slotIndex}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold line-clamp-1">{slot.personaSummary}</div>
                        <div className="text-xs text-muted-foreground">
                          保存日: {new Date(slot.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <RefreshCcw className="h-4 w-4 text-muted-foreground peer-data-[state=checked]:text-primary" />
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

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => router.push("/")}>
            保存せずにホームへ
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || (isFull && selectedSlotIndex === null)}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isFull ? "選択したスロットに上書き保存" : "新しいスロットに保存"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}