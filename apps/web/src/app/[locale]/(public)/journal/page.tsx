import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { Link } from "@/i18n/navigation";
import { JOURNAL_ARTICLES } from "@/content/journal-articles";

export default function JournalIndexPage() {
  const t = useTranslations("Home");
  const locale = useLocale() as Locale;

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
      <p className="text-xs uppercase tracking-heading text-muted-foreground">
        {t("journal.label")}
      </p>
      <h1 className="mt-4 max-w-lg font-display text-4xl">{t("journal.title")}</h1>

      <div className="mt-12 grid gap-10 border-t border-border pt-10 sm:grid-cols-2">
        {JOURNAL_ARTICLES.map((article) => (
          <Link key={article.slug} href={`/journal/${article.slug}`} className="group">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {article.kicker[locale]}
            </p>
            <p className="mt-2 font-display text-2xl transition-colors group-hover:text-muted-foreground">
              {article.title[locale]}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {article.excerpt[locale]}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
