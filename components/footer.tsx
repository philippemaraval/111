export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-navy text-foam">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-sun">Guide des tailles</p>
          <h2 className="font-display text-3xl">Coupe unisexe, tombé droit, esprit vintage.</h2>
          <p className="text-sm text-foam/70">
            S pour une coupe nette, M et L pour le porté classique, XL pour la silhouette ample.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-sun">Newsletter</p>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-foam/75">
              Recevoir les prochains drops, les alertes de stock et les nouvelles histoires de quartiers.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="votre@email.fr"
                className="rounded-full border border-white/15 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-foam/40"
              />
              <button className="rounded-full bg-sun px-5 py-3 text-sm font-semibold text-navy">
                S’inscrire
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-sun">Flux social</p>
          <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-foam/75">
              #111quartiersmarseille #lepanier #estaque #belsunce
            </p>
            <p className="text-sm text-foam/55">
              Des visuels rétro, des récits de quartier et la prochaine série activée par la communauté.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
