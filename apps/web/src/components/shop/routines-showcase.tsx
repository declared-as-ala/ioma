"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const ROUTINES = [
  {
    id: "hydra-protocol",
    title: "Protocole Hydratation Optimale",
    range: "1 Hydra",
    desc: "Un rituel 3 étapes formulé pour recharger la peau en eau et renforcer le film hydrolipidique face au climat chaud.",
    steps: [
      "Lait Démaquillant Hydratant",
      "Sérum Hydratant Optimum",
      "Gel Fraîcheur Hydratant",
    ],
    price: "825 AED",
    image: "/images/products/serum-hydratant-optimum-1.jpg",
    link: "/shop?range=hydra",
  },
  {
    id: "renew-protocol",
    title: "Protocole Régénération Anti-Âge",
    range: "3 Renew",
    desc: "Haute synergie cellulaire pour lisser les rides, raffermir les contours et stimuler le renouvellement tissulaire.",
    steps: [
      "Mousse Tonique Douce",
      "Sérum Généreux Extrême",
      "Crème Généreuse Jour & Nuit",
    ],
    price: "1 464 AED",
    image: "/images/products/creme-sublime-revitalisante-1.jpg",
    link: "/shop?range=renew",
  },
  {
    id: "illumine-protocol",
    title: "Protocole Éclat & Défense UV",
    range: "7 Illumine",
    desc: "Correction experte des taches pigmentaires et bouclier cellulaire haute protection SPF50+ PA++++.",
    steps: [
      "Nettoyant Exfoliant Lumière",
      "Bright Pearl Essence",
      "Cell Protector SPF50+",
    ],
    price: "1 300 AED",
    image: "/images/products/cell-protector-spf-50-pa-1.jpg",
    link: "/shop?range=illumine",
  },
];

export function RoutinesShowcase() {
  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
      {ROUTINES.map((routine) => (
        <div
          key={routine.id}
          className="group flex flex-col justify-between rounded-sm border border-border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:border-ioma-violet/40"
        >
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-white p-4 mb-4">
              <Image
                src={routine.image}
                alt={routine.title}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 start-2 text-[0.65rem] font-bold uppercase tracking-wider bg-ioma-violet/10 text-ioma-violet px-2.5 py-1 rounded-full">
                {routine.range}
              </span>
            </div>

            <h3 className="font-display text-lg font-medium text-foreground">
              {routine.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {routine.desc}
            </p>

            <div className="mt-4 pt-4 border-t border-border/50 space-y-1.5">
              <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
                Étapes du protocole :
              </span>
              {routine.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-foreground/80"
                >
                  <CheckCircle2 className="size-3 text-ioma-violet shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{routine.price}</span>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="uppercase tracking-wider text-xs"
            >
              <Link href={routine.link} className="inline-flex items-center gap-1">
                <span>Découvrir</span>
                <ArrowRight className="size-3 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
