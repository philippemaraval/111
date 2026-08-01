import Link from "next/link";
import { ArrowDownRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-10 lg:pt-7">
      <div className="grid min-h-[680px] overflow-hidden rounded-[28px] bg-sunburst lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative z-10 flex flex-col justify-between p-7 text-white sm:p-10 lg:p-14">
          <p className="reveal-up text-xs font-bold uppercase tracking-[0.24em] text-white/75">La ville sur le cœur</p>
          <div className="max-w-xl py-16 lg:py-20">
            <h1 className="reveal-up font-display text-[clamp(3.3rem,7vw,7.2rem)] font-black uppercase leading-[0.83] tracking-[-0.07em]">
              Porte ton quartier.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-7 text-white/90 sm:text-xl">
              111 raconte Marseille, un quartier après l’autre. Des t-shirts dessinés ici, inspirés par celles et ceux qui la font vivre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#carte" className="focus-ring inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-navy hover:bg-sun">
                Explorer les quartiers <ArrowDownRight className="h-4 w-4" />
              </Link>
              <Link href="#collection" className="focus-ring rounded-full border border-white/40 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10">
                Voir la collection
              </Link>
            </div>
          </div>
          <p className="text-sm font-medium text-white/70">Marseille · 43°17′N 5°22′E</p>
        </div>

        <div className="relative min-h-[520px] overflow-hidden bg-[#f3f3f3] lg:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/la-joliette-porte-dos.png" alt="T-shirt 111 La Joliette porté" className="h-full w-full object-contain object-center transition duration-700 hover:scale-[1.02]" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between rounded-2xl bg-white/90 p-4 backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sea">La collection 111</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-navy">5 quartiers disponibles</p>
            </div>
            <Link href="#collection" className="focus-ring rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-sea">Les découvrir</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
