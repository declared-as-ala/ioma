"use client";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/loading-screen";

export function AdminPanel({
  title,
  children,
  href,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const t = useTranslations("AdminExperience");
  return (
    <section className={`min-w-0 border border-neutral-200 bg-white ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {href && (
          <Link
            className="inline-flex min-h-11 items-center text-xs text-blue-700 hover:underline"
            href={href}
          >
            {t("viewAll")} <span className="ms-1 inline-block rtl:rotate-180">→</span>
          </Link>
        )}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
export function AdminQueryState({
  query,
  children,
}: {
  query: { isLoading: boolean; isError: boolean; refetch: () => unknown };
  children: React.ReactNode;
}) {
  const t = useTranslations("AdminExperience");
  if (query.isLoading) return <SkeletonTable rows={4} />;
  if (query.isError)
    return (
      <div role="alert" className="border-s-4 border-red-600 bg-white p-5">
        <p>{t("error")}</p>
        <Button onClick={() => query.refetch()} className="mt-3">
          {t("retry")}
        </Button>
      </div>
    );
  return <>{children}</>;
}
export function AdminEmpty({ text }: { text?: string }) {
  const t = useTranslations("AdminExperience");
  return <p className="py-6 text-sm text-neutral-500">{text ?? t("empty")}</p>;
}
export function useAdminFormat() {
  const locale = useLocale();
  const t = useTranslations("AdminExperience");
  const number = (n: number | null | undefined) =>
    n == null
      ? t("unavailable")
      : new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n);
  const money = (n: number | null | undefined) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 2,
    }).format(typeof n === "number" && Number.isFinite(n) ? n / 100 : 0);
  const date = (value: string | null | undefined, time = false) => {
    if (!value) return "—";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return "—";
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeZone: "Asia/Dubai",
        ...(time ? { timeStyle: "short" as const, timeZone: "Asia/Dubai" } : {}),
      }).format(d);
    } catch {
      return "—";
    }
  };
  const label = (value: unknown): string => {
    if (value == null || value === "") return "—";
    if (typeof value === "object" && !Array.isArray(value)) {
      const v = value as Record<string, unknown>;
      return String(v[locale] || v.en || v.name || "—");
    }
    if (typeof value === "boolean") return t(value ? "yes" : "no");
    const key = `values.${String(value)}`;
    return t.has(key) ? t(key) : String(value);
  };
  return { number, money, date, label, locale };
}
