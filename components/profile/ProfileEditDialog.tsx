"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface ProfileEditDialogProps {
  profile: UserProfile;
  onUpdate: () => void;
}

export default function ProfileEditDialog({ profile, onUpdate }: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [bio, setBio] = useState(profile.bio || "");

  useEffect(() => {
    if (open) {
      setDisplayName(profile.displayName);
      setAvatarUrl(profile.avatarUrl || "");
      setBio(profile.bio || "");
    }
  }, [open, profile]);

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

      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error(error);
      // Here you could add a toast notification for error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil size={14} />
          プロフィール編集
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>プロフィール編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">表示名</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="あなたの名前"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="avatar">アイコンURL</Label>
            <Input
              id="avatar"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="自己紹介を入力してください"
              disabled={isLoading}
              className="resize-none"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "変更を保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
