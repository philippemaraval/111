import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

import { EditorialLink, EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "F.A.Q. | 111 Marseille",
  description: "Prix, tailles, votes, livraison et retours : les réponses aux questions fréquentes sur 111."
};

const questions = [
  ["Pourquoi la marque s’appelle-t-elle 111 ?", "Marseille compte officiellement 111 quartiers. La collection a vocation à les raconter un par un, à travers des visuels inspirés de leur histoire, de leur géographie et de leur quotidien."],
  ["Quel est le prix d’un t-shirt ?", "Tous les t-shirts 111 sont proposés au même prix : 25 €, quel que soit le quartier disponible."],
  ["Quels quartiers sont déjà disponibles ?", "La Joliette, Notre-Dame-du-Mont, Sainte-Anne, Cinq-Avenues et Mazargues constituent la collection actuellement disponible."],
  ["Comment fonctionne le vote ?", "Chaque quartier non disponible possède son propre compteur. Un vote par adresse e-mail et par quartier est enregistré ; le classement nous aide à décider quels visuels développer ensuite."],
  ["Voter m’oblige-t-il à acheter ?", "Non. Le vote est gratuit et sans obligation d’achat. Il sert uniquement à mesurer l’intérêt pour une future édition et à vous prévenir si elle voit le jour."],
  ["Comment choisir ma taille ?", "Consultez le guide des tailles et comparez les mesures avec un t-shirt que vous portez déjà. En cas d’hésitation, écrivez-nous avant de commander."],
  ["Où les t-shirts sont-ils fabriqués ?", "111 privilégie des séries courtes et une démarche locale pour la création. Les informations précises de confection et de marquage accompagnent chaque édition dès qu’elles sont confirmées."],
  ["Quels sont les délais de livraison ?", "La commande est préparée sous 3 jours ouvrés, puis livrée sous 3 à 5 jours ouvrés après son expédition."],
  ["Comment suivre ma commande ?", "Le lien de suivi est transmis par e-mail dès la remise du colis au transporteur."],
  ["Puis-je retourner un t-shirt ?", "Oui, vous disposez du délai légal de rétractation de 14 jours après réception. Le produit doit être non porté, non lavé et retourné dans un état permettant sa remise en vente."],
  ["Comment entretenir mon t-shirt ?", "Lavez-le à 30 °C sur l’envers, avec des couleurs similaires. Évitez le sèche-linge et repassez-le également sur l’envers afin de préserver le visuel."],
  ["Une taille épuisée reviendra-t-elle ?", "Les collections sont produites en séries courtes. Un réassort dépend de la demande et des possibilités de production ; suivez 111 sur les réseaux pour les annonces."],
  ["Je souhaite proposer une collaboration, comment faire ?", "Écrivez-nous depuis la page Contact en présentant brièvement votre projet, votre lien avec Marseille et le calendrier envisagé."]
];

export default function FaqPage() {
  return (
    <EditorialPage
      eyebrow="F.A.Q."
      title="Tout ce qu’il faut savoir."
      intro="La collection, les votes, les tailles et les commandes : les réponses essentielles sont réunies ici."
    >
      <div className="space-y-3">
        {questions.map(([question, answer]) => (
          <details key={question} className="group rounded-2xl border border-navy/10 bg-white p-5 open:bg-sand sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-black text-navy sm:text-lg">
              {question}<ChevronDown className="h-5 w-5 shrink-0 text-sea transition group-open:rotate-180" />
            </summary>
            <p className="max-w-3xl pt-4 text-sm leading-7 text-navy/60 sm:text-base">{answer}</p>
          </details>
        ))}
      </div>
      <div className="mt-12 rounded-3xl bg-sun p-7 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-10">
        <div><p className="section-kicker !text-navy/55">Une autre question ?</p><p className="mt-2 text-2xl font-black text-navy">On vous répond directement.</p></div>
        <div className="mt-6 sm:mt-0"><EditorialLink href="/contact">Nous contacter</EditorialLink></div>
      </div>
    </EditorialPage>
  );
}
