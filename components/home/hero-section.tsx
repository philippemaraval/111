export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[36px] bg-sunburst p-6 shadow-card md:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.32em] text-sea">
            Collection Marseille 111
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-display text-5xl leading-tight text-navy md:text-7xl">
              Des t-shirts qui racontent les 111 quartiers de Marseille.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-navy/75 md:text-lg">
              Un e-commerce solaire, rétro et communautaire. La carte vous guide, la communauté vote, chaque drop active un nouveau quartier.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#map"
              className="rounded-full bg-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            >
              Explorer la carte
            </a>
            <a
              href="#catalogue"
              className="rounded-full border border-navy/10 bg-white/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-navy"
            >
              Voir les drops
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Arrondissements", value: "16", accent: "bg-sea" },
            { label: "Quartiers en ligne", value: "111 capsules", accent: "bg-terracotta" },
            { label: "Votes communauté", value: "Drops activés par email", accent: "bg-olive" },
            { label: "Style", value: "Solaire + rétro + authentique", accent: "bg-navy" }
          ].map((item) => (
            <div key={item.label} className="rounded-[28px] border border-white/40 bg-white/65 p-5 shadow-soft backdrop-blur-sm">
              <span className={`mb-4 block h-2 w-16 rounded-full ${item.accent}`} />
              <p className="text-xs uppercase tracking-[0.22em] text-sea">{item.label}</p>
              <p className="mt-4 font-display text-3xl text-navy">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
