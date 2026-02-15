"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          avatarUrl: avatarUrl || null,
          bio: bio || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      // 完了したらホームへリダイレクト
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      // エラーハンドリング (例: トースト通知)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <User size={24} />
          </div>
          <CardTitle className="text-2xl font-bold">プロフィール設定</CardTitle>
          <CardDescription>
            Amiroへようこそ！<br />
            まずはあなたの基本情報を教えてください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">表示名 <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="例: アミロ 太郎"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">アプリ内で他のユーザーに表示される名前です。</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar">アイコンURL</Label>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                   <Input
                    id="avatar"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/icon.png"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">画像のURLを入力してください。</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="好きなこと、趣味、性格など..."
                disabled={isLoading}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !displayName}>
              {isLoading ? "保存中..." : "はじめる"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-6">
          <p className="text-xs text-muted-foreground text-center">
            これらの情報は後からいつでも「プロフィール」ページで変更できます。
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
