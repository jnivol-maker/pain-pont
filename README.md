# Paint Pont

Site de réservation hebdomadaire, avec stocks partagés et espace administrateur PIN.

## Configuration
Les identifiants publics Supabase sont déjà renseignés dans `.env.example`. Copie-le en `.env` si tu veux lancer en local.

```bash
npm install
npm run dev
```

## Déploiement
1. Importe ce dépôt dans Render Static Sites.
2. Build command : `npm run build`
3. Build output directory : `dist`
4. Ajoute les variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PIN_FUNCTION` depuis `.env.example`.

## Administration
Ouvrir « Administration » et saisir le PIN communiqué séparément.
Le PIN est validé par l'Edge Function `admin-pin`. Les actions d'administration transitent par cette fonction, jamais directement par la clé secrète dans le navigateur.

## Important
- Les paiements sont des virements manuels.
- Le site bloque les doubles réservations par numéro de téléphone pour une semaine.
- Le stock est décrémenté de façon atomique côté base de données.
- Le compte bancaire affiché est celui fourni pour le projet.
