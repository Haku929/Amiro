'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/(auth)/login/actions';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">設定</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          アプリケーションの設定や情報を確認できます。
        </p>
      </div>

      <div className="space-y-6">
        {/* アカウント設定 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
            アカウント設定
          </h2>
          
          <div className="space-y-6">
            
            {/* テーマ設定 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-zinc-700 dark:text-zinc-200">外観テーマ</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">アプリの配色は端末の設定に従わせることも可能です</p>
              </div>
              
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-white dark:bg-zinc-700 shadow-sm text-rose-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                  title="ライトモード"
                >
                  <Sun size={20} />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-white dark:bg-zinc-700 shadow-sm text-rose-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                  title="ダークモード"
                >
                  <Moon size={20} />
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`p-2 rounded-full transition-all ${theme === 'system' ? 'bg-white dark:bg-zinc-700 shadow-sm text-rose-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                  title="端末の設定に合わせる"
                >
                  <Monitor size={20} />
                </button>
              </div>
            </div>


          </div>
        </section>

        {/* Application Info Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            アプリについて
          </h2>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">バージョン</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">1.0.0</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">利用規約</span>
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">表示</a>
            </div>
             <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">プライバシーポリシー</span>
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">表示</a>
            </div>
          </div>
        </section>
        
        <div className="flex justify-center mt-8">
            <form action={handleLogout}>
                <button 
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    ログアウト
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
