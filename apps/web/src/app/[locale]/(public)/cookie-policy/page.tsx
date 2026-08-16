import { useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export default function CookiePolicyPage() {
  const t = useTranslations("Legal");
  const sections = t.raw("cookies.sections") as string[];

  return (
    <LegalPageShell
      kicker={t("cookies.kicker")}
      title={t("cookies.title")}
      pendingNotice={t("pendingNotice")}
      sectionPendingLabel={t("sectionPendingLabel")}
      sections={sections.map((heading) => ({ heading }))}
    />
  );
}
