# Session Log: 2026-04-24 18:42 - INITIALISATION DU PROJET

## Objectif
Créer la base d'un site web client (g-aura-tm-events) en assurant une séparation stricte des accès Vercel, Supabase et GitHub.

## Hypothèses et Contraintes
- Le système global de la machine est déjà logué sur des comptes d'agence/personnels.
- Les actions directes via CLI risquent de modifier le compte global.
- Il faut donc utiliser des tokens explicites pour chaque service.

## Actions Réalisées
- Rédaction du `implementation_plan.md` détaillant la stratégie de tokens.
- Création du fichier `MEMORY.md`.
- Création de la structure `.env.example` et `.env.local` pour stocker de manière sécurisée (hors version control) les tokens du client.

## Prochaines Étapes
- Attendre que le client remplisse ses tokens dans `.env.local`.
- Obtenir le choix de framework pour initialiser le projet.
- Donner le bloc JSON pour l'ajout du MCP Supabase.
