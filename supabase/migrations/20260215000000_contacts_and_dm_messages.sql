CREATE TABLE IF NOT EXISTS contacts (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  other_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, other_user_id),
  CONSTRAINT contacts_no_self CHECK (user_id != other_user_id)
);

CREATE TABLE IF NOT EXISTS dm_messages (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT dm_messages_no_self CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_thread ON dm_messages (sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_messages_receiver_created ON dm_messages (receiver_id, created_at DESC);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY contacts_select_own ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY contacts_insert_own ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY contacts_delete_own ON contacts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY dm_messages_select_participant ON dm_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY dm_messages_insert_sender ON dm_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
