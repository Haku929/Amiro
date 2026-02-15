// app/(app)/matching/page.tsx
import MatchingContainer from '@/components/layout/MatchingContainer';

export const metadata = {
  title: '共鳴マッチング | Amiro',
};

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function MatchingPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <MatchingContainer />
    </Suspense>
  );
}