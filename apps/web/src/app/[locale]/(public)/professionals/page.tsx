import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function ProfessionalsPage() {
  const t = useTranslations("ProfessionalsPage");

  const benefits = [1, 2, 3] as const;
  const steps = [1, 2, 3] as const;

  return (
    <main>
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

      <section className="mx-auto max-w-[1440px] px-4 md:px-6 pb-24">
        <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
          {t("benefitsTitle")}
        </h2>
        <div className="mt-6 grid gap-12 md:grid-cols-3 md:gap-8">
          {benefits.map((n) => (
            <div key={n} className="border-t border-border pt-6">
              <span className="text-xs text-muted-foreground">0{n}</span>
              <h3 className="mt-2 font-display text-xl">{t(`benefit${n}Title`)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(`benefit${n}Body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-accent px-4 md:px-6 py-24">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="text-center text-xs uppercase tracking-heading text-muted-foreground">
            {t("processTitle")}
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((n) => (
              <li key={n} className="text-center">
                <span className="font-display text-3xl text-ioma-violet">{n}</span>
                <p className="mt-2 text-sm text-muted-foreground">{t(`process${n}`)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="uppercase tracking-widest">
              <Link href="/contact">{t("cta")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
