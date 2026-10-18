-- Trackside Pass accounts, picks and leaderboards (Supabase / Postgres).
-- Run once in the Supabase SQL editor (or paste in pieces); it is safe to run again (create ... if not exists / create or replace).
--
-- Design rules
--  * Nobody can write a pick, a score or a result directly: the tables have no insert/update policies for apps. Picks go through save_picks(),
--    which checks the lock, takes the time and the win chance from the SERVER, and keeps the banked chance when a pick is re-sent unchanged.
--  * `games` (entry list, win chances, session times, official result) is written only by tools/sync_games.py with the service-role key
--    (a GitHub Actions secret, never in the repo or the app).
--  * Scores are computed here from games.result with the same rules as js/app.js (5 / 2 points x sqrt(10/chance) clamped .5-3 x timing 1.25/1/.75).
--  * Email addresses live only in Supabase's own auth.users, which the app can never read. Public identity = display name + points.

---------------------------------------------------------------- games (written by the sync tool only)
create table if not exists public.games (
  game_key    text primary key,                  -- "cota|2026-10-23|f1"  (track | event start | series), same as the app's gameKey()
  track       text not null,
  series      text not null,
  event_start date not null,
  title       text not null,
  quali_start timestamptz,
  quali_end   timestamptz,
  race_start  timestamptz not null,
  entries     jsonb not null default '{}'::jsonb, -- {"Race": {"12": 34.6, "3": 24.0}}  class -> car number -> win chance %
  result      jsonb,                              -- {"Race": {"exact": ["3","16","12"], "podium": ["3","16","12"]}}  exact may hold nulls (unknown places)
  updated_at  timestamptz not null default now()
);
alter table public.games enable row level security;
drop policy if exists games_read on public.games;
create policy games_read on public.games for select to anon, authenticated using (true);

---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  show_global   boolean not null default true,    -- on the all-players leaderboard (friends always see you)
  created_at    timestamptz not null default now(),
  constraint display_name_shape check (display_name ~ '^[A-Za-z0-9][A-Za-z0-9 _.-]{1,18}[A-Za-z0-9]$')
);
create unique index if not exists profiles_name_ci on public.profiles (lower(display_name));
alter table public.profiles enable row level security;
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);   -- id + display name + flags only: no email exists here
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke insert, delete on public.profiles from anon, authenticated;
revoke update on public.profiles from anon, authenticated;
grant update (display_name, show_global) on public.profiles to authenticated;

create table if not exists public.name_blocklist (word text primary key);
insert into public.name_blocklist(word) values ('fuck'),('shit'),('cunt'),('nigg'),('fagg'),('rape'),('nazi'),('hitler'),('admin'),('moderator'),('trackside'),('official') on conflict do nothing;
alter table public.name_blocklist enable row level security;   -- no policies: unreadable by the app

create or replace function public.name_ok(n text) returns boolean language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.name_blocklist b where lower(n) like '%' || b.word || '%')   -- security definer: the app itself cannot read the blocklist
$$;

create or replace function public.profiles_guard() returns trigger language plpgsql as $$
begin
  if not public.name_ok(new.display_name) then raise exception 'That name is not allowed' using errcode = '22023'; end if;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before insert or update of display_name on public.profiles for each row execute function public.profiles_guard();

---------------------------------------------------------------- invite codes (separate table: codes must never be readable for other people)
create table if not exists public.invites (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code    text unique not null default upper(substr(md5(random()::text || gen_random_uuid()::text), 1, 8))
);
alter table public.invites enable row level security;
drop policy if exists invites_own on public.invites;
create policy invites_own on public.invites for select to authenticated using (user_id = auth.uid());

---------------------------------------------------------------- friendships
create table if not exists public.friendships (
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);
create index if not exists friendships_b on public.friendships (user_b);
alter table public.friendships enable row level security;
drop policy if exists friendships_own on public.friendships;
create policy friendships_own on public.friendships for select to authenticated using (auth.uid() in (user_a, user_b));

---------------------------------------------------------------- picks (written only by save_picks)
create table if not exists public.picks (
  user_id   uuid not null references auth.users(id) on delete cascade,
  game_key  text not null references public.games(game_key) on delete cascade,
  cls       text not null,
  slot      smallint not null check (slot between 1 and 3),
  car       text not null,
  p         double precision not null,           -- win chance % banked when the pick was made (server's value)
  m         double precision not null,           -- timing multiplier banked when the pick was made
  picked_at timestamptz not null default now(),
  primary key (user_id, game_key, cls, slot),
  unique (user_id, game_key, cls, car)
);
create index if not exists picks_game on public.picks (game_key);
alter table public.picks enable row level security;
drop policy if exists picks_own on public.picks;
create policy picks_own on public.picks for select to authenticated using (user_id = auth.uid());
-- a friend's picks become visible once the race has started (never before: nobody can copy)
drop policy if exists picks_friends on public.picks;
create policy picks_friends on public.picks for select to authenticated using (
  exists (select 1 from public.games g where g.game_key = picks.game_key and now() >= g.race_start)
  and exists (select 1 from public.friendships f where (f.user_a = auth.uid() and f.user_b = picks.user_id) or (f.user_b = auth.uid() and f.user_a = picks.user_id))
);
revoke insert, update, delete on public.picks from anon, authenticated;

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter uuid not null references auth.users(id) on delete cascade,
  reported uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) <= 300),
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;   -- write-only through report_user(); read in the Supabase dashboard

---------------------------------------------------------------- scoring (the same arithmetic as js/app.js: gameMult, gameExact, gameNear, gameScore)
create or replace function public.js_round(x double precision) returns integer language sql immutable as $$ select floor(x + 0.5)::integer $$;   -- Math.round
create or replace function public.mult(p double precision) returns double precision language sql immutable as $$
  select least(3, greatest(0.5, sqrt(10 / (case when p > 0 then p else 10 end))))
$$;

-- points and the most the pick could have scored, for one pick against one class result ({"exact":[..],"podium":[..]}); res may be null
create or replace function public.pick_score(p double precision, m double precision, slot integer, car text, res jsonb)
returns table (pts integer, mx integer, hit boolean) language plpgsql immutable as $$
declare ex integer := public.js_round(5 * public.mult(p) * m); ne integer := public.js_round(2 * public.mult(p) * m);
        exact_car text; podium jsonb; in_podium boolean;
begin
  if res is null then return; end if;
  podium := coalesce(res->'podium', '[]'::jsonb);
  in_podium := podium ? car;
  exact_car := res->'exact'->>(slot - 1);            -- null when that place is unknown
  if exact_car is not null then
    mx := ex; hit := (exact_car = car);
    pts := case when hit then ex when in_podium then ne else 0 end;
  elsif in_podium then
    pts := ne; mx := ne; hit := false;
  else
    pts := 0; mx := 0; hit := false;
  end if;
  return next;
end $$;

create or replace view public.pick_scores with (security_invoker = false) as
  select k.user_id, k.game_key, g.series, extract(year from g.event_start)::int as yr, k.cls, k.slot, k.car, s.pts, s.mx,
         (s.hit and k.slot = 1) as won_class
  from public.picks k
  join public.games g on g.game_key = k.game_key
  cross join lateral public.pick_score(k.p, k.m, k.slot::int, k.car, g.result->k.cls) s
  where g.result is not null;
revoke all on public.pick_scores from anon, authenticated;

---------------------------------------------------------------- the one way to write picks
create or replace function public.save_picks(p_game text, p_cls text, p_cars text[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare g public.games; uid uuid := auth.uid(); i int; c text; chance double precision; tm double precision;
        kept jsonb; n int := coalesce(array_length(p_cars, 1), 0);
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  select * into g from public.games where game_key = p_game;
  if not found then raise exception 'Unknown game' using errcode = '22023'; end if;
  if now() >= g.race_start or g.result is not null then raise exception 'Picks are locked' using errcode = '22023'; end if;
  if g.entries->p_cls is null then raise exception 'Unknown class' using errcode = '22023'; end if;
  if n > 3 then raise exception 'At most three picks' using errcode = '22023'; end if;
  if (select count(distinct x) from unnest(p_cars) x) <> n then raise exception 'A car can only be picked once' using errcode = '22023'; end if;
  -- what was banked for cars that stay picked (re-sending the same pick, or moving it to another place, must not reset its bonus)
  select coalesce(jsonb_object_agg(k.car, jsonb_build_object('p', k.p, 'm', k.m, 'at', k.picked_at)), '{}'::jsonb) into kept
    from public.picks k where k.user_id = uid and k.game_key = p_game and k.cls = p_cls and k.car = any (p_cars);
  delete from public.picks where user_id = uid and game_key = p_game and cls = p_cls;
  for i in 1 .. n loop
    c := p_cars[i];
    chance := (g.entries->p_cls->>c)::double precision;
    if chance is null then raise exception 'Car % is not in this class', c using errcode = '22023'; end if;
    if kept ? c then
      insert into public.picks(user_id, game_key, cls, slot, car, p, m, picked_at)
        values (uid, p_game, p_cls, i, c, (kept->c->>'p')::double precision, (kept->c->>'m')::double precision, (kept->c->>'at')::timestamptz);
    else
      tm := case when g.quali_start is null or g.quali_end is null then 1 when now() < g.quali_start then 1.25 when now() < g.quali_end then 1 else 0.75 end;
      insert into public.picks(user_id, game_key, cls, slot, car, p, m) values (uid, p_game, p_cls, i, c, chance, tm);
    end if;
  end loop;
  return (select coalesce(jsonb_agg(jsonb_build_object('slot', slot, 'car', car, 'p', p, 'm', m) order by slot), '[]'::jsonb)
          from public.picks where user_id = uid and game_key = p_game and cls = p_cls);
end $$;
revoke all on function public.save_picks(text, text, text[]) from public, anon;
grant execute on function public.save_picks(text, text, text[]) to authenticated;

-- this person's picks for the games that are still open or scored (the app merges them into its local copy)
create or replace function public.my_picks() returns table (game_key text, cls text, slot smallint, car text, p double precision, m double precision)
language sql stable security definer set search_path = public as $$
  select game_key, cls, slot, car, p, m from public.picks where user_id = auth.uid() order by game_key, cls, slot
$$;
revoke all on function public.my_picks() from public, anon;
grant execute on function public.my_picks() to authenticated;

---------------------------------------------------------------- account
-- first sign-in: choose a display name; creates the profile and the invite code
create or replace function public.create_profile(p_name text) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); code text;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  if exists (select 1 from public.profiles where id = uid) then raise exception 'You already have a profile' using errcode = '22023'; end if;
  insert into public.profiles(id, display_name) values (uid, btrim(p_name));
  insert into public.invites(user_id) values (uid) on conflict do nothing;
  select i.code into code from public.invites i where i.user_id = uid;
  return jsonb_build_object('display_name', btrim(p_name), 'invite_code', code);
exception when unique_violation then raise exception 'That name is taken' using errcode = '23505';
end $$;
revoke all on function public.create_profile(text) from public, anon;
grant execute on function public.create_profile(text) to authenticated;

create or replace function public.my_profile() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('display_name', p.display_name, 'show_global', p.show_global, 'invite_code', i.code)
  from public.profiles p left join public.invites i on i.user_id = p.id where p.id = auth.uid()
$$;
revoke all on function public.my_profile() from public, anon;
grant execute on function public.my_profile() to authenticated;

---------------------------------------------------------------- friend requests and notifications
-- Entering a friend code sends a REQUEST to the code's owner; friendship exists only once they accept. Notifications (an in-app inbox that a push
-- sender can read later: new rows are the queue) tell the owner about the request and the sender when it is accepted.
create table if not exists public.friend_requests (
  from_user  uuid not null references auth.users(id) on delete cascade,
  to_user    uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'declined')),
  created_at timestamptz not null default now(),
  primary key (from_user, to_user),
  check (from_user <> to_user)
);
create index if not exists friend_requests_to on public.friend_requests (to_user);
alter table public.friend_requests enable row level security;
drop policy if exists friend_requests_own on public.friend_requests;
create policy friend_requests_own on public.friend_requests for select to authenticated using (auth.uid() in (from_user, to_user));
revoke insert, update, delete on public.friend_requests from anon, authenticated;

create table if not exists public.notifications (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,                           -- 'friend_request' | 'friend_accepted'
  data       jsonb not null default '{}'::jsonb,      -- {"from": uuid, "name": text}
  created_at timestamptz not null default now(),
  read_at    timestamptz
);
create index if not exists notifications_user on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.notifications from anon, authenticated;

-- the shared logic: uid asks other. Returns {"status": "sent" | "friends" | "already_friends" | "already_sent", "name": ...}; if they had already asked uid, that is a yes.
create or replace function public._request_friend(uid uuid, other uuid) returns jsonb language plpgsql security definer set search_path = public as $$
declare oname text; myname text; req public.friend_requests;
begin
  select display_name into myname from public.profiles where id = uid;
  if myname is null then raise exception 'Choose a display name first' using errcode = '22023'; end if;
  select display_name into oname from public.profiles where id = other;
  if oname is null then raise exception 'No such player' using errcode = '22023'; end if;
  if other = uid then raise exception 'That is you' using errcode = '22023'; end if;
  if exists (select 1 from public.friendships where user_a = least(uid, other) and user_b = greatest(uid, other)) then
    return jsonb_build_object('status', 'already_friends', 'name', oname);
  end if;
  if exists (select 1 from public.friend_requests where from_user = other and to_user = uid and status = 'pending') then
    insert into public.friendships(user_a, user_b) values (least(uid, other), greatest(uid, other)) on conflict do nothing;
    delete from public.friend_requests where (from_user = other and to_user = uid) or (from_user = uid and to_user = other);
    insert into public.notifications(user_id, type, data) values (other, 'friend_accepted', jsonb_build_object('from', uid, 'name', myname));
    return jsonb_build_object('status', 'friends', 'name', oname);
  end if;
  select * into req from public.friend_requests where from_user = uid and to_user = other;
  if found then
    if req.status = 'pending' then return jsonb_build_object('status', 'already_sent', 'name', oname); end if;
    if req.created_at > now() - interval '7 days' then raise exception 'That request was declined. Try again in a week.' using errcode = '22023'; end if;
    update public.friend_requests set status = 'pending', created_at = now() where from_user = uid and to_user = other;
  else
    if (select count(*) from public.friend_requests where from_user = uid and status = 'pending') >= 20 then raise exception 'You have 20 requests waiting. Cancel one first.' using errcode = '22023'; end if;
    insert into public.friend_requests(from_user, to_user) values (uid, other);
  end if;
  insert into public.notifications(user_id, type, data) values (other, 'friend_request', jsonb_build_object('from', uid, 'name', myname));
  return jsonb_build_object('status', 'sent', 'name', oname);
end $$;
revoke all on function public._request_friend(uuid, uuid) from public, anon, authenticated;

-- ask a player you found by name
create or replace function public.request_friend(p_to uuid) returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  return public._request_friend(auth.uid(), p_to);
end $$;
revoke all on function public.request_friend(uuid) from public, anon;
grant execute on function public.request_friend(uuid) to authenticated;

-- ask the owner of an invite code (optional: for someone who shares a code instead of a name)
create or replace function public.add_friend(p_code text) returns jsonb language plpgsql security definer set search_path = public as $$
declare other uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  select i.user_id into other from public.invites i where i.code = upper(btrim(p_code));
  if other is null then raise exception 'No one has that code' using errcode = '22023'; end if;
  return public._request_friend(auth.uid(), other);
end $$;
revoke all on function public.add_friend(text) from public, anon;
grant execute on function public.add_friend(text) to authenticated;

-- find players by (part of) their display name: at least 3 letters, 10 results, only players who allow it (the same switch as the Everyone leaderboard)
create or replace function public.search_players(p_q text) returns table (id uuid, display_name text, relation text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name,
         case when exists (select 1 from public.friendships f where f.user_a = least(auth.uid(), p.id) and f.user_b = greatest(auth.uid(), p.id)) then 'friend'
              when exists (select 1 from public.friend_requests r where r.from_user = auth.uid() and r.to_user = p.id and r.status = 'pending') then 'sent'
              when exists (select 1 from public.friend_requests r where r.from_user = p.id and r.to_user = auth.uid() and r.status = 'pending') then 'incoming'
              else 'none' end
  from public.profiles p
  where auth.uid() is not null and p.id <> auth.uid() and p.show_global and char_length(replace(replace(lower(btrim(p_q)), '%', ''), '_', '')) >= 3
    and lower(p.display_name) like '%' || replace(replace(lower(btrim(p_q)), '%', ''), '_', '') || '%'
  order by (lower(p.display_name) like lower(btrim(p_q)) || '%') desc, lower(p.display_name) limit 10
$$;
revoke all on function public.search_players(text) from public, anon;
grant execute on function public.search_players(text) to authenticated;

-- accept or decline a request someone sent you
create or replace function public.respond_request(p_from uuid, p_accept boolean) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); myname text; fname text;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  if not exists (select 1 from public.friend_requests where from_user = p_from and to_user = uid and status = 'pending') then
    raise exception 'That request is no longer there' using errcode = '22023';
  end if;
  select display_name into myname from public.profiles where id = uid;
  select display_name into fname from public.profiles where id = p_from;
  if p_accept then
    insert into public.friendships(user_a, user_b) values (least(uid, p_from), greatest(uid, p_from)) on conflict do nothing;
    delete from public.friend_requests where from_user = p_from and to_user = uid;
    insert into public.notifications(user_id, type, data) values (p_from, 'friend_accepted', jsonb_build_object('from', uid, 'name', myname));
  else
    update public.friend_requests set status = 'declined', created_at = now() where from_user = p_from and to_user = uid;   -- the sender is not told
  end if;
  update public.notifications set read_at = now() where user_id = uid and type = 'friend_request' and data->>'from' = p_from::text and read_at is null;
  return jsonb_build_object('status', case when p_accept then 'accepted' else 'declined' end, 'name', fname);
end $$;
revoke all on function public.respond_request(uuid, boolean) from public, anon;
grant execute on function public.respond_request(uuid, boolean) to authenticated;

create or replace function public.cancel_request(p_to uuid) returns void language sql security definer set search_path = public as $$
  delete from public.friend_requests where from_user = auth.uid() and to_user = p_to
$$;
revoke all on function public.cancel_request(uuid) from public, anon;
grant execute on function public.cancel_request(uuid) to authenticated;

-- requests waiting for me, requests I sent that are still waiting, and my recent notifications
create or replace function public.my_requests() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', r.from_user, 'name', p.display_name, 'at', r.created_at) order by r.created_at) from public.friend_requests r join public.profiles p on p.id = r.from_user where r.to_user = auth.uid() and r.status = 'pending'), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', r.to_user, 'name', p.display_name, 'at', r.created_at) order by r.created_at) from public.friend_requests r join public.profiles p on p.id = r.to_user where r.from_user = auth.uid() and r.status = 'pending'), '[]'::jsonb),
    'notifications', coalesce((select jsonb_agg(jsonb_build_object('id', n.id, 'type', n.type, 'name', n.data->>'name', 'at', n.created_at, 'read', n.read_at is not null) order by n.created_at desc) from (select * from public.notifications where user_id = auth.uid() order by created_at desc limit 20) n), '[]'::jsonb),
    'unread', (select count(*) from public.notifications where user_id = auth.uid() and read_at is null))
$$;
revoke all on function public.my_requests() from public, anon;
grant execute on function public.my_requests() to authenticated;

create or replace function public.mark_notifications_read() returns void language sql security definer set search_path = public as $$
  update public.notifications set read_at = now() where user_id = auth.uid() and read_at is null
$$;
revoke all on function public.mark_notifications_read() from public, anon;
grant execute on function public.mark_notifications_read() to authenticated;

create or replace function public.remove_friend(p_friend uuid) returns void language sql security definer set search_path = public as $$
  delete from public.friendships where least(auth.uid(), p_friend) = user_a and greatest(auth.uid(), p_friend) = user_b
$$;
revoke all on function public.remove_friend(uuid) from public, anon;
grant execute on function public.remove_friend(uuid) to authenticated;

create or replace function public.my_friends() returns table (id uuid, display_name text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name from public.friendships f
  join public.profiles p on p.id = case when f.user_a = auth.uid() then f.user_b else f.user_a end
  where auth.uid() in (f.user_a, f.user_b) order by lower(p.display_name)
$$;
revoke all on function public.my_friends() from public, anon;
grant execute on function public.my_friends() to authenticated;

create or replace function public.report_user(p_user uuid, p_reason text) returns void language sql security definer set search_path = public as $$
  insert into public.reports(reporter, reported, reason) values (auth.uid(), p_user, left(coalesce(p_reason, ''), 300))
$$;
revoke all on function public.report_user(uuid, text) from public, anon;
grant execute on function public.report_user(uuid, text) to authenticated;

-- deletes the person, their profile, picks, friendships and invite (all cascade from auth.users)
create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

---------------------------------------------------------------- leaderboards
-- p_scope: 'global' (everyone who shows on it) or 'friends' (you and your friends); p_year: calendar year; p_series: a series id or null for all;
-- p_game: one weekend's game_key or null for the whole season. Returns at most 100 rows, plus you if you are further down.
create or replace function public.leaderboard(p_scope text, p_year int, p_series text default null, p_game text default null)
returns table (rank bigint, user_id uuid, display_name text, points bigint, possible bigint, weekends bigint, winners bigint, is_me boolean)
language sql stable security definer set search_path = public as $$
  with ids as (
    select auth.uid() as uid
  ), pool as (
    select p.id, p.display_name from public.profiles p, ids
    where (p_scope = 'global' and (p.show_global or p.id = ids.uid))
       or (p_scope = 'friends' and (p.id = ids.uid or exists (select 1 from public.friendships f where (f.user_a = ids.uid and f.user_b = p.id) or (f.user_b = ids.uid and f.user_a = p.id))))
  ), tot as (
    select pool.id, pool.display_name,
           coalesce(sum(s.pts), 0) as points, coalesce(sum(s.mx), 0) as possible,
           count(distinct s.game_key) as weekends,
           coalesce(sum(case when s.won_class then 1 else 0 end), 0) as winners
    from pool left join public.pick_scores s on s.user_id = pool.id and s.yr = p_year
         and (p_series is null or s.series = p_series) and (p_game is null or s.game_key = p_game)
    group by pool.id, pool.display_name
    having (p_scope = 'friends') or count(s.game_key) > 0
  ), ranked as (
    select dense_rank() over (order by points desc) as rank, id, display_name, points, possible, weekends, winners from tot
  )
  select r.rank, r.id, r.display_name, r.points, r.possible, r.weekends, r.winners, (r.id = (select uid from ids)) as is_me
  from ranked r where r.rank <= 100 or r.id = (select uid from ids) order by r.rank, lower(r.display_name)
$$;
revoke all on function public.leaderboard(text, int, text, text) from public, anon;
grant execute on function public.leaderboard(text, int, text, text) to authenticated;

-- a friend's picks for a game that has started (RLS also enforces it)
create or replace function public.friend_picks(p_game text) returns table (user_id uuid, display_name text, cls text, slot smallint, car text)
language sql stable security definer set search_path = public as $$
  select k.user_id, p.display_name, k.cls, k.slot, k.car from public.picks k
  join public.profiles p on p.id = k.user_id join public.games g on g.game_key = k.game_key
  where k.game_key = p_game and now() >= g.race_start
    and exists (select 1 from public.friendships f where (f.user_a = auth.uid() and f.user_b = k.user_id) or (f.user_b = auth.uid() and f.user_a = k.user_id))
  order by lower(p.display_name), k.cls, k.slot
$$;
revoke all on function public.friend_picks(text) from public, anon;
grant execute on function public.friend_picks(text) to authenticated;

---------------------------------------------------------------- push notifications (iPhone: APNs, Android: Firebase Cloud Messaging)
-- Phones register a device token; every new row in `notifications` calls the `push` edge function (supabase/functions/push/index.ts), which sends it.
create table if not exists public.push_tokens (
  token      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  platform   text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);
create index if not exists push_tokens_user on public.push_tokens (user_id);
alter table public.push_tokens enable row level security;     -- no policies: only the functions below and the service role touch it
revoke all on public.push_tokens from anon, authenticated;

create or replace function public.register_push_token(p_token text, p_platform text) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  if p_platform not in ('ios', 'android') or char_length(coalesce(p_token, '')) < 20 or char_length(p_token) > 400 then raise exception 'Bad token' using errcode = '22023'; end if;
  insert into public.push_tokens(token, user_id, platform) values (p_token, auth.uid(), p_platform)
    on conflict (token) do update set user_id = auth.uid(), platform = p_platform, updated_at = now();   -- a phone that changes account moves its token
end $$;
revoke all on function public.register_push_token(text, text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;

create or replace function public.unregister_push_token(p_token text) returns void language sql security definer set search_path = public as $$
  delete from public.push_tokens where token = p_token and user_id = auth.uid()
$$;
revoke all on function public.unregister_push_token(text) from public, anon;
grant execute on function public.unregister_push_token(text) to authenticated;

-- the shared secret between this trigger and the edge function lives in a table the app can never read
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.config (key text primary key, value text not null);
revoke all on private.config from public, anon, authenticated;

create or replace function private.notify_push() returns trigger language plpgsql security definer set search_path = public, private as $$
declare sec text;
begin
  select value into sec from private.config where key = 'push_secret';
  if sec is null then return new; end if;                       -- not set up yet: the in-app notices still work
  perform net.http_post(url := 'https://hspehgxhksctfegcfgyv.supabase.co/functions/v1/push',
                        headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', sec),
                        body := jsonb_build_object('id', new.id));
  return new;
exception when others then return new;                          -- a push problem must never block the notification itself
end $$;
drop trigger if exists notifications_push on public.notifications;
create trigger notifications_push after insert on public.notifications for each row execute function private.notify_push();
do $$ begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net') then create extension if not exists pg_net; end if;
exception when others then null;
end $$;
