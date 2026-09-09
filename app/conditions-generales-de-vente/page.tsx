import type { Metadata } from "next";

import { EditorialPage, EditorialSection } from "@/components/editorial-page";
import { CONTACT_EMAIL, LEGAL_INFORMATION } from "@/lib/site";

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
      <EditorialSection title="Identité du vendeur">
        <p>Les produits sont vendus par {LEGAL_INFORMATION.ownerName}, entrepreneur individuel exerçant sous le nom commercial {LEGAL_INFORMATION.tradeName}, domicilié au {LEGAL_INFORMATION.address}.</p>
        <p>SIREN : {LEGAL_INFORMATION.siren} — SIRET : {LEGAL_INFORMATION.siret} — {LEGAL_INFORMATION.registration}.</p>
        <p>Contact : <a className="font-bold text-sea" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> — <a className="font-bold text-sea" href={`tel:${LEGAL_INFORMATION.phoneHref}`}>{LEGAL_INFORMATION.phoneDisplay}</a>.</p>
      </EditorialSection>

      <EditorialSection title="Produits et prix">
        <p>Les caractéristiques principales de chaque t-shirt sont présentées sur sa fiche. Les photographies et rendus cherchent à être fidèles, mais de légères variations de couleur peuvent apparaître selon l’écran ou la série de fabrication.</p>
        <p>Le t-shirt vendu à l’unité est actuellement proposé à 25 €. Les packs bénéficient des tarifs spécifiques affichés sur leur page et dans le panier. {LEGAL_INFORMATION.vatNotice}. Les frais de livraison sont indiqués séparément avant la validation de la commande.</p>
      </EditorialSection>

      <EditorialSection title="Commande et paiement">
        <p>La commande devient ferme après validation du paiement et envoi de la confirmation. 111 peut annuler une commande en cas d’indisponibilité, d’erreur manifeste de prix, de suspicion de fraude ou d’impossibilité d’exécution ; les sommes encaissées sont alors remboursées.</p>
        <p>Le paiement est traité par Stripe. 111 ne conserve pas les données complètes de votre carte bancaire.</p>
      </EditorialSection>

      <EditorialSection title="Livraison">
        <p>Pour toute commande inférieure à 60 €, la livraison est facturée 4,99 € en point relais Mondial Relay ou 7,99 € à domicile. À partir de 60 € d’achat, la livraison en point relais est offerte et la livraison à domicile est facturée 4,99 €. Le client doit fournir les informations nécessaires et les vérifier avant paiement.</p>
        <p>La commande est préparée sous 3 jours ouvrés. Le délai de livraison estimé est ensuite de 3 à 5 jours ouvrés à compter de l’expédition.</p>
        <p>En cas de difficulté, contactez <a className="font-bold text-sea" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> avec votre référence de commande.</p>
      </EditorialSection>

      <EditorialSection title="Rétractation, retours et garanties">
        <p>Le consommateur dispose du droit légal de rétractation de 14 jours à compter de la réception, sous réserve des exceptions prévues par la loi. Les modalités pratiques figurent sur la page Livraison, retours et remboursements.</p>
        <p>La décision de se rétracter doit être notifiée avant l’expiration de ce délai, au moyen du formulaire type disponible sur la page Livraison, retours et remboursements ou de toute déclaration dénuée d’ambiguïté. Le produit doit ensuite être renvoyé dans les 14 jours à {LEGAL_INFORMATION.address}. Les frais directs de retour restent à la charge du client, sauf erreur de préparation ou produit défectueux.</p>
        <p>Les garanties légales de conformité et contre les vices cachés s’appliquent indépendamment de ce droit et sans frais pour le consommateur. En cas d’article erroné ou défectueux, contactez-nous avec des photographies permettant d’examiner la demande.</p>
      </EditorialSection>

      <EditorialSection title="Droit applicable et litiges">
        <p>Les présentes conditions sont soumises au droit français. En cas de différend, nous vous invitons à nous contacter en priorité afin de rechercher une solution amiable, sans priver le consommateur de ses droits ni des voies de recours prévues par la loi.</p>
      </EditorialSection>
    </EditorialPage>
  );
}
