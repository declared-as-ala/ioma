import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { Link } from "@/i18n/navigation";
import { TREATMENTS } from "@/content/treatments";

export default function TreatmentsPage() {
  const t = useTranslations("TreatmentsPage");
  const locale = useLocale() as Locale;

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
      <p className="text-xs uppercase tracking-heading text-muted-foreground">
        {t("kicker")}
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
        {t("intro")}
      </p>

      <ul className="mt-12 divide-y divide-border border-t border-border">
        {TREATMENTS.map((treatment) => (
          <li key={treatment.slug}>
            <Link
              href={`/treatments/${treatment.slug}`}
              className="group flex flex-col gap-2 py-6 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div>
                <p className="font-display text-xl">{treatment.name[locale]}</p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {treatment.summary[locale]}
                </p>
              </div>
              <span className="whitespace-nowrap text-xs uppercase tracking-widest text-muted-foreground">
                {t("duration", { minutes: treatment.durationMinutes })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
