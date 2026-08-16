import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function DiagnosisLandingPage() {
  const t = useTranslations("Diagnosis.landing");

  return (
    <main className="mx-auto max-w-4xl px-4 md:px-6 py-24">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {t("kicker")}
      </p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">{t("title")}</h1>
      <p className="mt-6 max-w-2xl leading-7 text-muted-foreground">{t("intro")}</p>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col border border-border p-8">
          <h2 className="font-display text-2xl">{t("standardCard.title")}</h2>
          <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">
            {t("standardCard.description")}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 w-fit uppercase tracking-widest"
            data-testid="start-standard-diagnosis"
          >
            <Link href="/diagnosis/standard">{t("standardCard.cta")}</Link>
          </Button>
        </div>

        <div className="flex flex-col border border-border p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl">{t("aiCard.title")}</h2>
            <span className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              {t("aiCard.badge")}
            </span>
          </div>
          <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">
            {t("aiCard.description")}
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="mt-8 w-fit uppercase tracking-widest"
            data-testid="start-ai-diagnosis"
          >
            <Link href="/diagnosis/ai">{t("aiCard.cta")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
