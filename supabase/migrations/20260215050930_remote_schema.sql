drop extension if exists "pg_net";

create schema if not exists "profiles";

create schema if not exists "situations";

create schema if not exists "slots";

create extension if not exists "vector" with schema "public";


  create table "profiles"."profiles_table" (
    "user_id" uuid not null default auth.uid(),
    "display_name" text not null,
    "avatar_url" text
      );


alter table "profiles"."profiles_table" enable row level security;


  create table "public"."documents_with_self_vector" (
    "id" uuid not null default gen_random_uuid(),
    "content" text,
    "self_vector" public.vector(1536),
    "created_at" timestamp with time zone default now()
      );


alter table "public"."documents_with_self_vector" enable row level security;


  create table "public"."profiles" (
    "user_id" uuid not null,
    "display_name" text,
    "avatar_url" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "bio" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."situations" (
    "id" uuid not null default gen_random_uuid(),
    "text" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."situations" enable row level security;


  create table "public"."slots" (
    "user_id" uuid not null,
    "slot_index" integer not null,
    "self_vector" public.vector(5),
    "resonance_vector" public.vector(5),
    "persona_icon" text not null,
    "persona_summary" text not null,
    "created_at" timestamp with time zone not null default now(),
    "conversation" jsonb
      );


alter table "public"."slots" enable row level security;


  create table "slots"."slots_table" (
    "user_id" uuid not null default gen_random_uuid(),
    "slot_index" numeric not null,
    "self_vector" public.vector(5),
    "resonance_vector" public.vector,
    "persona_icon" text,
    "persona_summary" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "slots"."slots_table" enable row level security;

CREATE UNIQUE INDEX "user-information_pkey" ON profiles.profiles_table USING btree (user_id);

CREATE UNIQUE INDEX documents_with_self_vector_pkey ON public.documents_with_self_vector USING btree (id);

CREATE INDEX documents_with_self_vector_self_vector_idx ON public.documents_with_self_vector USING ivfflat (self_vector) WITH (lists='100');

CREATE INDEX idx_documents_self_vector_ivfflat ON public.documents_with_self_vector USING ivfflat (self_vector) WITH (lists='100');

CREATE INDEX idx_profiles_display_name ON public.profiles USING btree (display_name);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (user_id);

CREATE UNIQUE INDEX situations_pkey ON public.situations USING btree (id);

CREATE UNIQUE INDEX slots_user_id_slot_index_key ON public.slots USING btree (user_id, slot_index);

CREATE INDEX idx_slots_user_id ON slots.slots_table USING btree (user_id);

CREATE UNIQUE INDEX "slots-table_pkey" ON slots.slots_table USING btree (user_id);

CREATE UNIQUE INDEX "slots-table_slot_index_key" ON slots.slots_table USING btree (slot_index);

CREATE INDEX slots_table_self_vector_idx ON slots.slots_table USING ivfflat (self_vector public.vector_cosine_ops) WITH (lists='100');

CREATE INDEX slots_table_self_vector_idx1 ON slots.slots_table USING ivfflat (self_vector public.vector_cosine_ops) WITH (lists='100');

alter table "profiles"."profiles_table" add constraint "user-information_pkey" PRIMARY KEY using index "user-information_pkey";

alter table "public"."documents_with_self_vector" add constraint "documents_with_self_vector_pkey" PRIMARY KEY using index "documents_with_self_vector_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."situations" add constraint "situations_pkey" PRIMARY KEY using index "situations_pkey";

alter table "slots"."slots_table" add constraint "slots-table_pkey" PRIMARY KEY using index "slots-table_pkey";

alter table "public"."slots" add constraint "slots_conversation_format_check" CHECK (public.is_valid_slot_conversation(conversation)) not valid;

alter table "public"."slots" validate constraint "slots_conversation_format_check";

alter table "public"."slots" add constraint "slots_slot_index_check" CHECK (((slot_index >= 1) AND (slot_index <= 3))) not valid;

alter table "public"."slots" validate constraint "slots_slot_index_check";

alter table "public"."slots" add constraint "slots_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."slots" validate constraint "slots_user_id_fkey";

alter table "public"."slots" add constraint "slots_user_id_slot_index_key" UNIQUE using index "slots_user_id_slot_index_key";

alter table "slots"."slots_table" add constraint "slots-table_slot_index_key" UNIQUE using index "slots-table_slot_index_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public."function-for-Trigger"()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
insert into public.profiles(id, username)
values(new.id, split_part(new.email, '@', 1));

return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_matching_scores(my_user_id uuid, limit_n integer DEFAULT 100)
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, resonance_score double precision, matched_slot_index_self integer, matched_slot_index_other integer, score_self_to_other double precision, score_other_to_self double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if auth.uid() <> my_user_id then
    raise exception 'my_user_id must match auth.uid()';
  end if;

  return query
  with my_slots as (
    select
      s.slot_index,
      s.self_vector,
      s.resonance_vector
    from public.slots s
    where s.user_id = my_user_id
      and s.self_vector is not null
      and s.resonance_vector is not null
  ),
  pair_scores as (
    select
      os.user_id as other_user_id,
      ms.slot_index as matched_slot_index_self,
      os.slot_index as matched_slot_index_other,
      (1 - (ms.resonance_vector <=> os.self_vector))::double precision as score_self_to_other,
      (1 - (os.resonance_vector <=> ms.self_vector))::double precision as score_other_to_self
    from my_slots ms
    join public.slots os
      on os.user_id <> my_user_id
    where os.self_vector is not null
      and os.resonance_vector is not null
  ),
  ranked as (
    select
      p.other_user_id,
      p.matched_slot_index_self,
      p.matched_slot_index_other,
      p.score_self_to_other,
      p.score_other_to_self,
      (p.score_self_to_other * p.score_other_to_self) as resonance_score,
      row_number() over (
        partition by p.other_user_id
        order by (p.score_self_to_other * p.score_other_to_self) desc,
                 p.score_self_to_other desc,
                 p.score_other_to_self desc,
                 p.matched_slot_index_self asc,
                 p.matched_slot_index_other asc
      ) as rn
    from pair_scores p
  )
  select
    r.other_user_id as user_id,
    p.display_name,
    p.avatar_url,
    r.resonance_score,
    r.matched_slot_index_self,
    r.matched_slot_index_other,
    r.score_self_to_other,
    r.score_other_to_self
  from ranked r
  join public.profiles p
    on p.user_id = r.other_user_id
  where r.rn = 1
  order by r.resonance_score desc, r.other_user_id
  limit greatest(limit_n, 0);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_matching_scores(my_user_id uuid, limit_n integer DEFAULT 20, offset_n integer DEFAULT 0)
 RETURNS TABLE(other_user_id uuid, resonance_score double precision, matched_slot_index_self integer, matched_slot_index_other integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if auth.uid() <> my_user_id then
    raise exception 'my_user_id must match auth.uid()';
  end if;

  return query
  with my_slots as (
    select
      s.slot_index,
      s.self_vector,
      s.resonance_vector
    from public.slots s
    where s.user_id = my_user_id
      and s.self_vector is not null
      and s.resonance_vector is not null
  ),
  pair_scores as (
    select
      os.user_id as other_user_id,
      ms.slot_index as matched_slot_index_self,
      os.slot_index as matched_slot_index_other,
      (1 - (ms.resonance_vector <=> os.self_vector))::double precision as score_self_to_other,
      (1 - (os.resonance_vector <=> ms.self_vector))::double precision as score_other_to_self
    from my_slots ms
    join public.slots os
      on os.user_id <> my_user_id
    where os.self_vector is not null
      and os.resonance_vector is not null
  ),
  ranked as (
    select
      p.other_user_id,
      p.matched_slot_index_self,
      p.matched_slot_index_other,
      (p.score_self_to_other * p.score_other_to_self) as resonance_score,
      row_number() over (
        partition by p.other_user_id
        order by (p.score_self_to_other * p.score_other_to_self) desc,
                 p.score_self_to_other desc,
                 p.score_other_to_self desc,
                 p.matched_slot_index_self asc,
                 p.matched_slot_index_other asc
      ) as rn
    from pair_scores p
  )
  select
    r.other_user_id,
    r.resonance_score,
    r.matched_slot_index_self,
    r.matched_slot_index_other
  from ranked r
  where r.rn = 1
  order by r.resonance_score desc, r.other_user_id
  limit greatest(limit_n, 0)
  offset greatest(offset_n, 0);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_auth_user_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insert a profile row if it doesn't already exist
  INSERT INTO public.profiles (user_id, display_name, avatar_url, created_at, updated_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), NULL, now(), now())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'New user'),
    null
  )
  on conflict (user_id) do nothing;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_valid_slot_conversation(payload jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
declare
  m jsonb;
begin
  if payload is null then
    return true;
  end if;

  if jsonb_typeof(payload) <> 'object' then
    return false;
  end if;

  if not (payload ? 'messages') then
    return false;
  end if;

  if jsonb_typeof(payload->'messages') <> 'array' then
    return false;
  end if;

  for m in select value from jsonb_array_elements(payload->'messages')
  loop
    if jsonb_typeof(m) <> 'object' then
      return false;
    end if;

    if not (m ? 'role') or jsonb_typeof(m->'role') <> 'string' then
      return false;
    end if;

    if not (m ? 'content') or jsonb_typeof(m->'content') <> 'string' then
      return false;
    end if;

    if (m->>'role') not in ('user', 'model') then
      return false;
    end if;
  end loop;

  return true;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.profiles_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."documents_with_self_vector" to "anon";

grant insert on table "public"."documents_with_self_vector" to "anon";

grant references on table "public"."documents_with_self_vector" to "anon";

grant select on table "public"."documents_with_self_vector" to "anon";

grant trigger on table "public"."documents_with_self_vector" to "anon";

grant truncate on table "public"."documents_with_self_vector" to "anon";

grant update on table "public"."documents_with_self_vector" to "anon";

grant delete on table "public"."documents_with_self_vector" to "authenticated";

grant insert on table "public"."documents_with_self_vector" to "authenticated";

grant references on table "public"."documents_with_self_vector" to "authenticated";

grant select on table "public"."documents_with_self_vector" to "authenticated";

grant trigger on table "public"."documents_with_self_vector" to "authenticated";

grant truncate on table "public"."documents_with_self_vector" to "authenticated";

grant update on table "public"."documents_with_self_vector" to "authenticated";

grant delete on table "public"."documents_with_self_vector" to "service_role";

grant insert on table "public"."documents_with_self_vector" to "service_role";

grant references on table "public"."documents_with_self_vector" to "service_role";

grant select on table "public"."documents_with_self_vector" to "service_role";

grant trigger on table "public"."documents_with_self_vector" to "service_role";

grant truncate on table "public"."documents_with_self_vector" to "service_role";

grant update on table "public"."documents_with_self_vector" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."situations" to "anon";

grant insert on table "public"."situations" to "anon";

grant references on table "public"."situations" to "anon";

grant select on table "public"."situations" to "anon";

grant trigger on table "public"."situations" to "anon";

grant truncate on table "public"."situations" to "anon";

grant update on table "public"."situations" to "anon";

grant delete on table "public"."situations" to "authenticated";

grant insert on table "public"."situations" to "authenticated";

grant references on table "public"."situations" to "authenticated";

grant select on table "public"."situations" to "authenticated";

grant trigger on table "public"."situations" to "authenticated";

grant truncate on table "public"."situations" to "authenticated";

grant update on table "public"."situations" to "authenticated";

grant delete on table "public"."situations" to "service_role";

grant insert on table "public"."situations" to "service_role";

grant references on table "public"."situations" to "service_role";

grant select on table "public"."situations" to "service_role";

grant trigger on table "public"."situations" to "service_role";

grant truncate on table "public"."situations" to "service_role";

grant update on table "public"."situations" to "service_role";

grant delete on table "public"."slots" to "anon";

grant insert on table "public"."slots" to "anon";

grant references on table "public"."slots" to "anon";

grant select on table "public"."slots" to "anon";

grant trigger on table "public"."slots" to "anon";

grant truncate on table "public"."slots" to "anon";

grant update on table "public"."slots" to "anon";

grant delete on table "public"."slots" to "authenticated";

grant insert on table "public"."slots" to "authenticated";

grant references on table "public"."slots" to "authenticated";

grant select on table "public"."slots" to "authenticated";

grant trigger on table "public"."slots" to "authenticated";

grant truncate on table "public"."slots" to "authenticated";

grant update on table "public"."slots" to "authenticated";

grant delete on table "public"."slots" to "service_role";

grant insert on table "public"."slots" to "service_role";

grant references on table "public"."slots" to "service_role";

grant select on table "public"."slots" to "service_role";

grant trigger on table "public"."slots" to "service_role";

grant truncate on table "public"."slots" to "service_role";

grant update on table "public"."slots" to "service_role";


  create policy "profiles_only_own_rows_delete"
  on "profiles"."profiles_table"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "profiles_only_own_rows_insert"
  on "profiles"."profiles_table"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "profiles_only_own_rows_select"
  on "profiles"."profiles_table"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "profiles_only_own_rows_update"
  on "profiles"."profiles_table"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "profiles_delete_own"
  on "public"."profiles"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = user_id));



  create policy "profiles_insert_own"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "profiles_select_own"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "profiles_update_own"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "situations_select_authenticated"
  on "public"."situations"
  as permissive
  for select
  to authenticated
using (true);



  create policy "slots_delete_own"
  on "public"."slots"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = user_id));



  create policy "slots_insert_own"
  on "public"."slots"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "slots_select_others_for_matching"
  on "public"."slots"
  as permissive
  for select
  to authenticated
using ((auth.uid() <> user_id));



  create policy "slots_select_own"
  on "public"."slots"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "slots_update_own"
  on "public"."slots"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "slots_table_user_delete"
  on "slots"."slots_table"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "slots_table_user_insert"
  on "slots"."slots_table"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "slots_table_user_select"
  on "slots"."slots_table"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "slots_table_user_update"
  on "slots"."slots_table"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


CREATE TRIGGER "Trigger" AFTER INSERT ON profiles.profiles_table FOR EACH ROW EXECUTE FUNCTION public."function-for-Trigger"();

CREATE TRIGGER set_updated_at_on_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profiles_set_updated_at();

CREATE TRIGGER auth_user_insert_profile_trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_insert();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


