# Marseille 111

Application e-commerce SSR en `Next.js App Router` pour une marque de t-shirts dédiée aux 111 quartiers de Marseille.

## Stack

- `Next.js` + `TypeScript` + `Tailwind CSS`
- `Supabase` pour le catalogue, les votes email, le dashboard admin et le suivi des commandes
- `Stripe` pour le checkout
- Déploiement prévu via `GitHub` vers `Cloudflare` pour le front SSR et `Render` pour les fonctions/API si `RENDER_API_URL` est renseigné

## Fonctionnalités livrées

- Home SSR avec hero, carte macro/micro des 16 arrondissements, filtres et catalogue
- Recherche prédictive en header
- Route dynamique [`/quartier/[slug]`](/Users/philippemaraval/Documents/Marseille/111/app/quartier/[slug]/page.tsx)
- Produits `coming soon` avec vote email
- Panier persistant en drawer + page `/cart`
- Checkout Stripe via [`/api/checkout`](/Users/philippemaraval/Documents/Marseille/111/app/api/checkout/route.ts)
- Webhook Stripe via [`/api/stripe/webhook`](/Users/philippemaraval/Documents/Marseille/111/app/api/stripe/webhook/route.ts)
- Dashboard admin sécurisé par Supabase Auth + `ADMIN_EMAILS`
- Export CSV des votes
- Mode démo automatique quand Supabase / Stripe ne sont pas encore configurés

## Variables d’environnement

Copier [`.env.example`](/Users/philippemaraval/Documents/Marseille/111/.env.example) vers `.env.local` puis renseigner :

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `ADMIN_EMAILS`
- `RENDER_API_URL`

## Base Supabase

La migration initiale est dans [`supabase/migrations/001_init.sql`](/Users/philippemaraval/Documents/Marseille/111/supabase/migrations/001_init.sql).

Elle crée :

- `neighborhoods`
- `votes`
- `orders`
- `order_items`
- la vue `neighborhood_metrics`

## Développement local

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Déploiement

### Cloudflare Workers

L’application est SSR. Il faut la déployer sur **Cloudflare Workers** avec OpenNext.

Scripts utiles :

```bash
npm run build:cf
npm run preview
npm run deploy
```

Dans Cloudflare Workers Builds :

- `Build command`: `npm run build:cf`
- `Deploy command`: `npx wrangler deploy`
- `Root directory`: vide

Le build génère `.open-next/worker.js`, ensuite utilisé par [`wrangler.jsonc`](/Users/philippemaraval/Documents/Marseille/111/wrangler.jsonc).

### Render

- Utiliser [`render.yaml`](/Users/philippemaraval/Documents/Marseille/111/render.yaml) pour provisionner un service Node
- Pointer `RENDER_API_URL` du front vers l’URL Render si vous voulez déporter le checkout ou les webhooks

## Notes d’architecture

- Les requêtes catalogue utilisent SSR via la couche [`lib/neighborhoods.ts`](/Users/philippemaraval/Documents/Marseille/111/lib/neighborhoods.ts)
- Quand Supabase n’est pas configuré, le storefront continue de fonctionner avec des données mockées
- Les ventes ne comptent dans la popularité qu’après confirmation `paid` du webhook Stripe
