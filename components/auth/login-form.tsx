'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, signup } from '@/app/(auth)/login/actions';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = async (formData: FormData, action: typeof login) => {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" required placeholder="m@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="flex flex-col gap-2 pt-4">
        <Button 
          type="button" 
          onClick={(e) => handleAction(new FormData(e.currentTarget.form!), login)}
          disabled={isPending}
        >
          {isPending ? '処理中...' : 'ログイン'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={(e) => handleAction(new FormData(e.currentTarget.form!), signup)}
          disabled={isPending}
        >
          新規登録
        </Button>
      </div>
    </form>
  );
}