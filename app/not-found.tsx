import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 text-center">
      <div>
        <p className="section-kicker">Erreur 404</p>
        <h1 className="mt-4 text-5xl font-black uppercase leading-none tracking-[-0.05em] sm:text-7xl">Cette rue ne mène nulle part.</h1>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-navy/55">Le quartier demandé n’est pas encore sur notre carte. Marseille en a beaucoup d’autres à raconter.</p>
        <Link href="/#carte" className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full bg-sea px-6 py-4 text-sm font-bold text-white hover:bg-navy"><ArrowLeft className="h-4 w-4" /> Retour à la carte</Link>
      </div>
    </div>
  );
}
