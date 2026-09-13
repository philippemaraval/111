import type { Metadata } from "next";
import { Ruler, Shirt } from "lucide-react";

import { EditorialLink, EditorialPage, EditorialSection } from "@/components/editorial-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guide des tailles | 111 Marseille",
  description: "Nos conseils pour choisir la bonne taille de t-shirt 111."
};

export default function SizeGuidePage() {
  return (
    <EditorialPage
      eyebrow="Guide des tailles"
      title="Bien choisir, bien porter."
      intro="Le modèle Fruit of the Loom Valueweight SC230 présente une coupe droite et tubulaire, sans coutures latérales. Pour choisir, comparez ses mesures avec un t-shirt que vous aimez déjà porter."
    >
      <EditorialSection kicker="La méthode" title="Mesurer en deux gestes">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-sand p-6">
            <Shirt className="h-6 w-6 text-sea" />
            <h3 className="mt-5 text-lg font-black">1. La largeur</h3>
            <p className="mt-2 text-sm leading-6">Posez le t-shirt à plat et mesurez d’une couture d’aisselle à l’autre, sans tirer sur le tissu.</p>
          </div>
          <div className="rounded-2xl bg-sand p-6">
            <Ruler className="h-6 w-6 text-sea" />
            <h3 className="mt-5 text-lg font-black">2. La longueur</h3>
            <p className="mt-2 text-sm leading-6">Mesurez depuis le point le plus haut de l’épaule jusqu’au bas du t-shirt.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <caption className="mb-3 text-left font-bold">Mesures du vêtement posé à plat, en centimètres</caption>
            <thead><tr className="border-b border-navy/15"><th className="py-3">Taille</th><th className="py-3">Largeur</th><th className="py-3">Longueur</th></tr></thead>
            <tbody>{[["S", "48,5", "69,5"], ["M", "53,5", "72"], ["L", "56", "74,5"], ["XL", "61", "77"]].map(([size, width, length]) => <tr key={size} className="border-b border-navy/10"><th className="py-3">{size}</th><td className="py-3">{width} cm</td><td className="py-3">{length} cm</td></tr>)}</tbody>
          </table>
        </div>
        <p>Le fabricant annonce une tolérance de 2,5 à 3 cm sur la largeur et la longueur, ainsi qu’une tolérance de rétrécissement de 5 %. Si vous êtes entre deux tailles, choisissez la plus petite pour un porté près du corps ou la plus grande pour davantage d’aisance.</p>
      </EditorialSection>

      <EditorialSection kicker="À retenir" title="Avant de commander">
        <p>Ne vous fiez pas uniquement à votre taille habituelle : les coupes changent d’une marque à l’autre. Comparez toujours les mesures du modèle avec un vêtement posé à plat.</p>
        <p>Votre t-shirt doit être essayé avec soin, sans être lavé ni porté à l’extérieur, si vous souhaitez conserver la possibilité de le retourner.</p>
        <EditorialLink href="/contact">Demander un conseil</EditorialLink>
      </EditorialSection>
    </EditorialPage>
  );
}
