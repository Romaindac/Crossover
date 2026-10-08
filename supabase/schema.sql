-- ==========================================================
-- CROSSOVER : base de donnees en ligne (Supabase)
-- A coller une seule fois dans Supabase : SQL Editor > New query > Run.
-- - joueurs : pseudo, scores et vitrine, visibles par tout le monde
-- - sauvegardes : la partie de chaque joueur, lisible par lui seul
-- ==========================================================

create table if not exists public.joueurs (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudo text not null unique check (char_length(pseudo) between 3 and 20),
  tour integer not null default 0,
  raid integer not null default 0,
  collection integer not null default 0,
  etoiles integer not null default 0,
  boss_semaine integer not null default 0,
  semaine integer not null default 0,
  vitrine jsonb not null default '[]'::jsonb,
  maj timestamptz not null default now()
);

create table if not exists public.sauvegardes (
  id uuid primary key references auth.users (id) on delete cascade,
  donnees jsonb not null,
  maj timestamptz not null default now()
);

alter table public.joueurs enable row level security;
alter table public.sauvegardes enable row level security;

-- Classement et vitrines : tout le monde peut lire, chacun ne modifie que sa ligne
drop policy if exists "joueurs lisibles par tous" on public.joueurs;
create policy "joueurs lisibles par tous" on public.joueurs for select using (true);
drop policy if exists "joueur cree sa ligne" on public.joueurs;
create policy "joueur cree sa ligne" on public.joueurs for insert with check (auth.uid() = id);
drop policy if exists "joueur modifie sa ligne" on public.joueurs;
create policy "joueur modifie sa ligne" on public.joueurs for update using (auth.uid() = id);

-- Sauvegardes : seulement le proprietaire
drop policy if exists "sauvegarde privee lecture" on public.sauvegardes;
create policy "sauvegarde privee lecture" on public.sauvegardes for select using (auth.uid() = id);
drop policy if exists "sauvegarde privee creation" on public.sauvegardes;
create policy "sauvegarde privee creation" on public.sauvegardes for insert with check (auth.uid() = id);
drop policy if exists "sauvegarde privee modification" on public.sauvegardes;
create policy "sauvegarde privee modification" on public.sauvegardes for update using (auth.uid() = id);

create index if not exists joueurs_tour on public.joueurs (tour desc);
create index if not exists joueurs_raid on public.joueurs (raid desc);
-- Si la table existait deja avant le defi de la semaine
alter table public.joueurs add column if not exists boss_semaine integer not null default 0;
alter table public.joueurs add column if not exists semaine integer not null default 0;

create index if not exists joueurs_semaine on public.joueurs (semaine, boss_semaine desc);
create index if not exists joueurs_collection on public.joueurs (collection desc, etoiles desc);

-- ==========================================================
-- CHAT : canaux publics, messages prives, blocages, signalements
-- (a coller aussi, ou recoller tout le fichier : il peut etre relance sans risque)
-- ==========================================================

-- Moderateurs : a remplir a la main dans Supabase (Table Editor > moderateurs),
-- personne ne peut s'y ajouter depuis le jeu.
create table if not exists public.moderateurs (
  id uuid primary key references auth.users (id) on delete cascade
);
alter table public.moderateurs enable row level security;
drop policy if exists "moderateurs lisibles" on public.moderateurs;
create policy "moderateurs lisibles" on public.moderateurs for select using (true);

create or replace function public.est_moderateur() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.moderateurs where id = auth.uid());
$$;

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  canal text not null check (canal in ('general', 'entraide', 'echanges')),
  auteur uuid not null default auth.uid() references public.joueurs (id) on delete cascade,
  pseudo text not null default '',
  texte text not null check (char_length(texte) between 1 and 500),
  cree timestamptz not null default now()
);
create index if not exists messages_canal on public.messages (canal, id desc);

create table if not exists public.prives (
  id bigint generated always as identity primary key,
  de uuid not null default auth.uid() references public.joueurs (id) on delete cascade,
  a uuid not null references public.joueurs (id) on delete cascade,
  texte text not null check (char_length(texte) between 1 and 500),
  lu boolean not null default false,
  cree timestamptz not null default now(),
  check (de <> a)
);
create index if not exists prives_a on public.prives (a, id desc);
create index if not exists prives_de on public.prives (de, id desc);

create table if not exists public.blocages (
  bloqueur uuid not null default auth.uid() references public.joueurs (id) on delete cascade,
  bloque uuid not null references public.joueurs (id) on delete cascade,
  primary key (bloqueur, bloque)
);

create table if not exists public.signalements (
  id bigint generated always as identity primary key,
  auteur uuid not null default auth.uid() references public.joueurs (id) on delete cascade,
  cible uuid references public.joueurs (id) on delete cascade,
  message_id bigint,
  texte text,
  raison text check (char_length(raison) <= 300),
  cree timestamptz not null default now()
);

alter table public.messages enable row level security;
alter table public.prives enable row level security;
alter table public.blocages enable row level security;
alter table public.signalements enable row level security;

-- Le pseudo vient toujours du profil (impossible de se faire passer pour un autre),
-- et pas plus d'un message toutes les 2 secondes
create or replace function public.avant_message() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.auteur := auth.uid();
  select pseudo into new.pseudo from public.joueurs where id = auth.uid();
  if new.pseudo is null then raise exception 'profil introuvable'; end if;
  if exists (select 1 from public.messages where auteur = auth.uid() and cree > now() - interval '2 seconds') then
    raise exception 'trop rapide';
  end if;
  new.cree := now();
  return new;
end $$;
drop trigger if exists avant_message on public.messages;
create trigger avant_message before insert on public.messages for each row execute function public.avant_message();

create or replace function public.avant_prive() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.de := auth.uid();
  new.lu := false;
  new.cree := now();
  if exists (select 1 from public.blocages where bloqueur = new.a and bloque = new.de) then
    raise exception 'bloque';
  end if;
  if exists (select 1 from public.prives where de = auth.uid() and cree > now() - interval '2 seconds') then
    raise exception 'trop rapide';
  end if;
  return new;
end $$;
drop trigger if exists avant_prive on public.prives;
create trigger avant_prive before insert on public.prives for each row execute function public.avant_prive();

-- Canaux : lus par les joueurs connectes, ecrits par soi, effaces par l'auteur ou un moderateur
drop policy if exists "messages lus" on public.messages;
create policy "messages lus" on public.messages for select using (auth.uid() is not null);
drop policy if exists "messages ecrits" on public.messages;
create policy "messages ecrits" on public.messages for insert with check (auth.uid() is not null);
drop policy if exists "messages effaces" on public.messages;
create policy "messages effaces" on public.messages for delete using (auteur = auth.uid() or public.est_moderateur());

-- Prives : seulement les deux personnes concernees
drop policy if exists "prives lus" on public.prives;
create policy "prives lus" on public.prives for select using (auth.uid() in (de, a));
drop policy if exists "prives ecrits" on public.prives;
create policy "prives ecrits" on public.prives for insert with check (auth.uid() is not null);
drop policy if exists "prives marques lus" on public.prives;
create policy "prives marques lus" on public.prives for update using (a = auth.uid()) with check (a = auth.uid());

-- Blocages : chacun gere les siens
drop policy if exists "blocages perso" on public.blocages;
create policy "blocages perso" on public.blocages for all using (bloqueur = auth.uid()) with check (bloqueur = auth.uid());

-- Signalements : tout le monde peut signaler, seuls les moderateurs les lisent
drop policy if exists "signaler" on public.signalements;
create policy "signaler" on public.signalements for insert with check (auteur = auth.uid());
drop policy if exists "signalements moderes" on public.signalements;
create policy "signalements moderes" on public.signalements for select using (public.est_moderateur());

-- Le destinataire ne peut changer que « lu »
create or replace function public.avant_prive_lu() returns trigger
language plpgsql as $$
begin
  new.de := old.de; new.a := old.a; new.texte := old.texte; new.cree := old.cree;
  return new;
end $$;
drop trigger if exists avant_prive_lu on public.prives;
create trigger avant_prive_lu before update on public.prives for each row execute function public.avant_prive_lu();
