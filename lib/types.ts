export type Big5Vector = {
  o: number;
  c: number;
  e: number;
  a: number;
  n: number;
};

export type Slot = {
  slotIndex: 1 | 2 | 3;
  selfVector: Big5Vector;
  resonanceVector: Big5Vector;
  personaIcon: string;
  personaSummary: string;
  createdAt: string;
};

export type SaveSlotRequest = {
  selfVector: Big5Vector;
  resonanceVector: Big5Vector;
  personaIcon: string;
  personaSummary: string;
};

export type UserProfile = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  slots: Slot[];
};

export type MatchingResult = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  resonanceScore: number;
  matchedSlotIndexSelf: number;
  matchedSlotIndexOther: number;
  personaSummary: string;
};
