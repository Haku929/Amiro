-- Contacts and 1:1 DM tables with RLS policies

create table if not exists public.contacts (
  user_id uuid not null references auth.users (id) on delete cascade,
  other_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint contacts_pkey primary key (user_id, other_user_id),
  constraint contacts_not_self check (user_id <> other_user_id)
);

alter table public.contacts enable row level security;

drop policy if exists "contacts_select_own" on public.contacts;
create policy "contacts_select_own"
  on public.contacts
  for select
  using (auth.uid() = user_id);

drop policy if exists "contacts_insert_own" on public.contacts;
create policy "contacts_insert_own"
  on public.contacts
  for insert
  with check (auth.uid() = user_id and user_id <> other_user_id);

drop policy if exists "contacts_delete_own" on public.contacts;
create policy "contacts_delete_own"
  on public.contacts
  for delete
  using (auth.uid() = user_id);

create table if not exists public.dm_messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint dm_messages_not_self check (sender_id <> receiver_id),
  constraint dm_messages_content_not_blank check (length(btrim(content)) > 0)
);

alter table public.dm_messages enable row level security;

drop policy if exists "dm_messages_select_participants" on public.dm_messages;
create policy "dm_messages_select_participants"
  on public.dm_messages
  for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "dm_messages_insert_sender_only" on public.dm_messages;
create policy "dm_messages_insert_sender_only"
  on public.dm_messages
  for insert
  with check (auth.uid() = sender_id and sender_id <> receiver_id);

create index if not exists idx_dm_messages_thread
  on public.dm_messages (
    least(sender_id, receiver_id),
    greatest(sender_id, receiver_id),
    created_at desc
  );

create index if not exists idx_dm_messages_receiver_created
  on public.dm_messages (receiver_id, created_at desc);
