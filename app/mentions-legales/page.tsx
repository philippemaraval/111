import type { Metadata } from "next";

import { EditorialPage, EditorialSection } from "@/components/editorial-page";
import { CONTACT_EMAIL } from "@/lib/site";

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
        <p>Le site et la marque 111 sont édités par 111 Marseille, projet indépendant établi à Marseille, France.</p>
        <p>Contact : <a className="font-bold text-sea" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
        <p className="rounded-2xl bg-sand p-5 text-sm">Les informations administratives complètes de l’entreprise — forme juridique, adresse du siège, immatriculation et directeur de publication — seront ajoutées dès la finalisation de la structure commerciale et avant l’ouverture définitive des ventes.</p>
      </EditorialSection>

      <EditorialSection title="Hébergement et services techniques">
        <p>Le site est déployé sur l’infrastructure Cloudflare. Les fonctions de catalogue et de base de données peuvent s’appuyer sur Supabase ; les paiements sont traités par Stripe. Ces prestataires disposent de leurs propres conditions et politiques de sécurité.</p>
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
