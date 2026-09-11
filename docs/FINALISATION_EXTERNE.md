# Finalisation externe avant les premières ventes

## 1. Supabase

Dans SQL Editor, exécuter dans cet ordre :

1. `supabase/migrations/008_order_fulfillment_and_safe_stock.sql`
2. `supabase/migrations/009_operations_rate_limits_and_tracking.sql`

Contrôler ensuite la présence de `order_events`, `api_rate_limits`, `stock_alerts`, `reviews` et `contact_messages`. La migration 009 active le rate limiting distribué ; le déploiement ne doit pas être considéré complet avant son application.

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
