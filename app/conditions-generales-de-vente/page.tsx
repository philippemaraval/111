import type { Metadata } from "next";

import { EditorialPage, EditorialSection } from "@/components/editorial-page";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente | 111 Marseille",
  description: "Conditions applicables aux commandes passées sur le site 111 Marseille."
};

export default function TermsPage() {
  return (
    <EditorialPage
      eyebrow="Conditions de vente"
      title="Commander en toute clarté."
      intro="Ces conditions résument les règles applicables aux achats effectués sur le site 111 par un consommateur."
    >
      <EditorialSection title="Produits et prix">
        <p>Les caractéristiques principales de chaque t-shirt sont présentées sur sa fiche. Les photographies et rendus cherchent à être fidèles, mais de légères variations de couleur peuvent apparaître selon l’écran ou la série de fabrication.</p>
        <p>Le prix de vente actuel est de 25 € par t-shirt, toutes taxes comprises lorsqu’elles sont applicables. Les frais de livraison sont indiqués séparément avant la validation de la commande.</p>
      </EditorialSection>

      <EditorialSection title="Commande et paiement">
        <p>La commande devient ferme après validation du paiement et envoi de la confirmation. 111 peut annuler une commande en cas d’indisponibilité, d’erreur manifeste de prix, de suspicion de fraude ou d’impossibilité d’exécution ; les sommes encaissées sont alors remboursées.</p>
        <p>Le paiement est traité par Stripe. 111 ne conserve pas les données complètes de votre carte bancaire.</p>
      </EditorialSection>

      <EditorialSection title="Livraison">
        <p>La livraison est facturée 4,99 €, à domicile ou en point relais Mondial Relay, quelle que soit la quantité commandée. Elle est offerte à partir de 60 € d’achat. Le client doit fournir les informations nécessaires et les vérifier avant paiement.</p>
        <p>En cas de difficulté, contactez <a className="font-bold text-sea" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> avec votre référence de commande.</p>
      </EditorialSection>

      <EditorialSection title="Rétractation, retours et garanties">
        <p>Le consommateur dispose du droit légal de rétractation de 14 jours à compter de la réception, sous réserve des exceptions prévues par la loi. Les modalités pratiques figurent sur la page Livraison, retours et remboursements.</p>
        <p>Les garanties légales de conformité et contre les vices cachés s’appliquent indépendamment de ce droit. En cas d’article erroné ou défectueux, contactez-nous avec des photographies permettant d’examiner la demande.</p>
      </EditorialSection>

      <EditorialSection title="Droit applicable et litiges">
        <p>Les présentes conditions sont soumises au droit français. En cas de différend, nous vous invitons à nous contacter en priorité afin de rechercher une solution amiable, sans priver le consommateur de ses droits ni des voies de recours prévues par la loi.</p>
      </EditorialSection>
    </EditorialPage>
  );
}
