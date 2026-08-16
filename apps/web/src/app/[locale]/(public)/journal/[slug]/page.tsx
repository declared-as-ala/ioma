import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import type { Locale } from "@ioma/config";
import { Link } from "@/i18n/navigation";
import { BackArrow } from "@/components/ui/back-arrow";
import { JOURNAL_ARTICLES } from "@/content/journal-articles";

export function generateStaticParams() {
  return JOURNAL_ARTICLES.map((article) => ({ slug: article.slug }));
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = JOURNAL_ARTICLES.find((a) => a.slug === slug);
  if (!article) {
    notFound();
  }

  const locale = (await getLocale()) as Locale;

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-24">
      <Link
        href="/journal"
        className="inline-flex min-h-11 items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground xl:min-h-0"
      >
        <BackArrow /> {article.kicker[locale]}
      </Link>
      <h1 className="mt-6 font-display text-4xl">{article.title[locale]}</h1>
      <div className="mt-10 space-y-6">
        {article.body[locale].map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </div>
    </main>
  );
}
