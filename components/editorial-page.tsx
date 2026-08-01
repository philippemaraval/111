import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export function EditorialPage({
  eyebrow,
  title,
  intro,
  children
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="pb-16">
      <section className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[28px] bg-navy px-6 py-14 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sea/25 blur-3xl" />
          <div className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-sun/15 blur-3xl" />
          <div className="relative max-w-4xl">
            <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-full text-xs font-bold uppercase tracking-[0.16em] text-white/55 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Retour à l’accueil
            </Link>
            <p className="mt-12 text-xs font-bold uppercase tracking-[0.24em] text-sun">{eyebrow}</p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] sm:text-7xl lg:text-8xl">{title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">{intro}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        {children}
      </div>
    </div>
  );
}

export function EditorialSection({
  kicker,
  title,
  children
}: {
  kicker?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-navy/10 py-12 first:border-0 first:pt-0 sm:py-16">
      <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
        <div>
          {kicker && <p className="section-kicker">{kicker}</p>}
          <h2 className="mt-3 text-3xl font-black uppercase leading-none tracking-[-0.04em] sm:text-4xl">{title}</h2>
        </div>
        <div className="space-y-5 text-base leading-8 text-navy/65">{children}</div>
      </div>
    </section>
  );
}

export function EditorialLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white hover:bg-sea">
      {children} <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}
