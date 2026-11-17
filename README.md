# 🛵 Babana

**Plateforme de livraison pour les petits commerces de Ngaoundéré et de sa périphérie (Dang, Bini).**

Les commerçants créent leurs courses en ligne, le client partage sa position GPS d'un simple clic, le prix est calculé automatiquement selon la distance et le livreur reçoit la course sur WhatsApp. L'argent encaissé est reversé au commerçant chaque soir.

> Statut : **MVP** (version de démonstration), en cours de test.

---

## Sommaire

- [Le problème](#le-problème)
- [Comment ça marche](#comment-ça-marche)
- [Fonctionnalités](#fonctionnalités)
- [Tarification](#tarification)
- [Technologies](#technologies)
- [Installation en local](#installation-en-local)
- [Déploiement en ligne](#déploiement-en-ligne)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Structure du projet](#structure-du-projet)
- [Modifier la base de données](#modifier-la-base-de-données)
- [Feuille de route](#feuille-de-route)

---

## Le problème

À Ngaoundéré, les petits commerces vendent de plus en plus à distance (Facebook, WhatsApp), mais la livraison reste improvisée :

- le commerçant appelle un moto-taximan au hasard, **sans suivi** ni garantie sur l'argent encaissé ;
- les **adresses sont floues** et beaucoup de clients ne savent pas partager leur position sur WhatsApp ;
- le prix se **négocie à chaque course**.

## Comment ça marche

| Étape | Qui | Ce qui se passe |
| --- | --- | --- |
| 1 | Commerçant | Crée la course : nom et numéro du client, colis, montant à encaisser. |
| 2 | Client | Reçoit un lien par WhatsApp ou SMS, appuie sur **« Partager ma position »** : son GPS est enregistré, sans rien installer. |
| 3 | Plateforme | Calcule la distance et le **prix de la course** automatiquement. |
| 4 | Admin | Assigne un livreur et lui envoie la course **sur WhatsApp en un clic** (itinéraires Google Maps inclus). |
| 5 | Livreur | Récupère le colis, livre, encaisse, met à jour le statut depuis son téléphone. |
| 6 | Admin | Reverse au commerçant, le soir même, l'argent encaissé moins le prix des courses. |

## Fonctionnalités

### Espace commerçant
- Inscription avec enregistrement de la position GPS du commerce
- Création d'une course en moins de 30 secondes
- Envoi du lien de localisation au client (WhatsApp, SMS ou copie)
- Suivi des statuts en temps réel et historique des courses
- Montant à recevoir (reversements)

### Page client (sans compte)
- Partage de la position GPS en un bouton
- Point de repère facultatif (« derrière la mosquée, portail bleu »)
- Solution de secours : envoi du point de repère seul si le GPS ne fonctionne pas

### Espace livreur
- **Demandes disponibles** : le livreur voit les courses prêtes sans livreur et les accepte lui-même (un seul livreur peut prendre une course, 3 courses actives maximum)
- **Rémunération selon la distance** : 150 FCFA + 30 FCFA/km, +100 FCFA colis lourd ou nuit (réglable dans `src/lib/pricing.ts`), affichée sur chaque course
- **Mes gains** : aujourd'hui, 7 derniers jours, montant à recevoir de Babana et historique payé / à payer
- Liste des courses à faire : retrait puis livraison
- Boutons **Itinéraire** (Google Maps) et **Appeler**
- Statuts : *Colis récupéré*, *Livré*, *Échec* (avec motif)

### Navigation
- Barre d'onglets fixée en bas de l'écran sur mobile dans chaque espace, liens « Retour » sur les pages de détail
- Bouton « Mon espace » sur la page d'accueil quand on est connecté

### Langues : français et fulfulde
- Bouton **FR / Fulfulde** sur toutes les pages publiques, commerçant, client et livreur (choix mémorisé)
- Traductions dans [`src/lib/i18n.ts`](src/lib/i18n.ts) : ⚠️ les textes fulfulde sont un premier jet à faire relire par un locuteur natif

### Expérience
- Page d'accueil animée : apparitions au défilement, bandeau des quartiers, compteurs, calculateur de prix interactif, FAQ en accordéon
- Animations légères dans l'application (progression de la course, statuts actifs qui pulsent, confirmation animée côté client)
- Les animations se désactivent si le téléphone est réglé pour réduire les mouvements

### Espace administrateur
- Toutes les courses avec filtres (actives, à assigner, livrées, échecs)
- Assignation d'un livreur et envoi de la course sur WhatsApp
- Saisie manuelle de la position du client si besoin
- **Paiements** : reversements aux commerçants et paie des livreurs
- **Mots de passe oubliés** : demandes des utilisateurs et envoi d'un lien de réinitialisation sur WhatsApp (valable 24 h, utilisable une seule fois)
- Création et désactivation des comptes livreurs et commerçants

## Tarification

Le prix est calculé selon la distance entre le commerce et le client :

**300 FCFA de prise en charge + 100 FCFA par km**, arrondi aux 50 FCFA supérieurs, **minimum 500 FCFA**.

| Distance | Prix client | Paie du livreur |
| --- | --- | --- |
| 2 km | 500 FCFA | 250 FCFA |
| 5 km | 800 FCFA | 300 FCFA |
| 8 km | 1 100 FCFA | 400 FCFA |
| 12 km | 1 500 FCFA | 550 FCFA |
| 15 km | 1 800 FCFA | 600 FCFA |

**Poids** : compris jusqu'à 5 kg ; de 5 à 20 kg, **50 FCFA par kilo entamé**, dont la moitié pour le livreur ; au-delà de 20 kg, pas de livraison à moto.
**Nuit** : +200 FCFA après 19 h (dont 100 FCFA pour le livreur).

### Garantie des colis et conditions de service
- Babana est responsable du colis de la récupération jusqu'à la remise au client.
- Sans valeur déclarée : remboursement de la valeur réelle jusqu'à 10 000 FCFA. Avec valeur déclarée (jusqu'à 300 000 FCFA) : couverture jusqu'à cette valeur pour 1 % (minimum 100 FCFA), déduit au reversement.
- Le commerçant accepte les conditions à l'inscription (date et version enregistrées) ; les comptes existants doivent les accepter avant de créer une course. Texte complet : page `/conditions`, contenu dans [`src/lib/terms.ts`](src/lib/terms.ts) (changer `TERMS_VERSION` pour redemander l'acceptation).

La distance est celle du **vrai trajet par la route**, calculée avec [OSRM](https://project-osrm.org) à partir des cartes OpenStreetMap (voir [`src/lib/routing.ts`](src/lib/routing.ts)). Si le service ne répond pas en 4 secondes, la plateforme utilise une estimation (distance à vol d'oiseau × 1,3) pour ne jamais bloquer une course. Les tarifs se modifient dans [`src/lib/pricing.ts`](src/lib/pricing.ts).

## Technologies

| Rôle | Outil |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router, Server Actions) + TypeScript |
| Interface | [Tailwind CSS 4](https://tailwindcss.com), polices Bricolage Grotesque, Inter et JetBrains Mono (auto-hébergées), application web installable (PWA) |
| Base de données | PostgreSQL ([Neon](https://neon.tech)) + [Drizzle ORM](https://orm.drizzle.team) |
| Authentification | Sessions signées (JWT via `jose`), mots de passe hachés (`bcryptjs`) |
| Hébergement | [Vercel](https://vercel.com) (région Francfort, comme la base Neon) |

## Installation en local

**Prérequis :** Node.js 20 ou plus récent, une base PostgreSQL (locale ou Neon gratuite).

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer l'environnement** : copier `.env.example` en `.env`, puis remplir :

   | Variable | Description |
   | --- | --- |
   | `DATABASE_URL` | URL de la base (sur Neon : avec *Connection pooling*) |
   | `DIRECT_URL` | URL directe de la base (sur Neon : sans *Connection pooling*), utilisée pour les migrations |
   | `AUTH_SECRET` | Chaîne aléatoire d'au moins 32 caractères |
   | `NEXT_PUBLIC_APP_NAME` | Nom affiché sur le site |
   | `NEXT_PUBLIC_APP_URL` | Facultatif : URL publique du site (détectée automatiquement sur Vercel) |
   | `ADMIN_PHONE` | Numéro du compte administrateur (ex. `677112233`) |
   | `ADMIN_PASSWORD` | Mot de passe du compte administrateur |
   | `SEED_DEMO` | `1` pour créer des comptes et une course de démonstration |
| `OSRM_URL` | Facultatif : adresse d'un serveur OSRM (par défaut, le serveur public gratuit) |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP` | Facultatif : numéro WhatsApp de Babana, proposé sur la page « Mot de passe oublié » |

   Pour générer `AUTH_SECRET` :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Créer les tables et le compte admin**
   ```bash
   npm run db:migrate
   npm run seed
   ```

4. **Lancer le site**
   ```bash
   npm run dev
   ```
   Puis ouvrir http://localhost:3000.

> Le partage de position GPS ne fonctionne qu'en **HTTPS** (ou sur `localhost`). Pour le tester sur un téléphone, utilisez la version en ligne.

## Déploiement en ligne

1. **Base de données (Neon)** : créer un projet dans la région *AWS Europe Central (Frankfurt)* et récupérer les deux URL de connexion (avec et sans *Connection pooling*).
2. **Tables et compte admin** : depuis votre PC, avec ces URL dans `.env`, lancer `npm run db:migrate` puis `npm run seed`.
3. **Vercel** : *Add New → Project*, importer ce dépôt GitHub, puis ajouter dans *Environment Variables* :
   `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_NAME`.
4. Cliquer sur **Deploy**.

À chaque nouveau `git push`, Vercel redéploie le site et applique automatiquement les nouvelles migrations (script `vercel-build`).

## Comptes de démonstration

Créés avec `SEED_DEMO=1` :

| Rôle | Téléphone | Mot de passe |
| --- | --- | --- |
| Commerçant (Boutique Aïssa Mode) | `670000001` | `demo1234` |
| Livreur | `670000002` | `demo1234` |
| Administrateur | celui de `ADMIN_PHONE` | celui de `ADMIN_PASSWORD` |

⚠️ Désactivez les comptes de démonstration avant une utilisation réelle (Admin → *Livreurs & commerçants*).

## Structure du projet

```
├── drizzle/                     Migrations SQL générées
├── public/                      Icône et fichiers statiques
├── scripts/
│   ├── migrate.ts               Applique les migrations
│   └── seed.ts                  Crée l'admin et les données de démo
└── src/
    ├── app/
    │   ├── page.tsx             Page d'accueil (présentation et tarifs)
    │   ├── connexion/           Connexion
    │   ├── inscription/         Inscription commerçant
    │   ├── commercant/          Espace commerçant
    │   ├── livreur/             Espace livreur
    │   ├── admin/               Espace administrateur
    │   ├── l/[token]/           Page client : partage de la position
    │   ├── api/locate/[token]/  Réception de la position GPS
    │   └── actions/             Actions serveur (auth, commerçant, livreur, admin)
    ├── components/              Composants d'interface et formulaires
    ├── lib/
    │   ├── schema.ts            Schéma de la base de données
    │   ├── pricing.ts           Calcul du prix selon la distance
    │   ├── messages.ts          Messages WhatsApp (client et livreur)
    │   ├── session.ts, auth.ts  Sessions et contrôle d'accès
    │   └── format.ts            Téléphones, montants, dates, liens
    └── middleware.ts            Protection des espaces par rôle
```

## Modifier la base de données

1. Modifier [`src/lib/schema.ts`](src/lib/schema.ts).
2. Générer la migration :
   ```bash
   npm run db:generate
   ```
3. L'appliquer en local :
   ```bash
   npm run db:migrate
   ```
4. Faire un `git push` : Vercel l'applique en ligne au prochain déploiement.

## Feuille de route

**Version 2**
- [ ] Carte interactive sur les pages de course
- [ ] Tableau de bord chiffré (courses et chiffre d'affaires par jour et par semaine)
- [ ] Envoi automatique des courses via l'API WhatsApp Business
- [ ] Paiement Mobile Money et Orange Money intégré (Notch Pay, mode test d'abord)
- [ ] Packs mensuels avec réduction pour les commerçants réguliers

**Version 3**
- [ ] Suivi du livreur en temps réel
- [ ] Attribution automatique des courses entre plusieurs livreurs
- [ ] Ouverture à d'autres villes (Garoua, Meiganga)

---

Projet développé par **Abbas Madani** — [github.com/Mamzilion](https://github.com/Mamzilion)
