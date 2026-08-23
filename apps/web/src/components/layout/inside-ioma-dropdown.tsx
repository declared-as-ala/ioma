"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import {
  Building2,
  Cpu,
  BookOpen,
  MapPin,
  Briefcase,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface InsideIomaDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InsideIomaDropdown({ isOpen, onClose }: InsideIomaDropdownProps) {
  const t = useTranslations("Nav");

  if (!isOpen) return null;

  const links = [
    {
      href: "/maison",
      title: t("maison"),
      desc: "L'histoire de la haute cosmétique sur mesure et notre philosophie parisienne.",
      icon: Building2,
    },
    {
      href: "/technology",
      title: t("technology"),
      desc: "Capteurs MEMS, brevets micro-électroniques et précision diagnostique prouvée.",
      icon: Cpu,
    },
    {
      href: "/journal",
      title: t("journal"),
      desc: "Conseils d'experts, science des actifs et rituels adaptés au climat des Émirats.",
      icon: BookOpen,
    },
    {
      href: "/partners",
      title: t("partners"),
      desc: "Découvrez les instituts et spas partenaires agréés IOMA Paris aux EAU.",
      icon: MapPin,
    },
    {
      href: "/professionals",
      title: t("professionals"),
      desc: "Protocoles de cabine, formation d'excellence et commandes professionnelles B2B.",
      icon: Briefcase,
    },
    {
      href: "/booking",
      title: t("bookAppointment"),
      desc: "Réservez votre diagnostic complet et soin sur mesure en institut partenaire.",
      icon: Calendar,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-full inset-x-0 bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl z-40"
      onMouseLeave={onClose}
      role="region"
      aria-label={t("insideIoma")}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-foreground">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="group flex items-start gap-4 p-4 rounded-sm border border-border/50 bg-muted/10 hover:bg-muted/30 hover:border-ioma-violet/30 transition-all duration-200"
            >
              <div className="size-10 rounded-sm bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-ioma-violet/10 group-hover:text-ioma-violet transition-colors shrink-0">
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground group-hover:text-ioma-violet transition-colors">
                    {link.title}
                  </h4>
                  <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
                </div>
                <p className="text-[0.72rem] text-muted-foreground mt-1 leading-relaxed">
                  {link.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
