import type { Metadata } from "next";

import { EditorialPage, EditorialSection } from "@/components/editorial-page";
import { CONTACT_EMAIL, LEGAL_INFORMATION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité | 111 Marseille",
  description: "Comment 111 collecte, utilise et protège vos données personnelles."
};

export default function PrivacyPage() {
  return (
    <EditorialPage
      eyebrow="Données personnelles"
      title="Votre confiance compte aussi."
      intro="Cette page explique quelles données sont utilisées par 111, pourquoi elles le sont et comment exercer vos droits."
    >
      <EditorialSection title="Responsable du traitement">
        <p>Le responsable du traitement est {LEGAL_INFORMATION.ownerName}, entrepreneur individuel exerçant sous le nom commercial {LEGAL_INFORMATION.tradeName}, au {LEGAL_INFORMATION.address}. Il peut être contacté à <a className="font-bold text-sea" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </EditorialSection>

      <EditorialSection title="Les données concernées">
        <p>Selon votre utilisation du site, nous pouvons traiter votre adresse e-mail lors d’un vote ou d’une prise de contact, ainsi que les informations nécessaires à une commande : identité, coordonnées de livraison, contenu du panier et références de paiement.</p>
        <p>Les données complètes de carte bancaire ne sont pas conservées par 111. Le paiement est pris en charge par notre prestataire de paiement sécurisé.</p>
      </EditorialSection>

      <EditorialSection title="Pourquoi nous les utilisons">
        <p>Les données de commande sont traitées pour exécuter le contrat, préparer la livraison et assurer le service après-vente. Certaines données sont ensuite conservées afin de respecter les obligations comptables et légales.</p>
        <p>La sécurité du site, la prévention de la fraude et la mesure d’audience non publicitaire reposent sur l’intérêt légitime de 111 à protéger et améliorer son service.</p>
        <p>Un vote permet également de vous informer si le quartier soutenu rejoint la collection. Il ne vous inscrit pas à la newsletter : les nouvelles générales de 111 ne sont envoyées que si vous avez coché séparément la case de consentement prévue à cet effet. Vous pouvez retirer ce consentement à tout moment.</p>
      </EditorialSection>

      <EditorialSection title="Prestataires et conservation">
        <p>Les données peuvent être transmises, dans la mesure nécessaire à leur mission, à Cloudflare pour l’hébergement, Supabase pour la base de données, Stripe pour le paiement, ainsi qu’à Sendcloud et Mondial Relay pour la livraison et son suivi.</p>
        <p>Les données nécessaires aux commandes et à la comptabilité sont conservées pendant la relation commerciale, puis archivées pendant 10 ans lorsque la réglementation comptable l’exige. Les données utilisées à des fins de prospection sont conservées jusqu’au retrait du consentement ou, au plus tard, pendant 3 ans après le dernier contact actif.</p>
        <p>Les demandes adressées au service client sont conservées pendant le temps nécessaire à leur traitement et à la défense des droits de 111. Le panier est mémorisé localement dans votre navigateur et peut être supprimé en vidant les données du site.</p>
        <p>Le site utilise Cloudflare Web Analytics afin de mesurer son audience et d’améliorer les pages consultées. Cette mesure est activée sans profil publicitaire et sans être utilisée pour suivre votre navigation sur d’autres sites.</p>
      </EditorialSection>

      <EditorialSection title="Vos droits">
        <p>Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de vos données, et vous opposer à certains traitements. Vous pouvez aussi retirer votre consentement lorsqu’il constitue la base du traitement.</p>
        <p>Pour exercer un droit, écrivez à <a className="font-bold text-sea" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Une preuve d’identité ne sera demandée qu’en cas de doute raisonnable sur l’auteur de la demande. Vous pouvez également saisir la CNIL.</p>
      </EditorialSection>
    </EditorialPage>
  );
}
