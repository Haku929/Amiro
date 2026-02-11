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

export type UserProfile = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  slots: Slot[];
};
