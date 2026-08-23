"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PRODUCT_RANGE_COLORS } from "@ioma/config";
import { ArrowRight } from "lucide-react";

const RANGES_DATA = [
  {
    key: "hydra",
    num: "1",
    name: "Hydra",
    color: PRODUCT_RANGE_COLORS.hydra,
    tagline: "Hydratation Durable",
    desc: "Recharge en eau et renforce le film protecteur des peaux assoiffées.",
    heroProduct: "Sérum Hydratant Optimum",
    image: "/images/products/serum-hydratant-optimum-1.jpg",
  },
  {
    key: "energize",
    num: "2",
    name: "Energize",
    color: PRODUCT_RANGE_COLORS.energize,
    tagline: "Éclat & Vitalité",
    desc: "Réveille le teint terne et neutralise les méfaits du stress urbain.",
    heroProduct: "Vitality Shot",
    image: "/images/products/vitality-shot-1.jpg",
  },
  {
    key: "renew",
    num: "3",
    name: "Renew",
    color: PRODUCT_RANGE_COLORS.renew,
    tagline: "Fermeté & Anti-Âge",
    desc: "Active la régénération cellulaire et lisse visiblement les rides.",
    heroProduct: "Crème Sublime Revitalisante",
    image: "/images/products/creme-sublime-revitalisante-1.jpg",
  },
  {
    key: "calm",
    num: "4",
    name: "Calm",
    color: PRODUCT_RANGE_COLORS.calm,
    tagline: "Confort & Apaisement",
    desc: "Soulage immédiatement les rougeurs et sensations d'inconfort.",
    heroProduct: "Crème Apaisante Jour & Nuit",
    image: "/images/products/creme-apaisante-jour-et-nuit-1.jpg",
  },
  {
    key: "purete",
    num: "5",
    name: "Pureté",
    color: PRODUCT_RANGE_COLORS.purete,
    tagline: "Clarté & Détox",
    desc: "Purifie en profondeur, affine le grain de peau et résorbe les imperfections.",
    heroProduct: "Gel Réparateur Jour & Nuit",
    image: "/images/products/gel-reparateur-jour-et-nuit-1.jpg",
  },
  {
    key: "matte",
    num: "6",
    name: "Matte",
    color: PRODUCT_RANGE_COLORS.matte,
    tagline: "Matité & Pores",
    desc: "Régule la production de sébum et offre un fini velouté durable.",
    heroProduct: "Crème Régulatrice Matifiante",
    image: "/images/products/creme-regulatrice-matifiante-jour-et-nuit-1.jpg",
  },
  {
    key: "illumine",
    num: "7",
    name: "Illumine",
    color: PRODUCT_RANGE_COLORS.illumine,
    tagline: "Taches & Lumière",
    desc: "Unifie le teint, estompe les taches et protège contre les rayons UV.",
    heroProduct: "Cell Protector SPF50+",
    image: "/images/products/cell-protector-spf-50-pa-1.jpg",
  },
];

export function RangesShowcase() {
  return (
    <section className="py-24 max-w-[1440px] mx-auto px-4 md:px-6">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Nos 7 Gammes Expertes
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-foreground mt-2">
          Sept réponses ciblées à chaque besoin de la peau
        </h2>
        <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
          Chaque gamme IOMA Paris est identifiée par un code couleur officiel et concentre
          des actifs purs aux concentrations cliniquement prouvées.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {RANGES_DATA.map((r) => (
          <Link
            key={r.key}
            href={`/shop?range=${r.key}`}
            className="group flex flex-col justify-between rounded-sm border border-border/70 bg-card p-5 transition-all duration-300 hover:shadow-lg hover:border-foreground/30"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="text-xs uppercase tracking-widest font-bold text-foreground">
                    {r.num} {r.name}
                  </span>
                </div>
                <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  {r.tagline}
                </span>
              </div>

              <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-white p-3 mb-3">
                <Image
                  src={r.image}
                  alt={r.name}
                  fill
                  sizes="220px"
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {r.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground group-hover:text-ioma-violet transition-colors">
                Explorer {r.name}
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-ioma-violet group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}

        {/* 8th card: Bespoke / All */}
        <Link
          href="/shop"
          className="group flex flex-col justify-between rounded-sm border border-dashed border-border/80 bg-muted/20 p-5 hover:bg-muted/40 transition-all duration-300"
        >
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-ioma-violet">
              Catalogue Complet
            </span>
            <h3 className="font-display text-lg font-medium text-foreground mt-2">
              Tous nos soins visage, corps et cheveux
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Découvrez l'ensemble de nos 53 formules de pointe et rituels de beauté sur
              mesure.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground group-hover:underline">
              Voir tout le catalogue
            </span>
            <ArrowRight className="size-3.5 text-foreground group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>
    </section>
  );
}
