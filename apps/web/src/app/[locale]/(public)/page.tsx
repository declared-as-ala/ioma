import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CinematicHero } from "@/components/home/cinematic-hero";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CtaArrow } from "@/components/ui/cta-arrow";
import { BestSellersCarousel } from "@/components/shop/best-sellers-carousel";
import { RoutinesShowcase } from "@/components/shop/routines-showcase";
import { BespokeInlabSection } from "@/components/home/bespoke-inlab-section";
import { RangesShowcase } from "@/components/home/ranges-showcase";
import { AiExpertSection } from "@/components/home/ai-expert-section";
import { MapPin, Briefcase } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <main className="relative bg-background">
      {/* 1. CINEMATIC SCROLL HERO */}
      <CinematicHero />

      {/* 2. NOS MEILLEURES VENTES (Best Sellers) */}
      <ScrollReveal>
        <section className="py-24 max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Sélection d'Exception
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mt-2">
              Nos Meilleures Ventes
            </h2>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Les formules emblématiques IOMA Paris plébiscitées pour leur efficacité
              prouvée et leur sensorialité unique.
            </p>
          </div>

          <BestSellersCarousel />
        </section>
      </ScrollReveal>

      {/* 3. SOINS SUR MESURE IN.LAB */}
      <ScrollReveal>
        <BespokeInlabSection />
      </ScrollReveal>

      {/* 4. NOS 7 GAMMES EXPERTES */}
      <ScrollReveal>
        <RangesShowcase />
      </ScrollReveal>

      {/* 5. NOS ROUTINES ET KITS */}
      <section className="py-24 max-w-[1440px] mx-auto px-4 md:px-6 border-t border-border">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Protocoles Complets
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground mt-2">
            Nos Routines & Kits de Soin
          </h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            Des rituels clés en main pensés en synergie pour amplifier les résultats de
            chaque formule jour après jour.
          </p>
        </div>

        <RoutinesShowcase />
      </section>

      {/* 6. AI SKIN EXPERT 2.0 */}
      <ScrollReveal>
        <AiExpertSection />
      </ScrollReveal>

      {/* 7. SCIENCE, TECHNOLOGIE & LA MAISON */}
      <ScrollReveal>
        <section className="mx-auto max-w-[1440px] px-4 md:px-6 py-24 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-heading text-muted-foreground font-semibold">
                {t("maison.label")}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-foreground mt-4">
                {t("maison.title")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {t("maison.body")}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-sm bg-muted/30 border border-border/50">
                  <span className="font-display text-2xl font-bold text-foreground">
                    1M+
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Diagnostics cutanés dans l'Atlas mondial IOMA
                  </p>
                </div>
                <div className="p-4 rounded-sm bg-muted/30 border border-border/50">
                  <span className="font-display text-2xl font-bold text-foreground">
                    100%
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formulé et fabriqué en France sous contrôle dermatologique
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="link"
                className="mt-6 px-0 uppercase tracking-widest text-foreground font-semibold"
              >
                <Link href="/maison" className="inline-flex items-center gap-1.5">
                  {t("maison.cta")} <CtaArrow />
                </Link>
              </Button>
            </div>

            <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-white p-4 border border-border shadow-md">
              <Image
                src="/images/products/creme-sublime-revitalisante-1.jpg"
                alt="IOMA Paris Haute Précision"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-6"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 8. SOINS & PARTENAIRES À DUBAÏ */}
      <ScrollReveal>
        <section className="bg-muted/20 py-24 border-t border-border">
          <div className="mx-auto max-w-[1440px] px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-ioma-black shadow-lg">
                <Image
                  src="/images/homepage/treatment-room.png"
                  alt="Institut & Spa Partenaire IOMA Paris Dubaï"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  <MapPin className="size-3.5 text-ioma-violet" />
                  <span>{t("soins.label")}</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-foreground">
                  {t("soins.title")}
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t("soins.body")}
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="uppercase tracking-widest font-semibold"
                  >
                    <Link href="/booking">{t("diagnosis.bookCta")}</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="uppercase tracking-widest font-semibold"
                  >
                    <Link href="/partners">{t("partners.cta")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 9. ESPACE PROFESSIONNELS / B2B */}
      <ScrollReveal>
        <section className="py-20 max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="rounded-md border border-border/80 bg-gradient-to-r from-muted/40 via-background to-muted/40 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-ioma-violet font-semibold">
                <Briefcase className="size-4" />
                <span>Espace Professionnels & Hôtellerie de Luxe</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl text-foreground">
                Vous dirigez un spa, une clinique ou un institut aux Émirats ?
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Accédez à nos formats cabine exclusifs, nos appareils de diagnostic haute
                précision et nos programmes de formation certifiés IOMA Paris.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest font-semibold shrink-0"
            >
              <Link href="/professionals">
                <span>Devenir Partenaire Agréé</span>
              </Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
