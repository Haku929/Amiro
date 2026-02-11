// // components/SlotManager.tsx
// // components/SlotManager.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { Slot } from '@/lib/types';

// const MAX_SLOTS = 3;

// export default function SlotManager() {
//   const [slots, setSlots] = useState<Record<number, Slot | null>>({
//     1: null, 2: null, 3: null
//   });
//   const [isLoading, setIsLoading] = useState(true);

//   // 【追加】新規作成用の状態管理
//   const [addingIndex, setAddingIndex] = useState<number | null>(null);
//   const [newTitle, setNewTitle] = useState("");

//   // 全スロットの初期ロード
//   useEffect(() => {
//     const fetchSlots = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch('/api/slots');
//         if (response.ok) {
//           const data: Slot[] = await response.json();
//           const slotsMap: Record<number, Slot | null> = { 1: null, 2: null, 3: null };
//           data.forEach(slot => {
//             slotsMap[slot.slot_index] = slot;
//           });
//           setSlots(slotsMap);
//         }
//       } catch (error) {
//         console.error("スロットの取得に失敗しました", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchSlots();
//   }, []);

//   // スロットの保存（作成・更新）
//   const handleSaveSlot = async (slotIndex: number, slotData: Partial<Slot>) => {
//     // 【重要】APIが未完成でも動作確認できるように、先に画面上の状態(State)を更新します
//     const newSlot = { 
//       slot_index: slotIndex, 
//       title: slotData.title || '', 
//       content: slotData.content || '' 
//     } as Slot;
    
//     setSlots(prev => ({ ...prev, [slotIndex]: newSlot }));

//     try {
//       // 実際のAPI通信（APIが未作成の場合は裏側でエラーになりますが、画面の追加処理はブロックされません）
//       await fetch(`/api/slots/${slotIndex}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newSlot),
//       });
//     } catch (error) {
//       console.error("API通信エラー", error);
//     }
//   };

//   // スロットの削除
//   const handleDeleteSlot = async (slotIndex: number) => {
//     if (!confirm(`このスロットを削除してもよろしいですか？`)) return;

//     // こちらも先に画面から削除します
//     setSlots(prev => ({ ...prev, [slotIndex]: null }));

//     try {
//       await fetch(`/api/slots/${slotIndex}`, {
//         method: 'DELETE',
//       });
//     } catch (error) {
//       console.error("削除エラー", error);
//     }
//   };

//   const activeSlotCount = Object.values(slots).filter(slot => slot !== null).length;
//   // 新規追加中（入力中）の枠もカウントに含めます
//   const isFull = activeSlotCount + (addingIndex !== null ? 1 : 0) >= MAX_SLOTS;

//   // 新規登録ボタンの処理（入力モードに切り替え）
//   const handleCreateNewSlot = () => {
//     if (isFull) return;
    
//     const availableIndex = [1, 2, 3].find(index => slots[index] === null);
//     if (availableIndex) {
//       setAddingIndex(availableIndex);
//       setNewTitle(""); // タイトル入力をリセット
//     }
//   };

//   // 追加の確定処理
//   const handleConfirmAdd = () => {
//     if (addingIndex !== null && newTitle.trim() !== "") {
//       handleSaveSlot(addingIndex, { title: newTitle, content: "新規作成されたスロットです。内容は編集できます。" });
//       setAddingIndex(null);
//       setNewTitle("");
//     } else {
//       alert("スロット名を入力してください");
//     }
//   };

//   // 追加のキャンセル
//   const handleCancelAdd = () => {
//     setAddingIndex(null);
//     setNewTitle("");
//   };

//   if (isLoading) return <div className="text-zinc-500">読み込み中...</div>;

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-medium text-zinc-900">
//           登録済みスロット ({activeSlotCount}/{MAX_SLOTS})
//         </h3>
//       </div>
      
//       {/* 登録済みスロットの一覧表示 */}
//       {activeSlotCount === 0 && addingIndex === null ? (
//         <p className="text-zinc-500 text-sm py-8 text-center bg-white border border-dashed border-zinc-300 rounded-xl">
//           保存されたスロットはありません。<br/>下のボタンから新規登録してください。
//         </p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {[1, 2, 3].map((index) => {
            
//             // ▼ 追加中スロットの入力フォーム
//             if (addingIndex === index) {
//               return (
//                 <div key={`add-${index}`} className="border border-zinc-300 rounded-xl p-5 shadow-sm bg-white flex flex-col h-full border-dashed ring-2 ring-zinc-100">
//                   <div className="grow space-y-4">
//                     <div>
//                       <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
//                         新しいスロット名
//                       </label>
//                       <input 
//                         type="text" 
//                         value={newTitle} 
//                         onChange={(e) => setNewTitle(e.target.value)} 
//                         placeholder="スロット名を入力"
//                         className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
//                         autoFocus
//                       />
//                     </div>
//                   </div>
//                   <div className="flex gap-2 pt-4 mt-4 border-t border-zinc-100">
//                     <button 
//                       onClick={handleConfirmAdd} 
//                       className="flex-1 px-3 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
//                     >
//                       保存
//                     </button>
//                     <button 
//                       onClick={handleCancelAdd} 
//                       className="flex-1 px-3 py-2 text-sm font-medium bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
//                     >
//                       キャンセル
//                     </button>
//                   </div>
//                 </div>
//               );
//             }

//             const slot = slots[index];
//             if (!slot) return null; // 空のスロットは表示しない
            
//             // ▼ 既存スロットの表示
//             return (
//               <div key={index} className="border border-zinc-200 rounded-xl p-5 shadow-sm bg-white flex flex-col h-full">
//                 <div className="grow space-y-4">
//                   <div>
//                     <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">タイトル</p>
//                     <p className="font-medium text-zinc-900">{slot.title}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">内容</p>
//                     <p className="text-sm text-zinc-600 line-clamp-3">{slot.content}</p>
//                   </div>
//                 </div>
                
//                 {/* 編集・削除ボタン */}
//                 <div className="flex gap-2 pt-4 mt-4 border-t border-zinc-100">
//                   <button 
//                     onClick={() => {
//                       // 編集も後ほどUI化できますが、今回は暫定でダイアログを残しています
//                       const newTitle = prompt("新しいタイトル", slot.title);
//                       if(newTitle) handleSaveSlot(index, { ...slot, title: newTitle });
//                     }}
//                     className="flex-1 px-3 py-2 text-sm font-medium bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
//                   >
//                     編集
//                   </button>
//                   <button 
//                     onClick={() => handleDeleteSlot(index)}
//                     className="flex-1 px-3 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
//                   >
//                     削除
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* 新規登録ボタン */}
//       <div className="pt-2 flex flex-col items-start gap-2">
//         <button 
//           onClick={handleCreateNewSlot}
//           disabled={isFull}
//           className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
//             isFull 
//               ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
//               : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
//           }`}
//         >
//           ＋ 新規登録
//         </button>
//         {isFull && (
//           <p className="text-sm text-red-500 font-medium">※スロットは最大3つまでです</p>
//         )}
//       </div>
//     </div>
//   );
// }








// components/SlotManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Slot } from '@/lib/types';
import { User } from 'lucide-react'; // アイコンをインポート

const MAX_SLOTS = 3;

// ベクトルの項目名
const VECTOR_TRAITS = ['神経症傾向', '誠実性', '外向性', '協調性', '開放性'];

export default function SlotManager() {
  const [slots, setSlots] = useState<Record<number, Slot | null>>({
    1: null, 2: null, 3: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // 全スロットの初期ロード
  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/slots');
        if (response.ok) {
          const data: Slot[] = await response.json();
          const slotsMap: Record<number, Slot | null> = { 1: null, 2: null, 3: null };
          data.forEach(slot => {
            slotsMap[slot.slot_index] = slot;
          });
          setSlots(slotsMap);
        }
      } catch (error) {
        console.error("スロットの取得に失敗しました", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const handleSaveSlot = async (slotIndex: number, slotData: Partial<Slot>) => {
    // タイムスタンプ用の現在時刻を生成
    const now = new Date();
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newSlot = { 
      slot_index: slotIndex, 
      title: slotData.title || '', 
      content: slotData.content || '',
      updated_at: timestamp // タイムスタンプを保存
    } as Slot;
    
    setSlots(prev => ({ ...prev, [slotIndex]: newSlot }));

    try {
      await fetch(`/api/slots/${slotIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot),
      });
    } catch (error) {
      console.error("API通信エラー", error);
    }
  };

  const handleDeleteSlot = async (slotIndex: number) => {
    if (!confirm(`このスロットを削除してもよろしいですか？`)) return;

    setSlots(prev => ({ ...prev, [slotIndex]: null }));

    try {
      await fetch(`/api/slots/${slotIndex}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("削除エラー", error);
    }
  };

  const activeSlotCount = Object.values(slots).filter(slot => slot !== null).length;
  const isFull = activeSlotCount + (addingIndex !== null ? 1 : 0) >= MAX_SLOTS;

  const handleCreateNewSlot = () => {
    if (isFull) return;
    const availableIndex = [1, 2, 3].find(index => slots[index] === null);
    if (availableIndex) {
      setAddingIndex(availableIndex);
      setNewTitle(""); 
    }
  };

  const handleConfirmAdd = () => {
    if (addingIndex !== null && newTitle.trim() !== "") {
      // AIから生成される「分人要約文」のプレースホルダーとしてセット
      handleSaveSlot(addingIndex, { 
        title: newTitle, 
        content: "この分人は、相手の話を丁寧に聴き、共感を示す傾向が強く表れています。リラックスした関係性を築く際に活性化しやすいペルソナです。" 
      });
      setAddingIndex(null);
      setNewTitle("");
    } else {
      alert("スロット名を入力してください");
    }
  };

  const handleCancelAdd = () => {
    setAddingIndex(null);
    setNewTitle("");
  };

  if (isLoading) return <div className="text-zinc-500">読み込み中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-zinc-900">
          分人スロット ({activeSlotCount}/{MAX_SLOTS})
        </h3>
      </div>
      
      {activeSlotCount === 0 && addingIndex === null ? (
        <p className="text-zinc-500 text-sm py-8 text-center bg-white border border-dashed border-zinc-300 rounded-xl">
          保存された分人データはありません。<br/>下のボタンから新規登録してください。
        </p>
      ) : (
        // 情報量が増えたため、レスポンシブでPC表示時は少し広めに取るか、カラム数を調整します
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => {
            
            // ▼ 追加中スロットの入力フォーム
            if (addingIndex === index) {
              return (
                <div key={`add-${index}`} className="border border-zinc-300 rounded-xl p-5 shadow-sm bg-white flex flex-col h-full border-dashed ring-2 ring-zinc-100">
                  <div className="flex-grow flex flex-col justify-center space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block text-center">
                        新しい分人スロット名
                      </label>
                      <input 
                        type="text" 
                        value={newTitle} 
                        onChange={(e) => setNewTitle(e.target.value)} 
                        placeholder="スロット名を入力"
                        className="w-full px-4 py-3 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-center font-medium"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 mt-4 border-t border-zinc-100">
                    <button onClick={handleConfirmAdd} className="flex-1 px-3 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors">
                      追加する
                    </button>
                    <button onClick={handleCancelAdd} className="flex-1 px-3 py-2 text-sm font-medium bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors">
                      キャンセル
                    </button>
                  </div>
                </div>
              );
            }

            const slot = slots[index];
            if (!slot) return null;
            
            // ▼ 既存スロットの表示（分人モデル）
            return (
              <div key={index} className="relative border border-zinc-200 rounded-xl p-5 shadow-sm bg-white flex flex-col h-full">
                
                {/* 1. 左上: スロット名 / 5. 右上: タイムスタンプ */}
                <div className="flex justify-between items-start w-full z-10">
                  <h4 className="font-bold text-zinc-900 text-base">{slot.title}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {slot.updated_at || "2026/02/11 12:00"}
                  </span>
                </div>

                {/* 3. 上部中央: 分人アイコン */}
                <div className="flex justify-center -mt-2 mb-6">
                  <div className="w-14 h-14 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 shadow-inner">
                    <User strokeWidth={1.5} size={28} />
                  </div>
                </div>

                {/* 真ん中: 自己ベクトル(左) と 共鳴ベクトル(右) */}
                <div className="grid grid-cols-2 gap-4 mb-6 px-2">
                  
                  {/* 左: 自己ベクトル */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-800 text-center border-b border-zinc-100 pb-1">自己ベクトル</p>
                    <div className="space-y-1">
                      {VECTOR_TRAITS.map(trait => (
                        <div key={`self-${trait}`} className="flex justify-between items-center text-[11px] text-zinc-600">
                          <span>{trait}</span>
                          <span className="font-mono bg-zinc-100 px-1.5 rounded">50</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 右: 共鳴ベクトル */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-800 text-center border-b border-zinc-100 pb-1">共鳴ベクトル</p>
                    <div className="space-y-1">
                      {VECTOR_TRAITS.map(trait => (
                        <div key={`res-${trait}`} className="flex justify-between items-center text-[11px] text-zinc-600">
                          <span>{trait}</span>
                          <span className="font-mono bg-zinc-100 px-1.5 rounded">50</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 4. 下部中央: 分人要約文 */}
                <div className="mb-6 flex-grow">
                  <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                    <p className="text-[10px] font-semibold text-zinc-400 mb-1 text-center">分人要約文</p>
                    <p className="text-xs text-zinc-700 leading-relaxed text-center">
                      {slot.content}
                    </p>
                  </div>
                </div>
                
                {/* 編集・削除ボタン */}
                <div className="flex gap-2 pt-4 border-t border-zinc-100 mt-auto">
                  <button 
                    onClick={() => {
                      const newTitle = prompt("新しいスロット名", slot.title);
                      if(newTitle) handleSaveSlot(index, { ...slot, title: newTitle });
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    名前を変更
                  </button>
                  <button 
                    onClick={() => handleDeleteSlot(index)}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 新規登録ボタン */}
      <div className="pt-4 flex flex-col items-start gap-2">
        <button 
          onClick={handleCreateNewSlot}
          disabled={isFull}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isFull 
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
              : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
          }`}
        >
          ＋ 分人を追加
        </button>
        {isFull && (
          <p className="text-sm text-red-500 font-medium">※分人は最大3つまでです</p>
        )}
      </div>
    </div>
  );
}