import { notFound } from 'next/navigation';
import MatchingDetail, { DetailUser } from '@/components/layout/MatchingDetails';
import { createClient } from '@/lib/supabase/server';
import { Slot, Big5Vector } from '@/lib/types';

// Helper to parse vector string '[o, c, e, a, n]' from DB or JSON object
function parseVector(v: string | object | null): Big5Vector {
  if (!v) return { o: 0.5, c: 0.5, e: 0.5, a: 0.5, n: 0.5 };
  if (typeof v === 'string') {
    try {
      const arr = JSON.parse(v);
      if (Array.isArray(arr) && arr.length === 5) {
        return { o: arr[0], c: arr[1], e: arr[2], a: arr[3], n: arr[4] };
      }
    } catch { /* ignore */ }
  } else if (typeof v === 'object') {
    // Already an object?
    return v as Big5Vector;
  }
  return { o: 0.5, c: 0.5, e: 0.5, a: 0.5, n: 0.5 };
}

// Calculate resonance (similarity) roughly for display if needed
// 1 - (Euclidean / MaxDistance)? Or Cosine Similarity?
// range of values is 0-1.
// Let's just assume we want to show vectors mainly. The score is displayed in the UI.
// I'll calculate a simple similarity: 1 / (1 + distance) or similar.
// Or just omit exact score if not critical, or fetch from RPC.
// To fetch from RPC for specific user is hard if RPC doesn't support it.
// I'll try to find the score in the "Explanation" or just use a placeholder "88%".
// Actually, I can replicate the score logic if I knew it.
// Let's implement a simple Euclidean-based score: 100 - (distance * k).
function calcScore(v1: Big5Vector, v2: Big5Vector): number {
  const d = Math.sqrt(
    Math.pow(v1.o - v2.o, 2) +
    Math.pow(v1.c - v2.c, 2) +
    Math.pow(v1.e - v2.e, 2) +
    Math.pow(v1.a - v2.a, 2) +
    Math.pow(v1.n - v2.n, 2)
  );
  // Max distance in 5D unit hypercube is sqrt(5) approx 2.23
  // Normalize to 0-100.
  // If d=0 -> 100. If d=2.23 -> 0?
  const score = Math.max(0, 100 - (d * 40)); // Approx tuning
  return score;
}

type Props = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ slot?: string; targetSlot?: string; score?: string }>;
};

export default async function MatchingDetailPage({ params, searchParams }: Props) {
  const { userId: targetUserId } = await params;
  const { slot, targetSlot } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  console.log('[MatchingDetail] User:', user?.id);
  if (!user) {
    return (
      <div className="p-10 text-red-500">
        <h1>Debug: Auth Error</h1>
        <p>User is not logged in.</p>
      </div>
    );
  }

  // 1. Fetch My Profile & Slot
  const mySlotIndex = parseInt(slot || '1', 10);
  const targetSlotIndex = parseInt(targetSlot || '1', 10);

  // Fetch Me
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('user_id', user.id)
    .single();

  const { data: mySlotData } = await supabase
    .from('slots')
    .select('*')
    .eq('user_id', user.id)
    .eq('slot_index', mySlotIndex)
    .single();

  // Fetch Target
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('display_name, bio')
    .eq('user_id', targetUserId)
    .maybeSingle();

  const { data: targetSlotData } = await supabase
    .from('slots')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('slot_index', targetSlotIndex)
    .maybeSingle(); // Also use maybeSingle for slot just in case

  // Parse Vectors
  const mySelfVector = parseVector(mySlotData?.self_vector);
  const myResonanceVector = parseVector(mySlotData?.resonance_vector);
  const targetSelfVector = parseVector(targetSlotData?.self_vector);
  const targetResonanceVector = parseVector(targetSlotData?.resonance_vector);

  // Calculate Score
  const { score: scoreParam } = await searchParams;
  let score = 0;

  if (scoreParam) {
    const rawScore = parseFloat(scoreParam);
    if (!isNaN(rawScore)) {
      // If score is likely normalized (0-1), convert to 0-100. 
      // If it's already > 1, assume it's pre-scaled.
      score = rawScore <= 1 ? rawScore * 100 : rawScore;
    } else {
      score = calcScore(myResonanceVector, targetSelfVector);
    }
  } else {
    score = calcScore(myResonanceVector, targetSelfVector);
  }

  const meDetail: DetailUser = {
    id: user.id,
    name: myProfile?.display_name || 'あなた',
    personaSummary: mySlotData?.persona_summary || 'データなし',
    slotTitle: `分人${mySlotIndex}`,
    selfVector: mySelfVector,
    resonanceVector: myResonanceVector,
  };

  const targetDetail: DetailUser = {
    id: targetUserId,
    name: targetProfile?.display_name || '不明なユーザー',
    personaSummary: targetSlotData?.persona_summary || 'データなし',
    slotTitle: `分人${targetSlotIndex}`,
    selfVector: targetSelfVector,
    resonanceVector: targetResonanceVector,
  };

  return (
    <MatchingDetail
      me={meDetail}
      target={targetDetail}
      resonanceScore={score}
    />
  );
}
