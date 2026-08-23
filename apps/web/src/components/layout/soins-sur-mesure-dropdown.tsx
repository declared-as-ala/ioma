"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

interface SoinsSurMesureDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const BESPOKE_PRODUCTS = [
  {
    slug: "ma-creme-jour",
    title: "Ma Crème Jour",
    sizes: "30 ml / 50 ml",
    price: "Dès 559 AED",
    image: "/images/products/ma-creme-jour-1.jpg",
    desc: "Formulation personnalisée de jour selon votre hydratation et protection requise.",
  },
  {
    slug: "ma-creme-nuit",
    title: "Ma Crème Nuit",
    sizes: "30 ml / 50 ml",
    price: "Dès 559 AED",
    image: "/images/products/ma-creme-nuit-1.jpg",
    desc: "Soin régénérant nocturne ciblé sur la fermeté et la nutrition cellulaire.",
  },
  {
    slug: "mon-serum",
    title: "Mon Sérum",
    sizes: "30 ml",
    price: "873 AED",
    image: "/images/products/mon-serum-1.jpg",
    desc: "Concentré d'actifs sur mesure formulé pour corriger vos priorités cutanées.",
  },
  {
    slug: "mon-soin-yeux",
    title: "Mon Soin Yeux",
    sizes: "30 ml",
    price: "508 AED",
    image: "/images/products/mon-soin-yeux-1.jpg",
    desc: "Soin contour des yeux sur mesure défatigant, lissant et liftant.",
  },
];

export function SoinsSurMesureDropdown({ isOpen, onClose }: SoinsSurMesureDropdownProps) {
  const t = useTranslations("Nav");

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-full inset-x-0 bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl z-40"
      onMouseLeave={onClose}
      role="region"
      aria-label={t("bespoke")}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-12 gap-8 text-foreground">
        {/* Left Column: Storytelling & Diagnosis CTA */}
        <div className="col-span-4 border-e border-border/50 pe-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-ioma-violet mb-2">
              <Sparkles className="size-4" />
              <span className="text-[0.65rem] uppercase tracking-widest font-bold">
                In.Lab Haute Cosmétique
              </span>
            </div>
            <h3 className="text-lg font-serif font-medium tracking-tight text-foreground">
              {t("bespoke")}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {t("bespokeSubtitle")}. Chaque soin est une formule unique créée
              spécialement pour votre peau parmi plus de 40 000 combinaisons possibles.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <Link
              href="/diagnosis"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-ioma-violet text-white text-xs uppercase tracking-widest font-semibold hover:bg-ioma-violet/90 transition-colors shadow-sm"
            >
              <Sparkles className="size-3.5" />
              <span>{t("startDiagnosisCta")}</span>
            </Link>
          </div>
        </div>

        {/* Right Columns: Bespoke Products Grid */}
        <div className="col-span-8 grid grid-cols-4 gap-4">
          {BESPOKE_PRODUCTS.map((prod) => (
            <Link
              key={prod.slug}
              href={`/shop/${prod.slug}`}
              onClick={onClose}
              className="group flex flex-col justify-between p-3 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-ioma-violet/40 transition-all duration-200"
            >
              <div>
                <div className="relative aspect-square w-full mb-3 rounded-sm overflow-hidden bg-white">
                  <Image
                    src={prod.image}
                    alt={prod.title}
                    fill
                    sizes="180px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-xs font-semibold text-foreground group-hover:text-ioma-violet transition-colors">
                  {prod.title}
                </h4>
                <p className="text-[0.7rem] text-muted-foreground mt-1 line-clamp-2">
                  {prod.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-[0.7rem] font-semibold text-foreground">
                  {prod.price}
                </span>
                <ArrowRight className="size-3 text-muted-foreground group-hover:text-ioma-violet group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
