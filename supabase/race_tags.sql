-- Race tags: run this ONCE in the Supabase SQL Editor (Dashboard > SQL Editor > New query > paste > Run). Safe to run again.
-- It is the same block that sits at the end of supabase/schema.sql (kept there as the master copy). Needs the friends tables from the rest of schema.sql to exist already.

---------------------------------------------------------------- race tags (Race Log: "who went with you", Nov 27 2026)
-- A friend can tag a friend in a race weekend. The tagged friend sees it IN THE APP (their Passport > My races; there is no push notification and nothing is written
-- to `notifications`) and chooses "Add to my log" or "No thanks". Only accepted friends can tag you, and you can switch tags off. Sender and receiver see each other
-- under "With" once it is accepted; a decline is never shown to the sender (it just stays "sent").
alter table public.profiles add column if not exists allow_tags boolean not null default true;

create or replace function public.my_profile() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('display_name', p.display_name, 'show_global', p.show_global, 'invite_code', i.code, 'avatar', p.avatar, 'photo_v', p.photo_v, 'allow_tags', p.allow_tags)
  from public.profiles p left join public.invites i on i.user_id = p.id where p.id = auth.uid()
$$;
revoke all on function public.my_profile() from public, anon;
grant execute on function public.my_profile() to authenticated;

create table if not exists public.race_tags (
  id           bigint generated always as identity primary key,
  from_user    uuid not null references auth.users(id) on delete cascade,
  to_user      uuid not null references auth.users(id) on delete cascade,
  track        text not null check (track ~ '^[a-z0-9-]{1,40}$'),
  ev           text not null check (ev ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),     -- the event's first day, as in the app's track files
  title        text not null default '' check (char_length(title) <= 80),
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  unique (from_user, to_user, track, ev),
  check (from_user <> to_user)
);
create index if not exists race_tags_to on public.race_tags (to_user, status);
create index if not exists race_tags_from on public.race_tags (from_user, created_at desc);
alter table public.race_tags enable row level security;
drop policy if exists race_tags_own on public.race_tags;
create policy race_tags_own on public.race_tags for select to authenticated using (auth.uid() in (from_user, to_user));
revoke insert, update, delete on public.race_tags from anon, authenticated;

create or replace function public._are_friends(a uuid, b uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.friendships where user_a = least(a, b) and user_b = greatest(a, b))
$$;
revoke all on function public._are_friends(uuid, uuid) from public, anon, authenticated;

-- tag a friend. Returns 'pending' | 'accepted' | 'off' (they have tags switched off). At most 40 new tags a day.
create or replace function public.tag_friend(p_to uuid, p_track text, p_ev text, p_title text) returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); st text;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  if p_to is null or p_to = uid or not public._are_friends(uid, p_to) then raise exception 'You can only tag friends' using errcode = '42501'; end if;
  if p_track !~ '^[a-z0-9-]{1,40}$' or p_ev !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'Bad race' using errcode = '22023'; end if;
  if not (select allow_tags from public.profiles where id = p_to) then return 'off'; end if;
  select status into st from public.race_tags where from_user = uid and to_user = p_to and track = p_track and ev = p_ev;
  if st is not null then return case when st = 'accepted' then 'accepted' else 'pending' end; end if;
  if (select count(*) from public.race_tags where from_user = uid and created_at > now() - interval '1 day') >= 40 then raise exception 'Too many tags today' using errcode = '54000'; end if;
  insert into public.race_tags(from_user, to_user, track, ev, title) values (uid, p_to, p_track, p_ev, left(coalesce(p_title, ''), 80));
  return 'pending';
end $$;
revoke all on function public.tag_friend(uuid, text, text, text) from public, anon;
grant execute on function public.tag_friend(uuid, text, text, text) to authenticated;

-- take a tag back (sender)
create or replace function public.untag_friend(p_to uuid, p_track text, p_ev text) returns void language sql security definer set search_path = public as $$
  delete from public.race_tags where from_user = auth.uid() and to_user = p_to and track = p_track and ev = p_ev
$$;
revoke all on function public.untag_friend(uuid, text, text) from public, anon;
grant execute on function public.untag_friend(uuid, text, text) to authenticated;

-- tags waiting for me (pending), newest first
create or replace function public.my_tags() returns table (id bigint, from_user uuid, from_name text, track text, ev text, title text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select t.id, t.from_user, p.display_name, t.track, t.ev, t.title, t.created_at
  from public.race_tags t join public.profiles p on p.id = t.from_user
  where t.to_user = auth.uid() and t.status = 'pending' and public._are_friends(t.from_user, t.to_user)
  order by t.created_at desc limit 20
$$;
revoke all on function public.my_tags() from public, anon;
grant execute on function public.my_tags() to authenticated;

-- answer a tag (receiver)
create or replace function public.respond_tag(p_id bigint, p_accept boolean) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); r record;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  update public.race_tags set status = case when p_accept then 'accepted' else 'declined' end, responded_at = now()
    where id = p_id and to_user = uid and status = 'pending' returning * into r;
  if r.id is null then return null; end if;
  return jsonb_build_object('track', r.track, 'ev', r.ev, 'title', r.title, 'status', r.status, 'from', r.from_user,
    'from_name', (select display_name from public.profiles where id = r.from_user));
end $$;
revoke all on function public.respond_tag(bigint, boolean) from public, anon;
grant execute on function public.respond_tag(bigint, boolean) to authenticated;

-- who is linked to me for one race: friends I tagged ('sent' until they accept, then 'joined'; a decline still reads 'sent') and friends who tagged me and I accepted ('joined')
create or replace function public.race_with(p_track text, p_ev text) returns table (user_id uuid, display_name text, state text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, case when t.status = 'accepted' then 'joined' else 'sent' end
  from public.race_tags t join public.profiles p on p.id = t.to_user
  where t.from_user = auth.uid() and t.track = p_track and t.ev = p_ev and public._are_friends(t.from_user, t.to_user)
  union all
  select p.id, p.display_name, 'joined'
  from public.race_tags t join public.profiles p on p.id = t.from_user
  where t.to_user = auth.uid() and t.track = p_track and t.ev = p_ev and t.status = 'accepted' and public._are_friends(t.from_user, t.to_user)
$$;
revoke all on function public.race_with(text, text) from public, anon;
grant execute on function public.race_with(text, text) to authenticated;

-- let friends tag me (default on)
create or replace function public.set_allow_tags(p_on boolean) returns void language sql security definer set search_path = public as $$
  update public.profiles set allow_tags = coalesce(p_on, true) where id = auth.uid()
$$;
revoke all on function public.set_allow_tags(boolean) from public, anon;
grant execute on function public.set_allow_tags(boolean) to authenticated;
