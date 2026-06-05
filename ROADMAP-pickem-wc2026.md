# 🏆 PICK'EM — Coupe du Monde 2026 (Canada / Mexique / USA)

> Roadmap technique & produit — v1.1 — 5 juin 2026
> Projet perso entre amis. **Build express : tout est shippé en 1 à 2 jours** (kickoff le 11 juin, donc large marge). Le plan est découpé en blocs de build dans l'ordre d'implémentation, pas en sprints.

---

## 1. Concept

Un site de **pick'em** façon esport (CS2 Majors / LoL Worlds) appliqué à la WC 2026 :

- Avant chaque **phase** du tournoi, les joueurs **lockent leurs prédictions** sur les résultats finaux de la phase.
- Connexion via **compte Twitter/X** (pas d'email, pas de mot de passe).
- Les prédictions sont **persistées** sur le compte et deviennent **immuables** après la deadline.
- **Classement général** (tous les joueurs) + **classements de groupes d'amis** (création/rejoindre via code d'invitation).
- Scoring automatique au fil des résultats réels.

### Philosophie produit
- Zéro friction : login X en 1 clic → on pick → on lock → on revient voir son score.
- Aspect social : partage de sa "carte de picks" sur X, comparaison avec ses amis.
- Pas d'argent en jeu, pas de mails, pas de notifications obligatoires.

---

## 2. Données du tournoi (source de vérité)

### 2.1 Format WC 2026
- **48 équipes**, **12 groupes de 4** (A → L).
- Qualification pour le **16e de finale (Round of 32)** : les **2 premiers de chaque groupe** (24) + les **8 meilleurs 3èmes** (8) = 32 équipes.
- Arbre à élimination directe ensuite : R32 → R16 (8e) → Quarts → Demies → Petite finale → **Finale le 19 juillet 2026 (MetLife Stadium, NY/NJ)**.
- 104 matchs au total.

### 2.2 Les 12 groupes confirmés (post-barrages, mars 2026)

| Groupe | Équipes |
|---|---|
| **A** | Mexique, Corée du Sud, Afrique du Sud, Tchéquie |
| **B** | Canada, Suisse, Qatar, Bosnie-Herzégovine |
| **C** | Brésil, Maroc, Écosse, Haïti |
| **D** | USA, Paraguay, Australie, Turquie |
| **E** | Allemagne, Équateur, Côte d'Ivoire, Curaçao |
| **F** | Pays-Bas, Japon, Tunisie, Suède |
| **G** | Belgique, Iran, Égypte, Nouvelle-Zélande |
| **H** | Espagne, Uruguay, Arabie Saoudite, Cap-Vert |
| **I** | France, Sénégal, Norvège, Irak |
| **J** | Argentine, Autriche, Algérie, Jordanie |
| **K** | Portugal, Colombie, Ouzbékistan, RD Congo |
| **L** | Angleterre, Croatie, Panama, Ghana |

### 2.3 Calendrier des phases (= deadlines de lock)

| Phase | Dates réelles | Lock des picks |
|---|---|---|
| Phase de groupes | 11 → 27 juin | **11 juin, coup d'envoi du match d'ouverture** |
| 16es (R32) | 28 juin → 3 juil. | Avant le 1er match du R32 |
| 8es (R16) | 4 → 7 juil. | Avant le 1er match du R16 |
| Quarts | 9 → 11 juil. | Avant le 1er quart |
| Demies | 14 → 15 juil. | Avant la 1re demie |
| Petite finale + Finale | 18 → 19 juil. | Avant la petite finale |

> Les heures exactes de chaque deadline sont stockées en base (UTC) dans la table `phases`, jamais en dur dans le code.

### 2.4 Source des résultats réels
Trois options (par ordre de préférence) :

1. **football-data.org** (compétition `WC`) — API REST gratuite (tier free : 10 req/min), standings + matchs + scores. Suffit largement pour un cron toutes les 10 min.
2. **API-Football (api-sports.io)** — plus riche (logos, live), free tier 100 req/jour, payant au-delà.
3. **Fallback manuel** : panneau admin pour saisir/corriger les résultats à la main (à construire de toute façon, c'est l'assurance-vie du projet).

Décision MVP : **football-data.org + admin manuel en secours.**

---

## 3. Mécanique de jeu

### 3.1 Ce qu'on prédit, phase par phase

**Phase 1 — Poules (le gros morceau, à shipper avant le 11 juin)**
Pour chacun des 12 groupes, le joueur ordonne les 4 équipes (drag & drop) :
- 1er du groupe
- 2e du groupe
- 3e du groupe
- 4e (éliminé)

Plus une prédiction bonus : cocher les **8 meilleurs 3èmes** parmi ses 12 troisièmes prédits (exactement comme le format réel).

**Phase 2 — R32** : pour chacun des 16 matchs (affiches connues après les poules), choisir le vainqueur.
**Phase 3 — R16** : 8 vainqueurs.
**Phase 4 — Quarts** : 4 vainqueurs.
**Phase 5 — Demies** : 2 finalistes.
**Phase 6 — Finales** : vainqueur de la petite finale + **champion du monde**.

Option "bracket complet" (à la CS2 Major) : dès la fin des poules, le joueur peut remplir tout l'arbre d'un coup. → **v2**, on garde le lock phase par phase pour le MVP (plus simple, plus de rétention car les gens reviennent).

### 3.2 Système de points (proposition)

| Prédiction | Points |
|---|---|
| Équipe qualifiée pour le R32 (peu importe la position) | 2 |
| Position exacte dans le groupe (1er/2e/3e/4e) | +3 |
| Meilleur 3ème correct | +2 |
| Vainqueur R32 | 5 |
| Vainqueur R16 | 8 |
| Vainqueur quart | 12 |
| Finaliste (demie) | 18 |
| Vainqueur petite finale | 10 |
| **Champion du monde** | **30** |

Principes : points croissants par round, la phase de poules pèse lourd en volume (12 groupes × max 14 pts = gros différenciateur), le champion fait basculer le classement en fin de tournoi. Les barèmes vivent en base/config, pas en dur → ajustables avant le lock de chaque phase.

**Tie-breakers du classement** : 1) total de points, 2) nb de positions exactes en poules, 3) date du dernier lock (le plus tôt gagne), 4) ordre alphabétique du handle.

### 3.3 Règles de lock
- Avant la deadline : picks modifiables à volonté (autosave, indicateur "non locké" / bouton **LOCK** explicite à la CS2 — au choix UX, le bouton LOCK est plus satisfaisant et plus lisible).
- À `phase.locks_at` (UTC, vérifié **côté serveur** à chaque écriture) : plus aucune mutation acceptée, même si le client triche sur son horloge.
- Picks incomplets à la deadline → comptés tels quels (ce qui est rempli score, le reste = 0).
- Un joueur qui s'inscrit après le lock d'une phase peut quand même jouer les phases suivantes.

---

## 4. Stack technique

### 4.1 Vue d'ensemble

| Brique | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 15 (App Router, RSC, Server Actions)** | Ton stack habituel, natif Vercel |
| Hébergement | **Vercel** (Hobby suffit au début) | Demandé |
| Langage | TypeScript strict | |
| Auth | **Auth.js v5 (NextAuth)** + provider **Twitter/X OAuth 2.0** | Login X en 1 clic, gratuit (l'OAuth "Sign in with X" ne consomme pas le quota payant de l'API) |
| Base de données | **Neon Postgres** (serverless, intégration Vercel native) | Free tier généreux, branches de DB pour le dev |
| ORM | **Drizzle ORM** | Léger, typé, migrations SQL lisibles, parfait sur serverless |
| Styling | **Tailwind CSS v4** + éventuellement shadcn/ui en base neutre | Minimalisme demandé |
| Drag & drop poules | **dnd-kit** | Léger, accessible, tactile |
| Validation | **Zod** (schémas partagés client/serveur) | |
| Cron résultats | **Vercel Cron** → route `/api/cron/sync-results` (toutes les 10 min pendant les jours de match) | |
| Cache classements | `unstable_cache` / revalidateTag, ou table matérialisée `leaderboard_snapshots` | Le classement ne se recalcule pas à chaque requête |
| Analytics | Vercel Analytics (optionnel) | |
| Monitoring erreurs | Sentry (optionnel, v2) | |

### 4.2 Notes Auth X
- Créer une app sur developer.x.com (free tier), activer **OAuth 2.0** avec scopes `users.read tweet.read offline.access` (le minimum pour le profil).
- Récupérer : `id` (stable), `username` (handle), `name`, `profile_image_url`.
- Stocker l'`id` X comme clé d'identité (le handle peut changer → resynchroniser le handle/avatar à chaque login).
- Sessions : **JWT** (pas de table sessions nécessaire) ou database sessions si on veut pouvoir révoquer. MVP : JWT.
- Pas de mail → aucun champ email en base, RGPD ultra simple (id X + handle + avatar, c'est tout).

### 4.3 Modèle de données (Postgres / Drizzle)

```
users
  id            uuid PK
  x_id          text UNIQUE NOT NULL
  handle        text NOT NULL
  display_name  text
  avatar_url    text
  is_admin      boolean DEFAULT false
  created_at    timestamptz

teams
  id            text PK            -- code FIFA: 'FRA', 'BRA'...
  name_fr       text
  name_en       text
  group_letter  char(1)            -- 'A'..'L'
  flag_emoji    text               -- ou asset SVG

phases
  id            text PK            -- 'groups','r32','r16','qf','sf','final'
  label_fr      text
  opens_at      timestamptz        -- ouverture des picks
  locks_at      timestamptz        -- DEADLINE (source de vérité)
  status        enum('upcoming','open','locked','scored')

matches                            -- rempli au fil du tournoi (R32+)
  id            text PK            -- id football-data
  phase_id      FK phases
  home_team_id  FK teams NULL      -- NULL tant que l'affiche est inconnue
  away_team_id  FK teams NULL
  kickoff_at    timestamptz
  home_score    int NULL
  away_score    int NULL
  winner_id     FK teams NULL      -- après tirs au but inclus
  status        enum('scheduled','live','finished')

group_picks                        -- Phase 1
  user_id       FK users
  group_letter  char(1)
  team_id       FK teams
  predicted_pos int (1..4)
  PK (user_id, group_letter, predicted_pos)

third_place_picks                  -- les 8 meilleurs 3èmes prédits
  user_id       FK users
  team_id       FK teams
  PK (user_id, team_id)

match_picks                        -- Phases 2..6
  user_id       FK users
  match_id      FK matches
  predicted_winner_id FK teams
  PK (user_id, match_id)

pick_locks                         -- trace du lock explicite (bouton LOCK)
  user_id       FK users
  phase_id      FK phases
  locked_at     timestamptz
  PK (user_id, phase_id)

scores
  user_id       FK users
  phase_id      FK phases
  points        int
  details       jsonb              -- breakdown pour l'UI
  PK (user_id, phase_id)

friend_groups
  id            uuid PK
  name          text
  invite_code   text UNIQUE        -- 6-8 chars, ex 'WC26-K3X9'
  owner_id      FK users
  created_at    timestamptz

friend_group_members
  group_id      FK friend_groups
  user_id       FK users
  joined_at     timestamptz
  PK (group_id, user_id)

results_group_standings            -- résultat réel des poules (sync cron/admin)
  group_letter  char(1)
  team_id       FK teams
  final_pos     int
  is_best_third boolean
  PK (group_letter, final_pos)
```

Index utiles : `match_picks(match_id)`, `scores(phase_id, points DESC)`, `friend_group_members(user_id)`.

### 4.4 Intégrité / anti-triche
- Toute écriture de pick passe par une **Server Action** qui vérifie `now() < phase.locks_at` **en SQL** (`WHERE` conditionnel) → pas de race condition.
- Les picks des autres joueurs sont **cachés jusqu'au lock de la phase** (sinon copier le top du classement est trivial). Après lock → tout devient public (page profil consultable, fun social).
- Rate limiting basique sur les Server Actions (Upstash Ratelimit si besoin, sinon rien au début).

### 4.5 Pipeline de scoring
1. Cron `*/10 * * * *` (jours de match) → fetch football-data → upsert `matches` + `results_group_standings`.
2. Quand une phase passe à "tous les matchs finished" → job de scoring : calcul `scores` pour tous les users (requête SQL ensembliste, pas de boucle applicative), `details` jsonb pour l'affichage.
3. `revalidateTag('leaderboard')` → les pages classement se régénèrent.
4. Scoring **idempotent** (recalcul complet à chaque run) → un résultat corrigé à la main se répercute tout seul.

### 4.6 Arborescence des routes (App Router)

```
/                         Landing + état du tournoi + CTA login
/picks                    Hub des phases (cartes par phase, statut, countdown)
/picks/groups             UI drag&drop des 12 poules + 8 meilleurs 3èmes + LOCK
/picks/[phase]            Picks des phases KO (r32, r16, qf, sf, final)
/leaderboard              Classement général (paginé, recherche par handle)
/groups                   Mes groupes d'amis + créer + rejoindre par code
/groups/[id]              Classement du groupe + gestion (owner: rename, kick)
/g/[inviteCode]           Lien d'invitation direct → join en 1 clic
/u/[handle]               Profil public: picks (post-lock), points, breakdown
/admin                    Saisie/correction résultats, gestion phases (is_admin)
/api/auth/[...nextauth]   Auth.js
/api/cron/sync-results    Vercel Cron (protégé par CRON_SECRET)
```

---

## 5. Design — DA "WE ARE 26", épuré & minimaliste

### 5.1 Direction
La DA officielle WC 26 est **festive, géométrique, tricolore** (un emblème par pays hôte : rouge Canada, vert Mexique, bleu USA) sur fonds très sombres ou très clairs. On en reprend **l'esprit, pas la surcharge** :

- **Fond** : navy quasi-noir `#020F2A` (c'est littéralement la theme-color du site FIFA 2026) en dark mode par défaut ; blanc cassé `#FAFAF7` en light.
- **Trio d'accents festifs** (usage parcimonieux : barres de score, états, hover) :
  - Rouge Canada `#E8112D`
  - Vert Mexique `#0E7C3F`
  - Bleu USA `#1D4ED8` (ajuster au besoin)
- **Un seul accent par écran** quand possible ; le trio complet réservé aux moments "célébration" (lock confirmé, phase scorée, header de la finale).
- Typo : une grotesque condensée et impactante pour les titres (ex. **Archivo Expanded/Black** ou **Space Grotesk**), inter/system pour le corps.
- Beaucoup de blanc tournant, cartes plates, bordures 1px `rgba(255,255,255,.08)`, radius modérés (8-12px), pas de glassmorphism ni de gros gradients.
- Drapeaux : emojis au MVP (zéro asset), SVG circulaires en v2.
- Micro-interactions sobres : le **LOCK** déclenche la seule vraie animation festive (confetti tricolore discret + cadenas).
- Countdown avant deadline omniprésent (header sticky) — c'est LE driver d'urgence du pick'em.

### 5.2 Composants clés
- `GroupCard` : poule drag & drop, positions 1→4, liseré vert sur les 2 qualifiés, pointillé sur le 3e.
- `BracketView` : arbre R32→Finale, lecture seule + mode pick (tap sur le vainqueur).
- `LeaderboardRow` : rang, avatar X, handle, points, delta depuis la dernière phase (▲▼).
- `PhaseStatusPill` : `OUVERT` / `LOCK DANS 3 J 04 H` / `LOCKÉ` / `SCORÉ`.
- `ShareCard` : image OG générée (`@vercel/og`) des picks d'un joueur → partage X.

---

## 6. Déroulé / Plan de build express (J1 → J2)

> Tout est codé d'un trait, dans cet ordre. Chaque bloc se termine par un état déployable sur Vercel.

### 🧱 Bloc 1 — Socle (J1 matin)
- [ ] Repo + Next.js 15 + TS + Tailwind v4 + Drizzle + Neon (intégration Vercel).
- [ ] App developer X (OAuth 2.0, callbacks prod + localhost) + Auth.js : login/logout, upsert `users`.
- [ ] Schéma Drizzle complet + seed : 48 équipes, 12 groupes, 6 phases avec `locks_at`.
- [ ] Layout global : header (logo, countdown, avatar X), thème navy, premier deploy.

### 🎯 Bloc 2 — Picks poules (J1 après-midi)
- [ ] `/picks/groups` : 12 `GroupCard` drag & drop (dnd-kit) + sélection des 8 meilleurs 3èmes.
- [ ] Autosave (Server Action + zod) + bouton **LOCK** + garde serveur sur `locks_at`.
- [ ] UI bracket KO (`BracketView`) en mode pick pour les phases 2→6 (même mécanique, plus simple que les poules : un tap = un vainqueur).

### 👥 Bloc 3 — Social & classements (J1 soir / J2 matin)
- [ ] `/leaderboard` général.
- [ ] Groupes d'amis : créer, code d'invitation, `/g/[code]` join en 1 clic, classement de groupe.
- [ ] Profil `/u/[handle]` (picks masqués pré-lock, publics post-lock).
- [ ] Mobile-first partout (les picks se feront au pouce).

### ⚙️ Bloc 4 — Résultats & scoring (J2)
- [ ] Admin minimal `/admin` : saisie/correction des résultats, bascule statut des phases.
- [ ] Cron football-data + mapping ids ↔ codes FIFA (peut même être optionnel : pour un groupe d'amis, la saisie admin des résultats prend 2 min par journée).
- [ ] Job de scoring idempotent (testé sur fixtures simulées) + revalidation des classements.
- [ ] OG image de partage des picks + landing propre.
- [ ] Passe de test des cas limites : lock à la seconde, picks incomplets, handle changé.

### ✅ Fin J2 : tout est en prod
Les potes se connectent, pickent, lockent. Entre le 5 et le 11 juin il reste juste à inviter tout le monde et éventuellement peaufiner le design.

### 🎁 Pendant le tournoi (si l'envie prend)
- Points provisoires en live pendant les poules.
- Deltas de classement (▲▼), page "mes stats".
- Page finale "Hall of Fame" : podium général + par groupe d'amis, récap partageable.

### ⬜ v2 / idées en réserve
- Bonus prono "score exact" sur la finale, MVP du tournoi, meilleur buteur.
- Badges/achievements (12/12 poules parfaites, "Madame Irma"…).
- Mode "bracket complet" lockable dès la fin des poules avec multiplicateur de points.
- Notifications push web avant les deadlines (pas de mail, comme demandé).
- i18n EN/ES, drapeaux SVG, thèmes par pays hôte.
- Réutilisation du moteur pour l'Euro 2028 / les Majors CS2 (le schéma `phases/matches/picks` est générique).

---

## 7. Risques & points d'attention

| Risque | Mitigation |
|---|---|
| Free tier football-data en retard/incomplet | Admin manuel = source de vérité finale (et pour un groupe d'amis, la saisie manuelle suffit même sans cron) ; le cron n'écrase jamais une correction admin (flag `manual_override`). |
| Changements côté X (OAuth, quotas) | Le "Sign in with X" reste gratuit ; plan B trivial : login invité par pseudo. |
| Tricherie horloge client / picks tardifs | Vérification `locks_at` en SQL côté serveur uniquement (oui, même entre amis — surtout entre amis). |
| Égalités au classement | Tie-breakers définis dès le départ (cf. §3.2) et affichés dans les règles. |
| Cas réels tordus (forfait, match rejoué) | Tout résultat est éditable en admin + scoring idempotent. |

---

## 8. Variables d'environnement

```
DATABASE_URL=            # Neon
AUTH_SECRET=             # npx auth secret
AUTH_TWITTER_ID=
AUTH_TWITTER_SECRET=
FOOTBALL_DATA_TOKEN=
CRON_SECRET=             # protège /api/cron/*
NEXT_PUBLIC_APP_URL=
```

---

## 9. Definition of Done — fin du build (J2)

1. Je me connecte avec X en 1 clic.
2. Je classe les 4 équipes des 12 poules + mes 8 meilleurs 3èmes, je LOCK — et le bracket KO est déjà prêt pour les phases suivantes.
3. Mes picks sont là quand je reviens, et infalsifiables après la deadline.
4. Je crée un groupe "Les potes", je partage le lien, ils apparaissent dans notre classement.
5. Le classement général liste tout le monde.
6. Les résultats (cron ou saisie admin) font tomber les points automatiquement, phase après phase, jusqu'au champion du monde.
