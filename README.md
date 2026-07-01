# Penalty Rush

MVP mobile-first de tirs au but construit avec Phaser 3, TypeScript, Vite et PWA.

## Démarrage

```bash
npm install
npm run dev
```

Le jeu fonctionne sans backend avec un classement local. Pour activer Supabase :

1. Exécuter `supabase/schema.sql` dans le SQL Editor du projet Supabase.
2. Copier `.env.example` vers `.env`.
3. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.

## Vérification PWA

Le service worker est produit uniquement sur un build de production :

```bash
npm run build
npm run preview
```
