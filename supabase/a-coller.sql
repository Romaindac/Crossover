-- CROSSOVER : tout le serveur en un seul fichier (genere par node js/outils/catalogue-sql.mjs).
-- Supabase > SQL Editor > New query : coller tout ce fichier, puis Run. Peut etre relance sans risque.

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

-- ==========================================================
-- HOTEL DES VENTES : equipement contre encre
-- Le serveur refuse les objets impossibles (catalogue.sql), limite
-- les ventes et fait chaque achat d'un seul coup (pas de double achat).
-- ==========================================================

create table if not exists public.objets_catalogue (
  id text primary key,
  rarete text not null,
  emplacement text not null,
  lignes jsonb not null
);
alter table public.objets_catalogue enable row level security;
drop policy if exists "catalogue lisible" on public.objets_catalogue;
create policy "catalogue lisible" on public.objets_catalogue for select using (true);

create table if not exists public.ventes (
  id bigint generated always as identity primary key,
  vendeur uuid not null default auth.uid() references public.joueurs (id) on delete cascade,
  pseudo text not null default '',
  objet jsonb not null,
  objet_id text not null default '',
  rarete text not null default '',
  emplacement text not null default '',
  prix integer not null check (prix between 10 and 20000),
  statut text not null default 'en_vente' check (statut in ('en_vente', 'vendue', 'retiree')),
  acheteur uuid references public.joueurs (id) on delete set null,
  cree timestamptz not null default now(),
  vendue timestamptz,
  recupere boolean not null default false
);
create index if not exists ventes_statut on public.ventes (statut, cree desc);
create index if not exists ventes_vendeur on public.ventes (vendeur, statut);
alter table public.ventes enable row level security;

-- Un objet est possible s'il existe au catalogue et si chaque ligne reste dans sa fourchette
-- (jusqu'a +15 % pour une ligne sublimee)
create or replace function public.objet_valide(o jsonb) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  c record;
  n integer;
  i integer;
  v numeric;
begin
  select * into c from public.objets_catalogue where id = o->>'objet';
  if not found or o->>'rarete' <> c.rarete then return false; end if;
  if (o->>'niveau')::integer not between 0 and 12 then return false; end if;
  n := jsonb_array_length(o->'lignes');
  if n <> jsonb_array_length(c.lignes) then return false; end if;
  for i in 0 .. n - 1 loop
    if o->'lignes'->i->>'stat' <> c.lignes->i->>0 then return false; end if;
    v := (o->'lignes'->i->>'valeur')::numeric;
    if v < (c.lignes->i->>1)::numeric - 1 or v > (c.lignes->i->>2)::numeric * 1.15 + 1 then return false; end if;
  end loop;
  return true;
exception when others then
  return false;
end $$;

create or replace function public.avant_vente() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.vendeur := auth.uid();
  select pseudo into new.pseudo from public.joueurs where id = auth.uid();
  if new.pseudo is null then raise exception 'profil introuvable'; end if;
  if not public.objet_valide(new.objet) then raise exception 'objet refuse'; end if;
  if (select count(*) from public.ventes where vendeur = auth.uid() and cree > now() - interval '1 day') >= 5 then
    raise exception 'limite ventes jour';
  end if;
  if (select count(*) from public.ventes where vendeur = auth.uid() and statut = 'en_vente') >= 8 then
    raise exception 'limite ventes actives';
  end if;
  new.objet_id := new.objet->>'objet';
  new.rarete := new.objet->>'rarete';
  select emplacement into new.emplacement from public.objets_catalogue where id = new.objet_id;
  new.statut := 'en_vente';
  new.acheteur := null;
  new.vendue := null;
  new.recupere := false;
  new.cree := now();
  return new;
end $$;
drop trigger if exists avant_vente on public.ventes;
create trigger avant_vente before insert on public.ventes for each row execute function public.avant_vente();

-- Lecture : les objets en vente, et ses propres ventes et achats. Ecriture : mise en vente seulement ;
-- acheter, retirer et encaisser passent par les fonctions ci-dessous.
drop policy if exists "ventes lues" on public.ventes;
create policy "ventes lues" on public.ventes for select using (auth.uid() is not null and (statut = 'en_vente' or vendeur = auth.uid() or acheteur = auth.uid()));
drop policy if exists "ventes creees" on public.ventes;
create policy "ventes creees" on public.ventes for insert with check (auth.uid() is not null);

-- Une annonce reste 3 jours en vente
create or replace function public.acheter_vente(p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  update public.ventes set statut = 'vendue', acheteur = auth.uid(), vendue = now()
    where id = p_id and statut = 'en_vente' and vendeur <> auth.uid() and cree > now() - interval '3 days'
    returning objet, prix into r;
  if not found then raise exception 'indisponible'; end if;
  return jsonb_build_object('objet', r.objet, 'prix', r.prix);
end $$;

create or replace function public.retirer_vente(p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  update public.ventes set statut = 'retiree'
    where id = p_id and statut = 'en_vente' and vendeur = auth.uid()
    returning objet into r;
  if not found then raise exception 'indisponible'; end if;
  return r.objet;
end $$;

-- Encaisse les ventes conclues, moins 5 % de taxe
create or replace function public.recuperer_gains() returns integer
language sql security definer set search_path = public as $$
  with faites as (
    update public.ventes set recupere = true
      where vendeur = auth.uid() and statut = 'vendue' and not recupere
      returning prix
  )
  select coalesce(sum(floor(prix * 0.95)), 0)::integer from faites;
$$;

grant execute on function public.acheter_vente(bigint) to authenticated;
grant execute on function public.retirer_vente(bigint) to authenticated;
grant execute on function public.recuperer_gains() to authenticated;

-- Fichier genere par node js/outils/catalogue-sql.mjs : ne pas modifier a la main.
-- A coller dans Supabase (SQL Editor) apres schema.sql.
insert into public.objets_catalogue (id, rarete, emplacement, lignes) values
  ('baton-disciple', 'commun', 'arme', '[["atq",3,4]]'::jsonb),
  ('kimono-disciple', 'commun', 'tenue', '[["pv",35,46]]'::jsonb),
  ('bandeau-disciple', 'commun', 'accessoire', '[["vit",1,1]]'::jsonb),
  ('pierre-concentration', 'commun', 'relique', '[["pvPct",1.3,1.7]]'::jsonb),
  ('lame-serment', 'rare', 'arme', '[["atq",6,8],["atqPct",1.2,1.7],["critPct",0.8,1.1]]'::jsonb),
  ('manteau-heros', 'rare', 'tenue', '[["pv",73,98],["atqPct",1.2,1.7]]'::jsonb),
  ('bandeau-promesse', 'rare', 'accessoire', '[["vit",2,2],["energie",3,4]]'::jsonb),
  ('medaille-volonte', 'rare', 'relique', '[["atqPct",2.1,2.8],["critPct",0.8,1.1]]'::jsonb),
  ('bokken-maitre', 'epique', 'arme', '[["atq",10,13],["defPct",2.3,3],["critPct",1.2,1.6]]'::jsonb),
  ('hakama-maitre', 'epique', 'tenue', '[["pv",120,160],["defPct",2.3,3],["pvPct",1.8,2.3]]'::jsonb),
  ('ceinture-noire', 'epique', 'accessoire', '[["vit",2,3],["pvPct",1.8,2.3],["energie",5,6]]'::jsonb),
  ('parchemin-katas', 'epique', 'relique', '[["defPct",3.8,5.1],["atqPct",1.8,2.3],["pvPct",1.8,2.3]]'::jsonb),
  ('gourdin-apprenti', 'commun', 'arme', '[["atq",3,4]]'::jsonb),
  ('gants-sparring', 'peu_commun', 'arme', '[["atq",5,6],["critPct",0.7,0.9]]'::jsonb),
  ('tunique-rapiecee', 'commun', 'tenue', '[["pv",41,54]]'::jsonb),
  ('plastron-bambou', 'peu_commun', 'tenue', '[["pv",72,96],["defPct",1.5,2]]'::jsonb),
  ('sandales-course', 'peu_commun', 'accessoire', '[["vit",1,2],["energie",3,4]]'::jsonb),
  ('trefle-porte-bonheur', 'rare', 'accessoire', '[["vit",2,2],["butin",4,5]]'::jsonb),
  ('cloche-dojo', 'rare', 'relique', '[["defPct",3.1,4.2],["pvPct",1.5,1.9]]'::jsonb),
  ('bandeau-aube', 'legendaire', 'accessoire', '[["vit",3,4],["energie",5,7],["atqPct",1.9,2.6]]'::jsonb),
  ('pique-garnison', 'commun', 'arme', '[["atq",6,8]]'::jsonb),
  ('cotte-garnison', 'commun', 'tenue', '[["pv",77,102]]'::jsonb),
  ('brassard-garnison', 'commun', 'accessoire', '[["vit",2,2]]'::jsonb),
  ('insigne-garnison', 'commun', 'relique', '[["defPct",2.5,3.4]]'::jsonb),
  ('masse-fer', 'rare', 'arme', '[["atq",10,13],["defPct",2.1,2.9]]'::jsonb),
  ('armure-rempart', 'rare', 'tenue', '[["pv",118,158],["defPct",2.1,2.9],["pvPct",1.7,2.2]]'::jsonb),
  ('gantelet-acier', 'rare', 'accessoire', '[["vit",2,3],["defPct",2.1,2.9]]'::jsonb),
  ('sceau-rempart', 'rare', 'relique', '[["defPct",3.6,4.8],["pvPct",1.7,2.2]]'::jsonb),
  ('hallebarde-eternelle', 'epique', 'arme', '[["atq",14,18],["pvPct",2.2,3],["critPct",1.5,2]]'::jsonb),
  ('cuirasse-eternelle', 'epique', 'tenue', '[["pv",172,229],["defPct",2.9,3.8],["pvPct",2.2,3]]'::jsonb),
  ('chaine-gardien', 'epique', 'accessoire', '[["vit",3,4],["defPct",2.9,3.8],["pvPct",2.2,3]]'::jsonb),
  ('cle-forteresse', 'epique', 'relique', '[["pvPct",3.7,5],["defPct",2.9,3.8],["energie",6,8]]'::jsonb),
  ('epee-rouillee', 'commun', 'arme', '[["atq",6,8]]'::jsonb),
  ('arbalete-rempart', 'rare', 'arme', '[["atq",11,14],["critPct",1.2,1.6]]'::jsonb),
  ('gambison', 'commun', 'tenue', '[["pv",83,110]]'::jsonb),
  ('cape-assiege', 'peu_commun', 'tenue', '[["pv",113,150],["pvPct",1.5,2.1]]'::jsonb),
  ('bottes-ferrees', 'peu_commun', 'accessoire', '[["vit",2,3],["defPct",1.8,2.5]]'::jsonb),
  ('lanterne-ronde', 'peu_commun', 'accessoire', '[["vit",2,3],["butin",4,6]]'::jsonb),
  ('blason-fendu', 'rare', 'relique', '[["defPct",4,5.3],["pvPct",1.9,2.5]]'::jsonb),
  ('bouclier-colosse', 'legendaire', 'tenue', '[["pv",190,253],["defPct",3.2,4.2],["pvPct",2.5,3.3]]'::jsonb),
  ('kunai-ombre', 'commun', 'arme', '[["atq",9,12]]'::jsonb),
  ('tenue-ombre', 'commun', 'tenue', '[["pv",113,150]]'::jsonb),
  ('masque-ombre', 'commun', 'accessoire', '[["vit",2,3]]'::jsonb),
  ('fiole-fumee', 'commun', 'relique', '[["critPct",1.7,2.2]]'::jsonb),
  ('kunai-vent', 'rare', 'arme', '[["atq",13,17],["vit",2,2]]'::jsonb),
  ('cape-legere', 'rare', 'tenue', '[["pv",163,218],["vit",2,2]]'::jsonb),
  ('sandales-vent', 'rare', 'accessoire', '[["vit",3,4],["energie",5,7]]'::jsonb),
  ('plume-orage', 'rare', 'relique', '[["atqPct",3.4,4.6],["vit",2,2]]'::jsonb),
  ('katana-nocturne', 'epique', 'arme', '[["atq",18,23],["critPct",1.8,2.4],["atqPct",2.7,3.6]]'::jsonb),
  ('kimono-nocturne', 'epique', 'tenue', '[["pv",224,299],["critPct",1.8,2.4],["vit",2,3]]'::jsonb),
  ('fourreau-lune', 'epique', 'accessoire', '[["vit",4,5],["critPct",1.8,2.4],["atqPct",2.7,3.6]]'::jsonb),
  ('pierre-lunaire', 'epique', 'relique', '[["critPct",3,4],["atqPct",2.7,3.6],["energie",7,9]]'::jsonb),
  ('shuriken-ebreche', 'commun', 'arme', '[["atq",9,11]]'::jsonb),
  ('tanto-silencieux', 'peu_commun', 'arme', '[["atq",11,15],["vit",2,2]]'::jsonb),
  ('manteau-toits', 'commun', 'tenue', '[["pv",119,158]]'::jsonb),
  ('haori-veilleur', 'rare', 'tenue', '[["pv",178,238],["vit",2,3],["critPct",1.5,2]]'::jsonb),
  ('grappin', 'peu_commun', 'accessoire', '[["vit",3,4],["critPct",1.3,1.7]]'::jsonb),
  ('clochette-muette', 'rare', 'accessoire', '[["vit",3,4],["butin",6,8]]'::jsonb),
  ('oeil-de-chat', 'peu_commun', 'relique', '[["critPct",2,2.7],["atqPct",1.8,2.5]]'::jsonb),
  ('murasame-encre', 'legendaire', 'arme', '[["atq",19,26],["critPct",2,2.6],["atqPct",3,4]]'::jsonb),
  ('baton-initie', 'commun', 'arme', '[["atq",12,16]]'::jsonb),
  ('robe-initie', 'commun', 'tenue', '[["pv",149,198]]'::jsonb),
  ('talisman-initie', 'commun', 'accessoire', '[["energie",8,10]]'::jsonb),
  ('encens-initie', 'commun', 'relique', '[["pvPct",3,4]]'::jsonb),
  ('sceptre-scelle', 'rare', 'arme', '[["atq",16,22],["atqPct",2.5,3.3]]'::jsonb),
  ('voile-scelle', 'rare', 'tenue', '[["pv",208,278],["atqPct",2.5,3.3]]'::jsonb),
  ('bague-sceau', 'rare', 'accessoire', '[["vit",4,5],["atqPct",2.5,3.3]]'::jsonb),
  ('sceau-verite', 'rare', 'relique', '[["atqPct",4.1,5.5],["vit",2,3]]'::jsonb),
  ('baton-sage', 'epique', 'arme', '[["atq",22,29],["energie",8,11],["pvPct",3.2,4.2]]'::jsonb),
  ('robe-sage', 'epique', 'tenue', '[["pv",276,368],["pvPct",3.2,4.2],["energie",8,11]]'::jsonb),
  ('chapelet-jade', 'epique', 'accessoire', '[["vit",5,6],["energie",8,11],["pvPct",3.2,4.2]]'::jsonb),
  ('lanterne-esprit', 'epique', 'relique', '[["pvPct",5.3,7],["energie",8,11],["defPct",4,5.4]]'::jsonb),
  ('eventail-papier', 'commun', 'arme', '[["atq",11,15]]'::jsonb),
  ('chakram-runique', 'rare', 'arme', '[["atq",17,23],["energie",7,9],["critPct",1.7,2.3]]'::jsonb),
  ('chale-brume', 'peu_commun', 'tenue', '[["pv",173,231],["vit",2,2]]'::jsonb),
  ('toge-rituel', 'peu_commun', 'tenue', '[["pv",193,258],["pvPct",2.3,3]]'::jsonb),
  ('perles-priere', 'commun', 'accessoire', '[["energie",8,11]]'::jsonb),
  ('miroir-ames', 'rare', 'accessoire', '[["vit",4,5],["butin",7,9]]'::jsonb),
  ('fragment-domaine', 'peu_commun', 'relique', '[["atqPct",3.7,4.9],["energie",6,8]]'::jsonb),
  ('oeil-domaine', 'legendaire', 'relique', '[["critPct",3.9,5.2],["energie",9,12],["vit",3,4]]'::jsonb),
  ('lame-braise', 'commun', 'arme', '[["atq",14,19]]'::jsonb),
  ('cuirasse-braise', 'commun', 'tenue', '[["pv",185,246]]'::jsonb),
  ('anneau-braise', 'commun', 'accessoire', '[["vit",3,4]]'::jsonb),
  ('charbon-ardent', 'commun', 'relique', '[["atqPct",3.6,4.7]]'::jsonb),
  ('epee-legende', 'rare', 'arme', '[["atq",19,26],["atqPct",2.8,3.7],["critPct",1.9,2.5]]'::jsonb),
  ('armure-legende', 'rare', 'tenue', '[["pv",246,328],["pvPct",2.8,3.7],["atqPct",2.8,3.7]]'::jsonb),
  ('couronne-legende', 'rare', 'accessoire', '[["vit",4,6],["atqPct",2.8,3.7],["pvPct",2.8,3.7]]'::jsonb),
  ('etoile-legende', 'rare', 'relique', '[["atqPct",4.7,6.2],["pvPct",2.8,3.7],["critPct",1.9,2.5]]'::jsonb),
  ('plume-lame', 'epique', 'arme', '[["atq",23,30],["atqPct",3.3,4.4],["critPct",2.2,3]]'::jsonb),
  ('manteau-encre', 'epique', 'tenue', '[["pv",294,392],["atqPct",3.3,4.4],["pvPct",3.3,4.4]]'::jsonb),
  ('encrier-sans-fond', 'epique', 'accessoire', '[["vit",5,7],["energie",8,11],["critPct",2.2,3]]'::jsonb),
  ('page-blanche', 'epique', 'relique', '[["critPct",3.7,4.9],["atqPct",3.3,4.4],["energie",8,11]]'::jsonb),
  ('hachette-cendre', 'commun', 'arme', '[["atq",14,19]]'::jsonb),
  ('lance-phenix', 'rare', 'arme', '[["atq",20,26],["critPct",1.9,2.6],["pvPct",2.9,3.8]]'::jsonb),
  ('tunique-ignifugee', 'commun', 'tenue', '[["pv",185,246]]'::jsonb),
  ('ecailles-dragon', 'rare', 'tenue', '[["pv",253,338],["defPct",3.7,4.9],["pvPct",2.9,3.8]]'::jsonb),
  ('bracelet-lave', 'peu_commun', 'accessoire', '[["vit",4,5],["atqPct",2.4,3.3]]'::jsonb),
  ('fer-a-cheval-dore', 'rare', 'accessoire', '[["vit",4,6],["butin",7,10],["critPct",1.9,2.5]]'::jsonb),
  ('coeur-volcan', 'peu_commun', 'relique', '[["atqPct",4.1,5.4],["pvPct",2.4,3.3]]'::jsonb),
  ('plume-rature', 'legendaire', 'relique', '[["atqPct",6.1,8.2],["critPct",2.4,3.3],["energie",9,12]]'::jsonb),
  ('signet-oublie', 'epique', 'arme', '[["atq",26,35],["atqPct",3.7,5],["pvPct",3.7,5]]'::jsonb),
  ('couverture-oubliee', 'epique', 'tenue', '[["pv",337,450],["pvPct",3.7,5],["defPct",4.7,6.3]]'::jsonb),
  ('ruban-oublie', 'epique', 'accessoire', '[["vit",6,8],["atqPct",3.7,5],["energie",9,13]]'::jsonb),
  ('tranche-oubliee', 'epique', 'relique', '[["atqPct",6.2,8.3],["pvPct",3.7,5],["critPct",2.5,3.3]]'::jsonb),
  ('fermoir-acier', 'epique', 'arme', '[["atq",29,39],["defPct",5.2,7],["pvPct",4.1,5.5]]'::jsonb),
  ('reliure-acier', 'epique', 'tenue', '[["pv",381,508],["defPct",5.2,7],["pvPct",4.1,5.5]]'::jsonb),
  ('coins-acier', 'epique', 'accessoire', '[["vit",6,8],["defPct",5.2,7],["pvPct",4.1,5.5]]'::jsonb),
  ('dos-acier', 'epique', 'relique', '[["defPct",8.7,11.6],["pvPct",4.1,5.5],["energie",10,14]]'::jsonb),
  ('coupe-papier', 'epique', 'arme', '[["atq",33,44],["critPct",3,4],["atqPct",4.5,6]]'::jsonb),
  ('jaquette-rouge', 'epique', 'tenue', '[["pv",424,566],["atqPct",4.5,6],["critPct",3,4]]'::jsonb),
  ('marque-page-sanglant', 'epique', 'accessoire', '[["vit",7,9],["critPct",3,4],["atqPct",4.5,6]]'::jsonb),
  ('goutte-encre-rouge', 'epique', 'relique', '[["critPct",5,6.7],["atqPct",4.5,6],["vit",4,6]]'::jsonb),
  ('plume-finale', 'epique', 'arme', '[["atq",36,48],["atqPct",4.9,6.5],["energie",12,17]]'::jsonb),
  ('manteau-epilogue', 'epique', 'tenue', '[["pv",468,624],["pvPct",4.9,6.5],["energie",12,17]]'::jsonb),
  ('sceau-editeur', 'epique', 'accessoire', '[["vit",8,10],["energie",12,17],["critPct",3.3,4.4]]'::jsonb),
  ('derniere-page', 'epique', 'relique', '[["atqPct",8.2,10.9],["critPct",3.3,4.4],["energie",12,17]]'::jsonb),
  ('encre-abysses', 'legendaire', 'relique', '[["atqPct",7.6,10.1],["pvPct",4.5,6],["defPct",5.8,7.7]]'::jsonb),
  ('reliure-resurrection', 'legendaire', 'tenue', '[["pv",468,624],["pvPct",5,6.6],["defPct",6.3,8.4]]'::jsonb),
  ('plume-dernier-mot', 'legendaire', 'arme', '[["atq",40,53],["atqPct",5.4,7.2],["critPct",3.6,4.8]]'::jsonb),
  ('signet-temps', 'legendaire', 'accessoire', '[["vit",8,11],["energie",14,18],["critPct",3.6,4.8]]'::jsonb)
on conflict (id) do update set rarete = excluded.rarete, emplacement = excluded.emplacement, lignes = excluded.lignes;
