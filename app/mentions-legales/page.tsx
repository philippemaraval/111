import type { Metadata } from "next";

import { EditorialPage, EditorialSection } from "@/components/editorial-page";
import { CONTACT_EMAIL, HOST_INFORMATION, LEGAL_INFORMATION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales | 111 Marseille",
  description: "Informations légales relatives au site 111 Marseille."
};

export default function LegalNoticePage() {
  return (
    <EditorialPage
      eyebrow="Informations légales"
      title="Mentions légales."
      intro="Les informations essentielles concernant l’édition, l’hébergement et l’utilisation du site 111."
    >
      <EditorialSection title="Édition du site">
        <p><strong>{LEGAL_INFORMATION.tradeName}</strong> est le nom commercial de l’entreprise individuelle de {LEGAL_INFORMATION.ownerName}, {LEGAL_INFORMATION.legalForm.toLowerCase()}.</p>
        <div className="rounded-2xl bg-sand p-5 text-sm leading-7 text-navy">
          <p>Adresse : {LEGAL_INFORMATION.address}</p>
          <p>SIREN : {LEGAL_INFORMATION.siren}</p>
          <p>SIRET : {LEGAL_INFORMATION.siret}</p>
          <p>Immatriculation : {LEGAL_INFORMATION.registration}</p>
          <p>{LEGAL_INFORMATION.vatNotice}</p>
        </div>
        <p>Email : <a className="font-bold text-sea" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />Téléphone : <a className="font-bold text-sea" href={`tel:${LEGAL_INFORMATION.phoneHref}`}>{LEGAL_INFORMATION.phoneDisplay}</a></p>
      </EditorialSection>

      <EditorialSection title="Direction de la publication">
        <p>Le directeur de la publication est {LEGAL_INFORMATION.ownerName}, en qualité d’entrepreneur individuel éditant le site.</p>
      </EditorialSection>

      <EditorialSection title="Hébergement">
        <p>Le site est hébergé par {HOST_INFORMATION.name}, {HOST_INFORMATION.address}.</p>
        <p>Téléphone : <a className="font-bold text-sea" href={`tel:${HOST_INFORMATION.phoneHref}`}>{HOST_INFORMATION.phoneDisplay}</a><br />Site : <a className="font-bold text-sea" href={HOST_INFORMATION.website} target="_blank" rel="noreferrer">{HOST_INFORMATION.website}</a></p>
      </EditorialSection>

      <EditorialSection title="Propriété intellectuelle">
        <p>La marque, le logo, les visuels de t-shirts, les textes, la direction artistique et les éléments graphiques du site sont protégés. Sauf autorisation écrite préalable, toute reproduction, adaptation ou exploitation commerciale, totale ou partielle, est interdite.</p>
        <p>Les noms géographiques et références patrimoniales restent naturellement attachés à Marseille et à son histoire ; leur présence ne vaut pas appropriation.</p>
      </EditorialSection>

      <EditorialSection title="Responsabilité">
        <p>111 s’efforce de maintenir des informations exactes et un service accessible. Une erreur, une interruption temporaire ou l’évolution d’un contenu ne saurait toutefois engager sa responsabilité au-delà des obligations prévues par la loi.</p>
        <p>Les liens externes sont fournis à titre pratique. 111 ne contrôle pas le contenu ni la disponibilité des sites tiers.</p>
      </EditorialSection>
    </EditorialPage>
  );
}
