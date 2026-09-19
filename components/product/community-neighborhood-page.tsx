import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, Heart, Trophy } from "lucide-react";

import { VoteForm } from "@/components/product/vote-form";
import type { Neighborhood } from "@/lib/types";

type CommunityNeighborhoodPageProps = {
  neighborhood: Neighborhood;
  rank: number | null;
  nextRank: number | null;
};

export function CommunityNeighborhoodPage({ neighborhood, rank, nextRank }: CommunityNeighborhoodPageProps) {
  const isProject = neighborhood.catalogStatus === "project";

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-10">
        <Link href="/#carte" className="focus-ring inline-flex items-center gap-2 rounded-full py-2 text-xs font-bold uppercase tracking-[0.16em] text-navy/55 hover:text-sea">
          <ArrowLeft className="h-4 w-4" /> Retour aux votes
        </Link>
      </div>

      <section className="mx-auto grid max-w-[1180px] gap-6 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-10">
        <div className={`flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[28px] p-7 sm:p-10 lg:p-12 ${isProject ? "bg-ochre text-navy" : "bg-navy text-white"}`}>
          <div className="flex items-center justify-between gap-4">
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isProject ? "text-navy/60" : "text-sea"}`}>
              111 · {neighborhood.arrondissement}<sup>e</sup> arrondissement
            </p>
            <span className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${isProject ? "bg-white/70 text-navy" : "bg-white/10 text-sun"}`}>
              {isProject ? "En préparation" : "Votes ouverts"}
            </span>
          </div>

          <div className="py-12">
            <p className={`text-sm font-bold uppercase tracking-[0.2em] ${isProject ? "text-navy/55" : "text-white/45"}`}>
              {isProject ? "Demande entendue" : rank ? `${rank}${rank === 1 ? "er" : "e"} du classement` : "À faire entrer au classement"}
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.055em] sm:text-7xl">{neighborhood.name}</h1>
            <p className={`mt-7 max-w-2xl text-lg leading-8 ${isProject ? "text-navy/70" : "text-white/65"}`}>
              {isProject
                ? "Le tee‑shirt de ce quartier est déjà dans les cartons. Les votes sont fermés : notre équipe travaille maintenant à sa sortie."
                : "Plus ce quartier rassemble de votes, plus notre équipe aura la pression pour imaginer et sortir son tee‑shirt rapidement."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${isProject ? "bg-white/65" : "bg-white/10"}`}>
              {isProject ? <Clock3 className="h-4 w-4" /> : <Heart className="h-4 w-4 text-terracotta" />}
              {isProject ? "Création en cours" : `${neighborhood.voteCount} vote${neighborhood.voteCount === 1 ? "" : "s"}`}
            </span>
            {!isProject && rank && (
              <span className="inline-flex items-center gap-2 rounded-full bg-sun px-4 py-2 text-sm font-bold text-navy"><Trophy className="h-4 w-4" /> Place n° {rank}</span>
            )}
          </div>
        </div>

        <aside className="flex flex-col justify-center rounded-[28px] border border-navy/10 bg-white p-5 sm:p-8 lg:p-10">
          {isProject ? (
            <div>
              <p className="section-kicker">La suite</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.035em]">Plus besoin de voter : ce quartier est déjà prévu.</h2>
              <p className="mt-4 leading-7 text-navy/60">Dès que le dessin et la production seront prêts, sa fiche complète rejoindra la collection avec les vrais visuels, les tailles et le prix.</p>
              <Link href="/#collection" className="focus-ring mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-4 text-sm font-bold text-white hover:bg-sea">
                Voir les tee‑shirts disponibles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <p className="section-kicker mb-4">Mets la pression à l’équipe</p>
              <VoteForm
                neighborhoodId={neighborhood.id}
                neighborhoodName={neighborhood.name}
                voteCount={neighborhood.voteCount}
                rank={rank}
                nextRank={nextRank}
              />
              <Link href="/#classement" className="focus-ring mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-navy/10 px-5 py-3 text-sm font-bold hover:border-sea hover:text-sea">
                Voir le classement complet <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </aside>
      </section>
    </div>
  );
}
