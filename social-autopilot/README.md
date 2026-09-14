# 111 Social Autopilot

Worker Cloudflare séparé pour préparer des contenus 111, les soumettre à validation humaine, puis les programmer sur Instagram, TikTok et X via Buffer.

## Garde-fou principal

Le cron génère uniquement une proposition en attente. Seul le bouton **Valider & programmer** appelle Buffer.

Le tableau permet aussi de choisir librement le sujet (quartier, marque 111, Marseille ou autre), l'objectif et des consignes précises. Il permet ensuite de modifier les textes, le visuel, les plateformes et l'heure de Paris, prévisualiser chaque réseau, puis confirmer avant programmation. Les anciennes propositions peuvent être filtrées et dupliquées. Les statuts Buffer sont resynchronisés automatiquement par le cron ou manuellement depuis le tableau.

Une génération peut produire jusqu'à trois variantes aux angles distincts. Chaque variante comprend une légende et un texte alternatif Instagram, une idée de carrousel, un script et des incrustations TikTok, ainsi qu'une publication et un mini-thread X. Le premier visuel est partagé pour accélérer la génération, puis reste remplaçable séparément.

La bibliothèque éditoriale permet d'ajouter, modifier, enrichir, archiver et restaurer les fiches de référence. Au moment de programmer une proposition, chaque réseau dispose de ses propres formats et médias : publication, carrousel, Reel ou Story sur Instagram ; photo ou vidéo sur TikTok ; texte seul, image ou vidéo sur X.

## Secrets

- `BUFFER_API_KEY`
- `ADMIN_TOKEN`

Ils doivent être configurés avec `wrangler secret put` et ne doivent jamais être écrits dans un fichier.

## Déploiement

1. `npm install`
2. `npx wrangler d1 create 111-social`
3. Reporter l'identifiant D1 dans `wrangler.jsonc`.
4. `npx wrangler r2 bucket create 111-social-media`
5. Après le premier déploiement, renseigner son URL `workers.dev` dans `MEDIA_PUBLIC_BASE_URL`. Le Worker sert les médias publics sans exposer directement le bucket.
6. `npm run db:init`
7. `npx wrangler secret put BUFFER_API_KEY`
8. `npx wrangler secret put ADMIN_TOKEN`
9. `npm run deploy`

Pour une base créée avec la première version, appliquer dans l'ordre et une seule fois :

- `migrations/002_proposal_editing.sql`
- `migrations/003_generation_and_history.sql`
- `migrations/004_flexible_generation.sql`
- `migrations/005_content_library.sql`
- `migrations/006_multivariants_platform_content.sql`
- `migrations/007_platform_formats.sql`

La première validation réelle doit toujours être effectuée par le propriétaire depuis le dashboard.
