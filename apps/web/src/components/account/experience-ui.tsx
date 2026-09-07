"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading-screen";

export function AccountHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const t = useTranslations("AccountExperience");
  return (
    <header className="mb-10 border-b border-border pb-8">
      <p className="text-xs uppercase tracking-[.2em] text-muted-foreground">
        {t("personal")}
      </p>
      <h1 className="mt-4 font-display text-3xl font-light leading-tight md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}

export function AccountSection({
  title,
  href,
  action,
  children,
}: {
  title: string;
  href?: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 border-t border-border py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-light md:text-2xl">{title}</h2>
        {href && <AccountLink href={href}>{action}</AccountLink>}
      </div>
      {children}
    </section>
  );
}

export function AccountLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-3 text-sm underline-offset-4 transition-colors duration-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      {children}
      <ArrowUpRight className="size-4 shrink-0 rtl:-rotate-90" aria-hidden="true" />
    </Link>
  );
}

export function QueryState({
  query,
  children,
}: {
  query: { isLoading: boolean; isError: boolean; refetch: () => unknown };
  children: React.ReactNode;
}) {
  const t = useTranslations("Account");
  if (query.isLoading)
    return (
      <PageLoader variant="luxury" fullScreen={false} label={t("loading")} />
    );
  if (query.isError)
    return (
      <div role="alert" className="py-4">
        <p className="text-sm text-destructive">{t("loadError")}</p>
        <Button variant="outline" onClick={() => query.refetch()} className="mt-3">
          {t("retry")}
        </Button>
      </div>
    );
  return <>{children}</>;
}
