export interface Slot {
  id?: string;
  slot_index: number; // 1, 2, 3 のいずれか
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}