import { User } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

interface MyProfileCardProps {
    profile: UserProfile;
    currentSlotIndex: number;
    onSlotChange: (index: number) => void;
}

export default function MyProfileCard({ profile, currentSlotIndex, onSlotChange }: MyProfileCardProps) {
    // Find the current slot (bunjin)
    const currentSlot = profile.slots.find(s => s.slotIndex === currentSlotIndex);

    return (
        <div className="flex flex-col items-center bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 h-full overflow-hidden">
            <div className="w-full flex-1 flex flex-col items-center text-center overflow-y-auto pr-2 custom-scrollbar">

                {/* Avatar */}
                <div className="relative mb-4">
                    <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center shrink-0 border border-zinc-200 overflow-hidden">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-zinc-400" size={40} />
                        )}
                    </div>
                </div>

                {/* Name */}
                <h2 className="text-lg font-bold text-zinc-900 truncate w-full mb-4 px-2">
                    {profile.displayName}
                </h2>

                {/* Slot Switcher (Tabs) */}
                <div className="flex items-center gap-2 mb-6 bg-zinc-100 p-1 rounded-full">
                    {[1, 2, 3].map((num) => (
                        <button
                            key={num}
                            onClick={() => onSlotChange(num)}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${currentSlotIndex === num
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            分人{num}
                        </button>
                    ))}
                </div>

                {/* Bio */}
                <div className="w-full text-left space-y-4">
                    <div>
                        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">自己紹介</h3>
                        <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                            <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                {profile.bio || "自己紹介はまだありません"}
                            </p>
                        </div>
                    </div>

                    {/* Persona Summary */}
                    {currentSlot && (
                        <div>
                            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">分人要約</h3>
                            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                    {currentSlot.personaSummary || "要約はまだ生成されていません"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
