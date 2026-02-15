import { User, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { MatchingResult } from '@/lib/types';

interface MatchingListProps {
    candidates: MatchingResult[];
}

function MatchingCard({ candidate }: { candidate: MatchingResult }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Sparkle background effect */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={100} className="text-indigo-500" />
            </div>

            <div className="flex flex-col md:flex-row gap-6 relative z-10">

                {/* Left: Avatar & Name & Score */}
                <div className="flex flex-col items-center gap-3 shrink-0 w-32">
                    <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200 overflow-hidden">
                        {candidate.avatarUrl ? (
                            <img src={candidate.avatarUrl} alt={candidate.displayName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-zinc-400" size={32} />
                        )}
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 text-center leading-tight line-clamp-2 w-full">{candidate.displayName}</h3>

                    {(() => {
                        const scoreVal = candidate.resonanceScore <= 1 ? candidate.resonanceScore * 100 : candidate.resonanceScore;
                        const hue = Math.max(0, Math.min(240, 240 - (scoreVal * 2.4)));
                        const mainColor = `hsl(${hue}, 90%, 55%)`;
                        const bgColor = `hsla(${hue}, 90%, 55%, 0.1)`;
                        const borderColor = `hsla(${hue}, 90%, 55%, 0.2)`;

                        return (
                            <div
                                className="flex flex-col items-center px-3 py-1.5 rounded-xl border w-full transition-colors"
                                style={{ backgroundColor: bgColor, borderColor: borderColor }}
                            >
                                <div className="flex items-center gap-1">
                                    <Zap size={14} fill="currentColor" style={{ color: mainColor }} />
                                    <span className="text-xs font-bold" style={{ color: mainColor, opacity: 0.8 }}>共鳴スコア</span>
                                </div>
                                <span className="text-xl font-black leading-none" style={{ color: mainColor }}>
                                    {scoreVal.toFixed(1)}
                                </span>
                            </div>
                        );
                    })()}
                </div>

                {/* Right: Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className="text-xs text-zinc-500 bg-zinc-100 inline-block px-2 py-1 rounded-md mb-2">
                                イロ {candidate.matchedSlotIndexSelf} と共鳴
                            </p>
                        </div>

                        <Link
                            href={`/matching/${candidate.userId}?slot=${candidate.matchedSlotIndexSelf}&targetSlot=${candidate.matchedSlotIndexOther}&score=${candidate.resonanceScore}`}
                            className="px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-full hover:bg-zinc-700 transition-colors shrink-0"
                        >
                            詳細を見る
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {/* Bio Summary */}
                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                            <p className="text-xs text-zinc-500 font-bold mb-1">自己紹介</p>
                            <p className="text-sm text-zinc-700 line-clamp-2">{candidate.bio || "自己紹介なし"}</p>
                        </div>

                        {/* Persona Summary */}
                        <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                            <p className="text-xs text-indigo-400 font-bold mb-1">イロ要約</p>
                            <p className="text-sm text-zinc-700 line-clamp-2">{candidate.personaSummary || "要約なし"}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function MatchingList({ candidates }: MatchingListProps) {
    if (candidates.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <Sparkles size={48} className="mb-4 opacity-20" />
                <p>共鳴する相手が見つかりませんでした</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pb-20">
            {candidates.map((candidate) => (
                <MatchingCard key={candidate.userId} candidate={candidate} />
            ))}
        </div>
    );
}
