import type { Metadata } from "next";

import { EditorialPage, EditorialSection } from "@/components/editorial-page";
import { CONTACT_EMAIL } from "@/lib/site";

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
      <EditorialSection title="Les données concernées">
        <p>Selon votre utilisation du site, nous pouvons traiter votre adresse e-mail lors d’un vote ou d’une prise de contact, ainsi que les informations nécessaires à une commande : identité, coordonnées de livraison, contenu du panier et références de paiement.</p>
        <p>Les données complètes de carte bancaire ne sont pas conservées par 111. Le paiement est pris en charge par notre prestataire de paiement sécurisé.</p>
      </EditorialSection>

      <EditorialSection title="Pourquoi nous les utilisons">
        <p>Ces informations servent à enregistrer les votes, préparer et suivre les commandes, répondre aux demandes, prévenir la fraude et respecter nos obligations comptables et légales.</p>
        <p>Un vote permet également de vous informer si le quartier soutenu rejoint la collection. Il ne vous inscrit pas à la newsletter : les nouvelles générales de 111 ne sont envoyées que si vous avez coché séparément la case de consentement prévue à cet effet. Vous pouvez retirer ce consentement à tout moment.</p>
      </EditorialSection>

      <EditorialSection title="Prestataires et conservation">
        <p>Les données peuvent être traitées par les services nécessaires au fonctionnement du site, notamment l’hébergement, la base de données, le paiement et la livraison. Chacun n’y accède que dans la mesure nécessaire à sa mission.</p>
        <p>Les informations sont conservées pendant la durée utile au service demandé, puis archivées ou supprimées conformément aux obligations applicables. Le panier peut être mémorisé localement dans votre navigateur afin de rester disponible entre deux visites.</p>
        <p>Le site utilise Cloudflare Web Analytics afin de mesurer son audience et d’améliorer les pages consultées. Cette mesure est activée sans profil publicitaire et sans être utilisée pour suivre votre navigation sur d’autres sites.</p>
      </EditorialSection>

      <EditorialSection title="Vos droits">
        <p>Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de vos données, et vous opposer à certains traitements. Vous pouvez aussi retirer votre consentement lorsqu’il constitue la base du traitement.</p>
        <p>Pour exercer un droit, écrivez à <a className="font-bold text-sea" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Une preuve d’identité ne sera demandée qu’en cas de doute raisonnable sur l’auteur de la demande. Vous pouvez également saisir la CNIL.</p>
      </EditorialSection>
    </EditorialPage>
  );
}
