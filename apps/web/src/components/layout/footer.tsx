import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IomaLogo } from "@/components/brand/ioma-logo";
import { NewsletterForm } from "@/components/forms/newsletter-form";

// Mirrors header.tsx's NOT_YET_BUILT set — see the comment there for why
// prefetch is disabled for these specific targets. `/shop` and `/cart`
// became real in Sprint 4, `/diagnosis` in Sprint 6.
const NOT_YET_BUILT = new Set(["/booking", "/partners"]);

export function Footer() {
  const t = useTranslations("Footer");

  const columns = [
    {
      title: t("discoverTitle"),
      links: [
        { href: "/maison", label: t("maison") },
        { href: "/technology", label: t("technology") },
        { href: "/diagnosis", label: t("diagnosis") },
        { href: "/treatments", label: t("treatments") },
        { href: "/journal", label: t("journal") },
      ],
    },
    {
      title: t("shopTitle"),
      links: [
        { href: "/shop", label: t("allProducts") },
        { href: "/partners", label: t("partners") },
        { href: "/professionals", label: t("professionals") },
      ],
    },
    {
      title: t("supportTitle"),
      links: [
        { href: "/contact", label: t("contact") },
        { href: "/faq", label: t("faq") },
        { href: "/shipping-policy", label: t("shipping") },
        { href: "/return-policy", label: t("returns") },
      ],
    },
    {
      title: t("legalTitle"),
      links: [
        { href: "/privacy-policy", label: t("privacy") },
        { href: "/cookie-policy", label: t("cookies") },
        { href: "/terms-and-conditions", label: t("terms") },
        { href: "/accessibility-statement", label: t("accessibility") },
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-border bg-background">
      {/* Newsletter band */}
      <div className="border-b border-border bg-accent">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 px-4 md:px-6 py-12 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-xl">{t("newsletterTitle")}</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("newsletterBody")}
            </p>
          </div>
          <div className="w-full max-w-sm">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <IomaLogo withClaim />
          </div>
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={NOT_YET_BUILT.has(link.href) ? false : undefined}
                      className="flex min-h-11 items-center text-sm text-foreground/80 transition-colors hover:text-foreground xl:min-h-0"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p className="max-w-xl leading-relaxed">{t("claimFootnote")}</p>
        </div>
      </div>

      {/* Utility bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-3 text-center text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          {t("region")} — {t("currency")}
        </div>
      </div>
    </footer>
  );
}
