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
create index if not exists joueurs_collection on public.joueurs (collection desc, etoiles desc);
