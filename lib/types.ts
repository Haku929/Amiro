export type Big5Vector = {
  o: number;
  c: number;
  e: number;
  a: number;
  n: number;
};

export type ChatMessage = {
  role: "user" | "model";
  content: string;
};

export type SlotConversation = {
  messages: ChatMessage[];
};

export type Slot = {
  slotIndex: 1 | 2 | 3;
  selfVector: Big5Vector;
  resonanceVector: Big5Vector;
  personaIcon: string;
  personaSummary: string;
  createdAt: string;
  conversation?: SlotConversation;
};

export type SaveSlotRequest = {
  selfVector: Big5Vector;
  resonanceVector: Big5Vector;
  personaIcon: string;
  personaSummary: string;
  conversation?: { messages: ChatMessage[] };
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
  resonanceScore: number;
  matchedSlotIndexSelf: number;
  matchedSlotIndexOther: number;
};

