# ==========================================================
# TEST DES REGLES DE SECURITE SUPABASE (outil, hors du jeu)
# Charge supabase/schema.sql et catalogue.sql dans un PostgreSQL local
# qui imite Supabase (auth.uid(), role authenticated), puis verifie
# avec 3 faux joueurs : profils, sauvegardes, chat, prives, blocages,
# signalements, moderation, hotel des ventes, boss collectif, echanges.
#
# Il faut un serveur PostgreSQL local, par exemple :
#   initdb -D /tmp/pgtest/data -A trust
#   pg_ctl -D /tmp/pgtest/data -o "-p 5499 -k /tmp/pgtest" start
# puis : python3 tests/tester-supabase.py
# ==========================================================
import subprocess, time, os
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = ["psql", "-h", os.environ.get("PGHOST", "/tmp/pgtest"), "-p", os.environ.get("PGPORT", "5499"), "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-q"]
subprocess.run(BASE + ["-c", "drop database if exists crossover_test"], check=True, capture_output=True)
subprocess.run(BASE + ["-c", "create database crossover_test"], check=True, capture_output=True)
IMITATION = """
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
grant usage on schema public, auth to authenticated, anon;
grant execute on function auth.uid() to authenticated, anon;
alter default privileges in schema public grant all on tables to authenticated, anon;
alter default privileges in schema public grant all on sequences to authenticated, anon;
alter default privileges in schema public grant execute on functions to authenticated, anon;
"""
subprocess.run(BASE + ["-d", "crossover_test"], input=IMITATION, text=True, capture_output=True, check=True)
for f in ["schema.sql", "catalogue.sql", "schema.sql"]:
    r = subprocess.run(BASE + ["-d", "crossover_test", "-f", os.path.join(RACINE, "supabase", f)], capture_output=True, text=True)
    if r.returncode: raise SystemExit(f"{f} ne se charge pas :\n{r.stderr}")
print("OK   schema.sql et catalogue.sql se chargent (et schema.sql se relance sans erreur)")
A="aaaaaaaa-0000-0000-0000-000000000001"; B="bbbbbbbb-0000-0000-0000-000000000002"; C="cccccccc-0000-0000-0000-000000000003"
def sql(q, qui=None):
    pre = "" if qui is None else f"set role authenticated; select set_config('request.jwt.claim.sub','{qui}',false) \\gset\n"
    r = subprocess.run(BASE[:-2] + ["-d", "crossover_test", "-tA", "-q"], input=pre+q, capture_output=True, text=True)
    return (r.stdout.strip(), r.stderr.strip())
ok=0; ko=0
def test(nom, cond, detail=""):
    global ok, ko
    if cond: ok+=1; print("OK  ", nom)
    else: ko+=1; print("ECHEC", nom, detail)
sql(f"insert into auth.users values ('{A}'),('{B}'),('{C}');")
for u,p in [(A,"Alice"),(B,"Bob"),(C,"Chloe")]:
    out,err=sql(f"insert into joueurs (id,pseudo) values ('{u}','{p}');", u); test(f"profil {p}", not err, err)
out,err=sql(f"insert into joueurs (id,pseudo) values ('{C}','Pirate');", A); test("impossible de creer le profil d'un autre", "row-level security" in err or "duplicate" in err, err)
out,err=sql(f"update joueurs set tour=999 where id='{B}' returning id;", A); test("impossible de modifier le profil d'un autre", out=="", out+err)
out,err=sql(f"insert into sauvegardes (id,donnees) values ('{A}','{{}}');", A); test("sauvegarde perso", not err, err)
out,err=sql("select count(*) from sauvegardes;", B); test("sauvegarde invisible pour les autres", out=="0", out+err)
# messages
out,err=sql("insert into messages (canal,texte,pseudo) values ('general','salut','FauxPseudo');", A); test("message envoye", not err, err)
out,err=sql("select pseudo from messages order by id desc limit 1;", B); test("pseudo impose par le serveur", out=="Alice", out+err)
out,err=sql("insert into messages (canal,texte) values ('general','spam');", A); test("anti-spam 2 s", "trop rapide" in err, err)
out,err=sql("insert into messages (canal,texte) values ('pirate','x');", B); test("canal inconnu refuse", "check" in err.lower() or "violates" in err, err)
out,err=sql("insert into messages (canal,texte) values ('general', repeat('a',501));", C); test("501 caracteres refuses", "violates" in err, err)
out,err=sql("select count(*) from messages;", None); n0=out
out,err=sql("delete from messages where pseudo='Alice' returning id;", B); test("impossible d'effacer le message d'un autre", out=="", out+err)
out,err=sql("set role anon; select count(*) from messages;"); test("messages invisibles sans compte", out.endswith("0"), out+err)
# prives
time.sleep(2.1)
out,err=sql(f"insert into prives (a,texte) values ('{B}','coucou Bob');", A); test("prive envoye", not err, err)
out,err=sql("select count(*) from prives;", C); test("prive invisible pour un tiers", out=="0", out+err)
out,err=sql("select count(*) from prives;", B); test("prive lu par le destinataire", out=="1", out+err)
out,err=sql(f"update prives set lu=true, texte='modifie' where a='{B}' returning texte, lu;", B); test("marquer lu sans pouvoir modifier le texte", out=="coucou Bob|t", out+err)
out,err=sql(f"update prives set texte='hack' where de='{A}' returning id;", A); test("l'expediteur ne peut pas modifier", out=="", out+err)
out,err=sql(f"insert into blocages (bloque) values ('{A}');", B); test("blocage", not err, err)
time.sleep(2.1)
out,err=sql(f"insert into prives (a,texte) values ('{B}','encore moi');", A); test("bloque : prive refuse", "bloque" in err, err)
out,err=sql("select count(*) from blocages;", A); test("blocages des autres invisibles", out=="0", out+err)
# signalements / moderation
out,err=sql(f"insert into signalements (cible, raison) values ('{A}','insulte');", B); test("signalement envoye", not err, err)
out,err=sql("select count(*) from signalements;", B); test("signalements invisibles hors moderateurs", out=="0", out+err)
out,err=sql(f"insert into moderateurs values ('{C}');", C); test("impossible de se nommer moderateur", "row-level security" in err or "permission" in err, err)
sql(f"insert into moderateurs values ('{C}');")
out,err=sql("select count(*) from signalements;", C); test("moderateur lit les signalements", out=="1", out+err)
out,err=sql("delete from messages where pseudo='Alice' returning id;", C); test("moderateur efface un message", out!="", out+err)
# ventes
obj = '{"objet":"baton-disciple","rarete":"commun","niveau":3,"lignes":[{"stat":"atq","valeur":4}]}'
out,err=sql(f"insert into ventes (objet,prix) values ('{obj}',50) returning id, pseudo, emplacement;", A); test("mise en vente valide", not err and "Alice|arme" in out, out+err)
vid = out.split("|")[0] if out else "0"
bad = '{"objet":"baton-disciple","rarete":"commun","niveau":3,"lignes":[{"stat":"atq","valeur":99}]}'
out,err=sql(f"insert into ventes (objet,prix) values ('{bad}',50);", A); test("objet aux stats impossibles refuse", "objet refuse" in err, err)
bad2 = '{"objet":"baton-disciple","rarete":"legendaire","niveau":3,"lignes":[{"stat":"atq","valeur":4}]}'
out,err=sql(f"insert into ventes (objet,prix) values ('{bad2}',50);", A); test("rarete falsifiee refusee", "objet refuse" in err, err)
out,err=sql(f"insert into ventes (objet,prix) values ('{obj}',999999);", A); test("prix plafonne", "violates" in err, err)
out,err=sql(f"update ventes set prix=1 where id={vid} returning id;", A); test("impossible de modifier une annonce directement", out=="" , out+err)
out,err=sql(f"select acheter_vente({vid});", A); test("impossible d'acheter sa propre annonce", "indisponible" in err, err)
out,err=sql(f"select acheter_vente({vid});", B); test("achat", '"prix": 50' in out, out+err)
out,err=sql(f"select acheter_vente({vid});", C); test("pas de double achat", "indisponible" in err, err)
out,err=sql(f"select retirer_vente({vid});", A); test("impossible de retirer une annonce vendue", "indisponible" in err, err)
out,err=sql("select recuperer_gains();", B); test("l'acheteur n'encaisse rien", out=="0", out+err)
out,err=sql("select recuperer_gains();", A); test("vendeur encaisse 95 %", out=="47", out+err)
out,err=sql("select recuperer_gains();", A); test("pas de double encaissement", out=="0", out+err)
for i in range(4): sql(f"insert into ventes (objet,prix) values ('{obj}',60);", A)
out,err=sql(f"insert into ventes (objet,prix) values ('{obj}',60);", A); test("limite de 5 ventes par jour", "limite ventes jour" in err, err)
out,err=sql("select count(*) from ventes where statut='en_vente';", C); test("annonces visibles par tous", out=="4", out+err)
out,err=sql(f"select retirer_vente((select id from ventes where statut='en_vente' limit 1));", B); test("impossible de retirer l'annonce d'un autre", "indisponible" in err, err)
out,err=sql(f"select retirer_vente((select id from ventes where statut='en_vente' limit 1));", A); test("retirer son annonce rend l'objet", "baton-disciple" in out, out+err)
# boss collectif
out,err=sql("select semaine_serveur();"); sem=int(out.split()[-1]) if out else 0
out,err=sql("insert into boss_collectif (joueur,semaine,degats) values (auth.uid(), 1, 99999999);", A); test("pas d'ecriture directe au boss collectif", "row-level security" in err or "permission" in err, err)
out,err=sql(f"select contribuer_boss({sem}, 500000);", A); test("contribution au boss collectif", '"total": 500000' in out, out+err)
out,err=sql(f"select contribuer_boss({sem}, 300000);", B); test("les degats s'additionnent", '"total": 800000' in out and '"joueurs": 2' in out, out+err)
out,err=sql(f"select contribuer_boss({sem}, 99000000);", A); test("degats impossibles refuses", "degats refuses" in err, err)
out,err=sql(f"select contribuer_boss({sem} + 5, 1000);", A); test("semaine lointaine refusee", "semaine refusee" in err, err)
sql(f"select contribuer_boss({sem}, 1);", A); sql(f"select contribuer_boss({sem}, 1);", A)
out,err=sql(f"select contribuer_boss({sem}, 1);", A); test("3 tentatives par jour au plus", "limite tentatives" in err, err)
out,err=sql(f"set role anon; select total_boss({sem});"); test("total lisible sans compte", "800002" in out, out+err)
# echanges
out,err=sql("insert into echanges (donne,veut) values ('naruto','luffy') returning id, pseudo;", A)
eid = out.split("|")[0] if out else "0"
test("offre d'echange (meme rarete)", not err and "Alice" in out, out+err)
out,err=sql("insert into echanges (donne,veut) values ('naruto','goku');", A); test("raretes differentes refusees", "raretes differentes" in err, err)
out,err=sql("insert into echanges (donne,veut) values ('naruto','inconnu');", A); test("perso inconnu refuse", "perso inconnu" in err, err)
out,err=sql("insert into echanges (donne,veut) values ('secret01','secret03');", A); test("un Secret ne s'echange pas", "secret non echangeable" in err, err)
out,err=sql(f"update echanges set veut='sasuke' where id={eid} returning id;", A); test("offre non modifiable directement", out=="", out+err)
out,err=sql(f"select accepter_echange({eid});", A); test("impossible d'accepter sa propre offre", "indisponible" in err, err)
out,err=sql(f"select accepter_echange({eid});", B); test("echange accepte", '"donne": "naruto"' in out, out+err)
out,err=sql(f"select accepter_echange({eid});", C); test("pas de double acceptation", "indisponible" in err, err)
out,err=sql(f"select annuler_echange({eid});", A); test("impossible d'annuler une offre acceptee", "indisponible" in err, err)
out,err=sql("select recuperer_echanges();", A); test("l'auteur recupere la carte voulue", '"veut": "luffy"' in out and "Bob" in out, out+err)
out,err=sql("select recuperer_echanges();", A); test("pas de double recuperation", out=="[]", out+err)
out,err=sql("insert into echanges (donne,veut) values ('luffy','naruto') returning id;", B); e2 = out.split("|")[0] if out else "0"
out,err=sql(f"select annuler_echange({e2});", A); test("impossible d'annuler l'offre d'un autre", "indisponible" in err, err)
out,err=sql(f"select annuler_echange({e2});", B); test("annuler son offre rend la carte", out=="luffy", out+err)
for i in range(5): sql("insert into echanges (donne,veut) values ('luffy','naruto');", C)
out,err=sql("insert into echanges (donne,veut) values ('luffy','naruto');", C); test("5 offres ouvertes au plus", "limite echanges ouverts" in err, err)
# duels
eq = '[{"id":"naruto","niveau":20,"etoiles":2},{"id":"luffy","niveau":20,"etoiles":2},{"id":"goku","niveau":20,"etoiles":3},{"id":"sasuke","niveau":20,"etoiles":1},{"id":"zoro","niveau":20,"etoiles":1}]'
out,err=sql(f"insert into defenses (equipe, points) values ('{eq}', 99999) returning points, pseudo;", A); test("defense enregistree, points imposes a 1000", out=="1000|Alice", out+err)
bad = eq.replace('"niveau":20,"etoiles":3', '"niveau":999,"etoiles":3')
out,err=sql(f"insert into defenses (equipe) values ('{bad}');", B); test("defense impossible refusee", "equipe refusee" in err, err)
dup = eq.replace("luffy", "naruto")
out,err=sql(f"insert into defenses (equipe) values ('{dup}');", B); test("perso en double refuse", "equipe refusee" in err, err)
out,err=sql(f"insert into defenses (equipe) values ('{eq}');", B); test("defense de Bob", not err, err)
out,err=sql(f"update defenses set points=5000 where joueur='{A}' returning points;", A); test("impossible de changer ses points", out=="1000", out+err)
out,err=sql(f"update defenses set equipe='{eq}' where joueur='{A}' returning joueur;", B); test("impossible de changer la defense d'un autre", out=="", out+err)
out,err=sql(f"select resultat_duel('{A}', true, 123);", B); test("duel gagne : +20", '"gain": 20' in out and '"points": 1020' in out, out+err)
out,err=sql(f"select points from defenses where joueur='{A}';", C); test("la defense battue perd 10", out=="990", out+err)
out,err=sql(f"select resultat_duel('{A}', false, 1);", C); test("attaquer sans defense refuse", "defense requise" in err, err)
out,err=sql(f"select resultat_duel('{B}', true, 1);", B); test("impossible de s'attaquer soi-meme", "cible refusee" in err, err)
sql(f"select resultat_duel('{A}', false, 2);", B); sql(f"select resultat_duel('{A}', false, 3);", B)
out,err=sql(f"select resultat_duel('{A}', true, 4);", B); test("3 duels par jour contre la meme defense", "limite meme cible" in err, err)
out,err=sql("insert into duels (attaquant,cible,victoire) values (auth.uid(), auth.uid(), true);", B); test("pas d'ecriture directe des duels", "row-level security" in err or "permission" in err or "violates" in err, err)
out,err=sql("select count(*) from duels;", A); test("la defense voit les duels contre elle", out=="3", out+err)
out,err=sql("select count(*) from duels;", C); test("duels invisibles pour un tiers", out=="0", out+err)
print(f"\n{ok} OK, {ko} echec(s)")
