import Link from "next/link";
import { Facebook, Instagram, MapPin, Music2, Sparkles, Users } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { socialLinks } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 bg-navy text-white">
      <div className="overflow-hidden border-b border-white/10 py-4">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap text-xs font-bold uppercase tracking-[0.22em] text-sun">
          {[0, 1].map((group) => (
            <div key={group} className="flex gap-10" aria-hidden={group === 1}>
              <span>111 quartiers</span><span>Une seule ville</span><span>Créé à Marseille</span><span>Séries courtes</span><span>Marseille rayonne</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.9fr_0.9fr] lg:px-10">
        <div className="max-w-md">
          <LogoMark className="h-16 w-16 text-sea" />
          <h2 className="mt-6 text-3xl font-black leading-tight">Marseille se porte fièrement.</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">Une collection locale qui met les histoires, les accents et les couleurs de nos quartiers au premier plan.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sun">Explorer</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/75">
            <Link href="/#collection" className="hover:text-white">La collection</Link>
            <Link href="/#carte" className="hover:text-white">La carte des quartiers</Link>
            <Link href="/histoire" className="hover:text-white">Histoire de la marque</Link>
            <Link href="/cart" className="hover:text-white">Mon panier</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sun">Besoin d’aide</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/75">
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/faq" className="hover:text-white">F.A.Q.</Link>
            <Link href="/guide-des-tailles" className="hover:text-white">Guide des tailles</Link>
            <Link href="/livraison-retours" className="hover:text-white">Livraison, retours & remboursements</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sun">Informations</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/75">
            <Link href="/conditions-generales-de-vente" className="hover:text-white">Conditions de vente</Link>
            <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
            <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-6 border-t border-white/10 px-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center lg:px-10">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/40">
          <p>© 2026 — 111 Marseille</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sea" /> Imaginé à Marseille</p>
          <p className="hidden items-center gap-2 lg:flex"><Sparkles className="h-4 w-4 text-sea" /> Séries courtes</p>
          <p className="hidden items-center gap-2 xl:flex"><Users className="h-4 w-4 text-sea" /> Les habitants choisissent la suite</p>
        </div>
        <div className="flex items-center gap-2" aria-label="Réseaux sociaux">
          {[
            { ...socialLinks[0], icon: Instagram },
            { ...socialLinks[1], icon: Facebook },
            { ...socialLinks[2], icon: Music2 }
          ].map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/65 hover:border-sea hover:text-white">
              <social.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
