import type { Metadata } from "next";
import { Heart, Map, PencilRuler, Shirt } from "lucide-react";

import { EditorialLink, EditorialPage, EditorialSection } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "L’histoire de 111 | Marseille, quartier par quartier",
  description: "Découvrez l’origine de 111, une marque marseillaise qui transforme l’identité des quartiers en images à porter."
};

const steps = [
  { icon: Map, title: "Observer", text: "Partir des lieux, des formes et des histoires qui rendent chaque quartier reconnaissable." },
  { icon: Heart, title: "Écouter", text: "Laisser les Marseillais voter pour les quartiers qu’ils veulent voir entrer dans la collection." },
  { icon: PencilRuler, title: "Dessiner", text: "Composer une image originale, lisible et fidèle à l’énergie du quartier, sans folklore facile." },
  { icon: Shirt, title: "Produire", text: "Lancer des séries courtes, au rythme de la demande réelle et avec une information de fabrication claire." }
];

export default function BrandStoryPage() {
  return (
    <EditorialPage
      eyebrow="L’histoire de la marque"
      title="Une ville. 111 façons de l’aimer."
      intro="111 est née d’une idée simple : Marseille ne se résume pas à une carte postale. Elle se raconte quartier par quartier, avec celles et ceux qui y vivent."
    >
      <EditorialSection kicker="Le point de départ" title="Pourquoi 111 ?">
        <p>Marseille est officiellement composée de 111 quartiers. Beaucoup sont d’anciens villages, avec leur place, leurs habitudes, leur relief et une manière bien à eux de dire la ville.</p>
        <p>Le projet 111 transforme cette mosaïque en une collection de t-shirts. Chaque édition part d’un territoire précis : un marché, une colline, une architecture, une mémoire industrielle ou un horizon sur la mer.</p>
      </EditorialSection>

      <EditorialSection kicker="Notre méthode" title="Du quartier au t-shirt">
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step) => (
            <article key={step.title} className="rounded-2xl bg-sand p-6 text-navy">
              <step.icon className="h-6 w-6 text-sea" />
              <h3 className="mt-5 text-xl font-black">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-navy/60">{step.text}</p>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection kicker="Le cap" title="Local, ouvert, vivant">
        <p>111 veut construire une collection qui ressemble à Marseille : contrastée, populaire, culturelle et solaire. Les cinq premières éditions ouvrent le chemin ; les suivantes seront guidées par les votes de la communauté.</p>
        <p>Nous avançons en séries courtes pour mieux ajuster la production et éviter d’accumuler des pièces sans histoire. Les informations de confection seront détaillées au fur et à mesure de chaque lancement.</p>
        <EditorialLink href="/#carte">Choisir le prochain quartier</EditorialLink>
      </EditorialSection>
    </EditorialPage>
  );
}
