# Project Brain: g-aura-tm-events

## Présentation
Nouveau projet web pour le client "g-aura-tm-events".
Le but principal actuel est de garantir une isolation stricte des environnements de développement (GitHub, Vercel, Supabase) pour ne pas utiliser les accès globaux de l'agence.

## Décisions Architecturales
- **Identité Vercel** : On n'utilise pas `vercel login`. On utilise les variables `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` et `VERCEL_TOKEN` dans `.env.local`. Les déploiements devront se faire avec `npx vercel --token $VERCEL_TOKEN`.
- **Identité Supabase** : Utilisation d'un MCP Supabase séparé (`supabase-g-aura`). Pour le CLI, on utilisera `SUPABASE_ACCESS_TOKEN`.
- **Identité GitHub** : Configuration Git locale au projet (`git config --local`).

## Règles de Style
- **Mobile First** : Toujours penser à l'affichage mobile avant le desktop.
- **Design Premium** : Animations subtiles (glassmorphism, dark mode, typography moderne). Pas de placeholders basiques, générer des images si besoin.
- **Code & Langue** : La communication avec l'utilisateur se fait en Français, mais le code, les variables et les commentaires sont exclusivement en Anglais.

## État Actuel
- Initialisation de Next.js App Router.
- Fichiers de configuration d'environnement prêts.
