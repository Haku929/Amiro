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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
      });

      if (res.ok) {
        // 削除成功 -> ログイン画面へ (あるいはトップへ)
        router.push('/login');
        router.refresh();
      } else {
        const data = await res.json();
        alert(`削除に失敗しました: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('削除処理中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
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

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-700 dark:text-zinc-200">ログアウト</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">アカウントからログアウトします</p>
              </div>
              <button 
                className="px-4 py-2 text-sm font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                onClick={handleLogout}
              >
                ログアウト
              </button>
            </div>
          </div>
        </section>

        {/* 危険な設定 (アカウント削除) */}
        <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
            危険な設定
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">アカウントの削除</h3>
              <p className="text-sm text-red-600 dark:text-red-400/80">
                アカウントと全てのデータを完全に削除します。<br/>この操作は取り消せません。
              </p>
            </div>
            <button 
              className="px-4 py-2 text-sm font-bold text-red-600 border border-red-200 dark:border-red-800 bg-white dark:bg-red-900/20 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              削除する
            </button>
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

      {/* 削除確認モーダル */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">本当に削除しますか？</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              アカウントを削除すると、これまでの対話履歴やプロフィールなど全てのデータが失われます。<br/>
              <span className="font-bold text-red-500">この操作は元に戻せません。</span>
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                disabled={isDeleting}
              >
                キャンセル
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
