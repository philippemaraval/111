# Finalisation externe avant les premières ventes

## 1. Supabase

Dans SQL Editor, exécuter dans cet ordre :

1. `supabase/migrations/008_order_fulfillment_and_safe_stock.sql`
2. `supabase/migrations/009_operations_rate_limits_and_tracking.sql`
3. `supabase/migrations/010_email_automation_queue.sql`
4. `supabase/migrations/011_fix_rate_limit_timestamp.sql`

Contrôler ensuite la présence de `order_events`, `api_rate_limits`, `stock_alerts`, `reviews`, `contact_messages` et `email_jobs`. La migration 009 active le rate limiting distribué et la migration 010 la file d’automatisation.

Dans Stripe, vérifier que le webhook de production écoute bien `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` et `charge.refunded`.

## 2. Variables Cloudflare

Ajouter `RATE_LIMIT_SALT` comme secret aléatoire long dans le Worker. Vérifier aussi que `NEXT_PUBLIC_SITE_URL` vaut l’URL canonique définitive dans l’environnement de build, pas seulement au runtime.

## 3. Commande réelle à 1 euro

Créer temporairement un code promotionnel Stripe limité à une utilisation permettant d’obtenir un total produit de 1 euro, sans modifier les prix publics. Effectuer une commande avec un e-mail contrôlé, puis vérifier :

- paiement et reçu Stripe ;
- ligne `orders` et `order_items` dans Supabase ;
- décrémentation de la bonne taille ;
- événement `paid` ;
- import et identifiant Sendcloud ;
- e-mail de suivi après création/annonce de l’envoi ;
- page `/suivi-commande` ;
- remboursement depuis l’administration ;
- événement `refunded` et remise en stock ;
- e-mail de remboursement Stripe.

## 4. Domaine et e-mail

Après choix du domaine : connecter le domaine au Worker Cloudflare, remplacer `NEXT_PUBLIC_SITE_URL`, autoriser l’URL dans Supabase Auth et Stripe, puis créer une adresse de contact sur ce domaine avec SPF, DKIM et DMARC. Mettre ensuite à jour `lib/site.ts`, Stripe et Sendcloud.

## 5. Données produit

Avant ouverture, renseigner les dimensions par taille, la composition, le grammage, les origines et techniques de fabrication confirmées par le fournisseur. Remplacer les rendus manquants par les photographies réelles sans créer de caractéristiques supposées.

## 6. Juridique

Choisir un médiateur de la consommation, ajouter ses coordonnées aux CGV, puis faire valider CGV, confidentialité, garanties, retours et transferts de données par un professionnel.

## 7. E-mails et automatisations

Les reçus/remboursements restent gérés par Stripe et le suivi par Sendcloud. Avant d’ajouter une relance panier ou une newsletter, choisir un outil, vérifier la base légale, fournir une désinscription et mettre à jour la politique de confidentialité.

La migration 010 met en file les notifications de contact, les retours en stock et les demandes d’avis après livraison. Pour conserver Gmail, créer un projet Google Apps Script avec `docs/google-apps-script-email.gs`, ajouter `EMAIL_AUTOMATION_TOKEN` dans ses propriétés de script, puis déployer le script comme application Web accessible à tous. Définir son URL dans `EMAIL_AUTOMATION_WEBHOOK_URL` et la même valeur secrète dans `EMAIL_AUTOMATION_TOKEN` côté Cloudflare. Le webhook reçoit les champs `token`, `id`, `type`, `to`, `subject`, `text` et `replyTo`. Les échecs sont conservés et peuvent être relancés depuis l’administration. Aucune relance panier ni newsletter n’est envoyée sans consentement explicite.
