import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-xl rounded-[32px] border border-navy/10 bg-white/70 p-8 text-center shadow-card backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-sea">Quartier introuvable</p>
        <h1 className="mt-4 font-display text-5xl text-navy">Cette rue ne mène nulle part.</h1>
        <p className="mt-4 text-base text-navy/70">
          Le produit demandé n’existe pas encore ou n’a pas été publié dans la collection.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-medium text-white"
        >
          Retour à la carte
        </Link>
      </div>
    </div>
  );
}
