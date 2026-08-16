import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export default function MaisonPage() {
  const t = useTranslations("MaisonPage");

  const pillars = [1, 2, 3] as const;

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 md:px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-heading text-muted-foreground">
          {t("kicker")}
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-wide sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          {t("intro")}
        </p>
      </section>

      {/* Philosophy */}
      <ScrollReveal>
        <section className="mx-auto grid max-w-[1440px] gap-8 px-4 md:px-6 pb-24 md:grid-cols-2 md:items-center md:gap-16">
          <div className="relative h-64 overflow-hidden rounded-md bg-ioma-grey-100 md:h-96">
            <Image
              src="/images/homepage/maison-portrait.png"
              alt="Close-up editorial beauty portrait, luminous natural skin"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl">{t("philosophyTitle")}</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              {t("philosophyBody")}
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Pillars */}
      <ScrollReveal>
        <section className="mx-auto max-w-[1440px] px-4 md:px-6 pb-24">
          <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
            {t("pillarsTitle")}
          </h2>
          <div className="mt-6 grid gap-12 md:grid-cols-3 md:gap-8">
            {pillars.map((n) => (
              <div key={n} className="border-t border-border pt-6">
                <span className="text-xs text-muted-foreground">0{n}</span>
                <h3 className="mt-2 font-display text-xl">{t(`pillar${n}Title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(`pillar${n}Body`)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className="bg-accent px-4 md:px-6 py-24 text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="font-display text-3xl">{t("ctaTitle")}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t("ctaBody")}
            </p>
            <Button asChild size="lg" className="mt-8 uppercase tracking-widest">
              <Link href="/diagnosis">{t("cta")}</Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
