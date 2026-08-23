"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export function BespokeInlabSection() {
  return (
    <section className="bg-gradient-to-b from-muted/30 to-background py-24 border-y border-border">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left info column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ioma-violet/10 text-ioma-violet text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="size-3.5" />
              <span>In.Lab — Soins Sur Mesure</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl text-foreground tracking-tight">
              La science de votre peau, <br className="hidden sm:inline" />
              <span className="font-serif italic text-ioma-violet">
                et d'aucune autre.
              </span>
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Formulés à la goutte près selon votre diagnostic de peau exclusif, les soins{" "}
              <strong>In.Lab IOMA Paris</strong> combinent des capsules d'actifs pures
              hautement dosées pour répondre exactement aux exigences de votre épiderme.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-foreground/90">
              {[
                "Plus de 40 000 formules uniques possibles",
                "Dosage micrométrique des principes actifs brevetés",
                "Formule fraîche préparée sur demande à Paris ou en institut",
                "Texture ajustée selon vos préférences et le climat des EAU",
              ].map((point, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="size-4 rounded-full bg-ioma-violet/20 text-ioma-violet flex items-center justify-center shrink-0">
                    <Check className="size-2.5 stroke-[3]" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-ioma-violet hover:bg-ioma-violet/90 text-white uppercase tracking-widest font-semibold shadow-md"
              >
                <Link href="/diagnosis" className="inline-flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <span>Commencer mon diagnostic</span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="uppercase tracking-widest font-semibold"
              >
                <Link
                  href="/shop/ma-creme-jour"
                  className="inline-flex items-center gap-2"
                >
                  <span>Découvrir Ma Crème Jour</span>
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right visual grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                title: "Ma Crème Jour",
                price: "Dès 559 AED",
                slug: "ma-creme-jour",
                image: "/images/products/ma-creme-jour-1.jpg",
                desc: "Hydratation & Bouclier",
              },
              {
                title: "Ma Crème Nuit",
                price: "Dès 559 AED",
                slug: "ma-creme-nuit",
                image: "/images/products/ma-creme-nuit-1.jpg",
                desc: "Régénération & Fermeté",
              },
              {
                title: "Mon Sérum",
                price: "873 AED",
                slug: "mon-serum",
                image: "/images/products/mon-serum-1.jpg",
                desc: "Haute Concentration",
              },
              {
                title: "Mon Soin Yeux",
                price: "508 AED",
                slug: "mon-soin-yeux",
                image: "/images/products/mon-soin-yeux-1.jpg",
                desc: "Lissant & Anti-Poches",
              },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/shop/${item.slug}`}
                className="group flex flex-col justify-between p-4 rounded-sm border border-border bg-card hover:border-ioma-violet/50 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-white p-2 mb-3">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="160px"
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground group-hover:text-ioma-violet transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[0.7rem] font-semibold text-foreground">
                    {item.price}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground group-hover:text-ioma-violet group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
