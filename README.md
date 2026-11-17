# Ngaoundéré Livraison — MVP

Plateforme de livraison pour les petits commerces de Ngaoundéré, Dang et Bini.

- **Commerçant** : crée une course, envoie au client un lien (WhatsApp/SMS), suit la livraison et ses reversements.
- **Client** : ouvre le lien, appuie sur « Partager ma position » → GPS enregistré, sans application à installer.
- **Prix** : calculé automatiquement selon la distance (300 FCFA + 80 FCFA/km, arrondi à 50, minimum 500 FCFA ; +200 colis lourd ; +200 après 19 h). Voir `src/lib/pricing.ts`.
- **Admin** : voit toutes les courses, assigne un livreur, lui envoie la course sur WhatsApp en un clic, gère les reversements et les comptes.
- **Livreur** : liste de ses courses, itinéraires Google Maps, boutons « Récupéré », « Livré », « Échec ».

## Technologies

Next.js 15 (App Router, Server Actions) · TypeScript · Tailwind CSS 4 · PostgreSQL + Drizzle ORM · sessions JWT (jose) · hébergement Vercel + base Neon.

## Lancer en local (Windows / Laragon ou autre)

1. Installer Node.js 20+ et avoir une base PostgreSQL (locale ou Neon gratuite).
2. Copier `.env.example` en `.env` et remplir les valeurs.
3. Installer et préparer la base :
   ```bash
   npm install
   npm run db:migrate   # crée les tables
   npm run seed         # crée le compte admin (+ données de démo si SEED_DEMO=1)
   npm run dev
   ```
4. Ouvrir http://localhost:3000 — admin : le numéro et le mot de passe mis dans `.env`.

Comptes de démo (avec `SEED_DEMO=1`) : commerçant `670000001`, livreur `670000002`, mot de passe `demo1234`.

## Mettre en ligne (gratuit)

1. **Base de données** : créer un projet sur [neon.tech](https://neon.tech) (région la plus proche, ex. Europe). Copier :
   - l'URL *pooled* → `DATABASE_URL`
   - l'URL *directe* (sans `-pooler`) → `DIRECT_URL`
2. **Code** : pousser ce dossier sur un dépôt GitHub.
3. **Vercel** : sur [vercel.com](https://vercel.com) → *Add New Project* → importer le dépôt. Dans *Environment Variables*, ajouter :
   `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (32+ caractères aléatoires), `NEXT_PUBLIC_APP_NAME`.
   Le script `vercel-build` applique automatiquement les migrations à chaque déploiement.
4. **Compte admin** : depuis ton PC, avec les URL Neon dans `.env`, lancer `npm run seed` une fois.
5. (Plus tard) Nom de domaine : *Settings → Domains* sur Vercel, puis mettre `NEXT_PUBLIC_APP_URL`.

## Modifier la base de données

Modifier `src/lib/schema.ts`, puis :
```bash
npm run db:generate   # crée un fichier SQL dans ./drizzle
npm run db:migrate
```

## Structure

```
src/app/            pages (accueil, connexion, inscription, commercant/, livreur/, admin/, l/[token])
src/app/actions/    actions serveur (auth, commerçant, admin, livreur)
src/app/api/locate/ réception de la position GPS du client
src/lib/            schéma BD, tarification, sessions, formatage, messages WhatsApp
scripts/            migrations et seed
```

## Prochaines étapes (V2)

- Envoi automatique WhatsApp via l'API WhatsApp Business.
- Paiement MoMo/OM intégré (Campay, Notch Pay ou CinetPay).
- Carte pour placer le client à la main, suivi du livreur en temps réel.
