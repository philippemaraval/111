import type { Metadata } from "next";
import { Ruler, Shirt } from "lucide-react";

import { EditorialLink, EditorialPage, EditorialSection } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Guide des tailles | 111 Marseille",
  description: "Nos conseils pour choisir la bonne taille de t-shirt 111."
};

export default function SizeGuidePage() {
  return (
    <EditorialPage
      eyebrow="Guide des tailles"
      title="Bien choisir, bien porter."
      intro="La coupe est unisexe et droite. Pour trouver la taille qui vous convient, le plus fiable reste de comparer avec un t-shirt que vous aimez déjà porter."
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
        <p>Les mesures exactes peuvent légèrement varier selon la série et seront indiquées sur chaque fiche dès la production confirmée. Si vous êtes entre deux tailles, choisissez la plus petite pour un porté près du corps ou la plus grande pour davantage d’aisance.</p>
      </EditorialSection>

      <EditorialSection kicker="À retenir" title="Avant de commander">
        <p>Ne vous fiez pas uniquement à votre taille habituelle : les coupes changent d’une marque à l’autre. Comparez toujours les mesures du modèle avec un vêtement posé à plat.</p>
        <p>Votre t-shirt doit être essayé avec soin, sans être lavé ni porté à l’extérieur, si vous souhaitez conserver la possibilité de le retourner.</p>
        <EditorialLink href="/contact">Demander un conseil</EditorialLink>
      </EditorialSection>
    </EditorialPage>
  );
}
