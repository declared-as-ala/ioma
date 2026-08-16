import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export default function TechnologyPage() {
  const t = useTranslations("TechnologyPage");

  const steps = [1, 2, 3] as const;

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

      {/* Lab image */}
      <ScrollReveal>
        <section className="mx-auto max-w-[1440px] px-4 md:px-6 pb-24">
          <div className="relative h-64 overflow-hidden rounded-md bg-ioma-black sm:h-96">
            <Image
              src="/images/homepage/technology-lab.png"
              alt="Minimalist still life of a skin-diagnosis device in a studio setting"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </section>
      </ScrollReveal>

      {/* How it works */}
      <ScrollReveal>
        <section className="mx-auto max-w-[1440px] px-4 md:px-6 pb-24">
          <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
            {t("howTitle")}
          </h2>
          <div className="mt-6 grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((n) => (
              <div key={n} className="border-t border-border pt-6">
                <span className="text-xs text-muted-foreground">0{n}</span>
                <h3 className="mt-2 font-display text-xl">{t(`step${n}Title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(`step${n}Body`)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* AI analysis */}
      <ScrollReveal>
        <section className="bg-accent px-4 md:px-6 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-3xl">{t("aiTitle")}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t("aiBody")}
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
