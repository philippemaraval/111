import type { Metadata } from "next";
import { Clock3, Mail, MessageCircle, PackageSearch } from "lucide-react";

import { EditorialLink, EditorialPage, EditorialSection } from "@/components/editorial-page";
import { CONTACT_EMAIL, socialLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | 111 Marseille",
  description: "Une question sur une commande, un quartier ou le projet 111 ? Contactez-nous."
};

export default function ContactPage() {
  return (
    <EditorialPage
      eyebrow="Contact"
      title="On se parle ?"
      intro="Une question sur une taille, une commande, un quartier ou une collaboration ? Écrivez-nous, nous vous répondrons simplement et sans détour."
    >
      <EditorialSection kicker="Nous écrire" title="Le chemin le plus court">
        <div className="rounded-3xl bg-sand p-6 sm:p-8">
          <Mail className="h-7 w-7 text-sea" />
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-navy/45">Adresse e-mail</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="focus-ring mt-2 inline-block rounded text-2xl font-black text-navy hover:text-sea sm:text-3xl">{CONTACT_EMAIL}</a>
          <p className="mt-4 flex items-center gap-2 text-sm text-navy/55"><Clock3 className="h-4 w-4" /> Réponse habituelle sous deux jours ouvrés.</p>
        </div>
      </EditorialSection>

      <EditorialSection kicker="Pour aller plus vite" title="Précisez votre demande">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-navy/10 p-6">
            <PackageSearch className="h-6 w-6 text-terracotta" />
            <h3 className="mt-4 text-lg font-black text-navy">Une commande</h3>
            <p className="mt-2 text-sm leading-6">Indiquez votre numéro de commande et l’adresse e-mail utilisée lors de l’achat.</p>
          </div>
          <div className="rounded-2xl border border-navy/10 p-6">
            <MessageCircle className="h-6 w-6 text-terracotta" />
            <h3 className="mt-4 text-lg font-black text-navy">Un projet</h3>
            <p className="mt-2 text-sm leading-6">Présentez en quelques lignes le quartier, l’événement ou la collaboration que vous imaginez.</p>
          </div>
        </div>
        <EditorialLink href="/faq">Consulter d’abord la F.A.Q.</EditorialLink>
      </EditorialSection>

      <EditorialSection kicker="Réseaux sociaux" title="Retrouver 111">
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="focus-ring rounded-full border border-navy/15 px-5 py-3 text-sm font-bold text-navy hover:border-sea hover:text-sea">{social.label}{social.handle ? ` · ${social.handle}` : ""}</a>
          ))}
        </div>
      </EditorialSection>
    </EditorialPage>
  );
}
