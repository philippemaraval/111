import type { Metadata } from "next";
import { CheckCircle2, PackageCheck, RefreshCcw, Truck } from "lucide-react";

import { EditorialLink, EditorialPage, EditorialSection } from "@/components/editorial-page";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Livraison, retours et remboursements | 111 Marseille",
  description: "Délais, suivi, droit de rétractation et remboursement des commandes 111."
};

export default function ShippingReturnsPage() {
  return (
    <EditorialPage
      eyebrow="Livraison & retours"
      title="Clair avant, pendant et après."
      intro="Voici les règles appliquées aux commandes 111, de leur préparation jusqu’à un éventuel retour."
    >
      <div className="mb-14 grid gap-4 sm:grid-cols-3">
        {[
          { icon: PackageCheck, title: "Préparation soignée", text: "Chaque pièce est contrôlée avant son départ." },
          { icon: Truck, title: "Envoi suivi", text: "Le mode et le délai estimé sont indiqués à la commande." },
          { icon: RefreshCcw, title: "14 jours", text: "Le délai légal pour nous notifier votre rétractation." }
        ].map((item) => (
          <article key={item.title} className="rounded-2xl bg-sand p-6">
            <item.icon className="h-6 w-6 text-sea" />
            <h2 className="mt-5 text-lg font-black">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-navy/60">{item.text}</p>
          </article>
        ))}
      </div>

      <EditorialSection kicker="Expédition" title="Préparation et livraison">
        <p>Les options de livraison, leur prix et leur délai estimatif sont affichés avant le paiement. Dès que le colis est confié au transporteur, un message de confirmation est envoyé à l’adresse utilisée lors de la commande.</p>
        <p>En cas de retard inhabituel, de colis indiqué comme livré mais introuvable ou d’adresse erronée, contactez-nous à <a className="font-bold text-sea" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> avec votre numéro de commande.</p>
      </EditorialSection>

      <EditorialSection kicker="Rétractation" title="Changer d’avis">
        <p>Vous disposez de 14 jours à compter de la réception de votre commande pour nous informer clairement de votre décision de vous rétracter. Vous n’avez pas à justifier votre choix.</p>
        <p>Après cette notification, le produit doit être renvoyé au plus tard dans les 14 jours suivants. Sauf erreur de préparation ou article défectueux, les frais de retour restent à votre charge.</p>
        <div className="rounded-2xl border border-olive/20 bg-olive/5 p-5 text-sm text-navy">
          <p className="flex items-start gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-olive" /> Le t-shirt doit être non porté, non lavé, sans odeur ni détérioration, et retourné avec ses éventuels éléments d’origine.</p>
        </div>
      </EditorialSection>

      <EditorialSection kicker="Remboursement" title="Une procédure simple">
        <p>Après réception et contrôle du retour, le remboursement est effectué avec le même moyen de paiement que celui utilisé lors de l’achat, sauf accord exprès pour une autre solution sans frais supplémentaires.</p>
        <p>Le remboursement comprend le prix du produit et, dans les conditions prévues par la loi, les frais de livraison standard initiaux. Il peut être différé jusqu’à récupération du bien ou réception d’une preuve d’expédition.</p>
        <EditorialLink href={`mailto:${CONTACT_EMAIL}?subject=Retour%20de%20commande%20111`}>Demander un retour</EditorialLink>
      </EditorialSection>

      <EditorialSection kicker="Erreur ou défaut" title="Nous prenons le relais">
        <p>Si vous recevez le mauvais article ou constatez un défaut, écrivez-nous rapidement avec votre numéro de commande et des photos nettes. Après vérification, nous vous proposerons une solution adaptée sans vous faire supporter les frais liés à notre erreur.</p>
      </EditorialSection>
    </EditorialPage>
  );
}
