"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { PRODUCT_RANGE_COLORS } from "@ioma/config";
import { ArrowRight, Sparkles } from "lucide-react";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONCERNS = [
  {
    slug: "dehydration",
    labelKey: "concernHydration",
    href: "/shop?concern=dehydration",
  },
  {
    slug: "first-signs-of-aging",
    labelKey: "concernAntiAging",
    href: "/shop?concern=first-signs-of-aging",
  },
  {
    slug: "fatigue-dullness",
    labelKey: "concernRadiance",
    href: "/shop?concern=fatigue-dullness",
  },
  {
    slug: "sensitivity",
    labelKey: "concernFirmness",
    fallback: "Sensibilité & Rougeurs",
    href: "/shop?concern=sensitivity",
  },
  {
    slug: "blemishes",
    labelKey: "concernPores",
    fallback: "Imperfections & Pores",
    href: "/shop?concern=blemishes",
  },
  {
    slug: "shine-control",
    fallback: "Contrôle de la brillance",
    href: "/shop?concern=shine-control",
  },
  {
    slug: "dark-spots",
    fallback: "Taches & Teint uniforme",
    href: "/shop?concern=dark-spots",
  },
  { slug: "menopause", fallback: "Ménopause & Densité", href: "/shop?concern=menopause" },
  {
    slug: "uv-protection",
    fallback: "Protection UV & Ville",
    href: "/shop?concern=uv-protection",
  },
];

const CATEGORIES = [
  { slug: "serums", label: "Sérums", href: "/shop?category=serums" },
  { slug: "cremes", label: "Crèmes de Jour & Nuit", href: "/shop?category=cremes" },
  {
    slug: "nettoyants",
    label: "Nettoyants & Lotions",
    href: "/shop?category=nettoyants",
  },
  { slug: "demaquillants", label: "Démaquillants", href: "/shop?category=demaquillants" },
  { slug: "masques", label: "Masques & Gommages", href: "/shop?category=masques" },
  {
    slug: "soins-yeux-levres",
    label: "Contour des Yeux & Lèvres",
    href: "/shop?category=soins-yeux-levres",
  },
  {
    slug: "protection-solaire",
    label: "Protection Solaire",
    href: "/shop?category=protection-solaire",
  },
  {
    slug: "soins-sur-mesure",
    label: "Soins Sur Mesure In.Lab",
    href: "/shop?category=soins-sur-mesure",
  },
];

const RANGES = [
  {
    key: "hydra",
    num: "1",
    name: "Hydra",
    color: PRODUCT_RANGE_COLORS.hydra,
    desc: "Hydratation durable",
  },
  {
    key: "energize",
    num: "2",
    name: "Energize",
    color: PRODUCT_RANGE_COLORS.energize,
    desc: "Éclat & Vitalité",
  },
  {
    key: "renew",
    num: "3",
    name: "Renew",
    color: PRODUCT_RANGE_COLORS.renew,
    desc: "Fermeté & Anti-âge",
  },
  {
    key: "calm",
    num: "4",
    name: "Calm",
    color: PRODUCT_RANGE_COLORS.calm,
    desc: "Apaisement & Anti-rougeurs",
  },
  {
    key: "purete",
    num: "5",
    name: "Pureté",
    color: PRODUCT_RANGE_COLORS.purete,
    desc: "Clarté & Anti-imperfections",
  },
  {
    key: "matte",
    num: "6",
    name: "Matte",
    color: PRODUCT_RANGE_COLORS.matte,
    desc: "Matité & Pores",
  },
  {
    key: "illumine",
    num: "7",
    name: "Illumine",
    color: PRODUCT_RANGE_COLORS.illumine,
    desc: "Taches & Éclat",
  },
];

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
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
      aria-label={t("visage")}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-12 gap-8 text-foreground">
        {/* Col 1: Vos Préoccupations */}
        <div className="col-span-3 border-e border-border/50 pe-6">
          <div className="text-[0.7rem] uppercase tracking-widest font-semibold text-muted-foreground mb-4 pb-1 border-b border-border/40">
            {t("concernsTitle")}
          </div>
          <ul className="space-y-2.5 text-xs">
            {CONCERNS.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center justify-between text-foreground/80 hover:text-foreground hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-150"
                >
                  <span>{item.fallback || t(item.labelKey as any)}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity">
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/diagnosis"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ioma-violet hover:underline uppercase tracking-wider"
              >
                <Sparkles className="size-3" />
                <span>{t("startDiagnosisCta")}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 2: Nos Catégories */}
        <div className="col-span-3 border-e border-border/50 pe-6">
          <div className="text-[0.7rem] uppercase tracking-widest font-semibold text-muted-foreground mb-4 pb-1 border-b border-border/40">
            {t("categoriesTitle")}
          </div>
          <ul className="space-y-2.5 text-xs">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={cat.href}
                  onClick={onClose}
                  className="group flex items-center justify-between text-foreground/80 hover:text-foreground hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-150"
                >
                  <span>{cat.label}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity">
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/shop"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                <span>{t("allFace")}</span>
                <ArrowRight className="size-3 rtl:rotate-180" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Nos Gammes */}
        <div className="col-span-3 border-e border-border/50 pe-6">
          <div className="text-[0.7rem] uppercase tracking-widest font-semibold text-muted-foreground mb-4 pb-1 border-b border-border/40">
            {t("rangesTitle")}
          </div>
          <ul className="space-y-2.5 text-xs">
            {RANGES.map((r) => (
              <li key={r.key}>
                <Link
                  href={`/shop?range=${r.key}`}
                  onClick={onClose}
                  className="group flex items-center gap-2.5 text-foreground/80 hover:text-foreground hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-150"
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-foreground">
                    {r.num} {r.name}
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground font-normal truncate">
                    — {r.desc}
                  </span>
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/shop?bestSeller=true"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-ioma-violet transition-colors"
              >
                <span>★ {t("allBestSellers")}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Featured Product Card */}
        <div className="col-span-3 flex flex-col justify-between bg-muted/30 p-4 rounded-sm border border-border/60">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-semibold">
                {t("featuredTitle")}
              </span>
              <span className="text-[0.65rem] uppercase tracking-widest text-ioma-violet font-semibold bg-ioma-violet/10 px-2 py-0.5 rounded-full">
                Soin Iconique
              </span>
            </div>
            <div className="relative aspect-square w-full mb-3 rounded-sm overflow-hidden bg-white">
              <Image
                src="/images/products/creme-sublime-revitalisante-1.jpg"
                alt="Crème Sublime Revitalisante"
                fill
                sizes="260px"
                className="object-contain p-2 hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              Crème Sublime Revitalisante
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              Haute régénération cellulaire anti-âge aux actifs d'exception et résultats
              visibles.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">968 AED</span>
            <Link
              href="/shop/creme-sublime-revitalisante"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-ioma-violet hover:underline"
            >
              <span>{t("discoverAll")}</span>
              <ArrowRight className="size-3 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
