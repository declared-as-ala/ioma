import { useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export default function AccessibilityStatementPage() {
  const t = useTranslations("Legal");
  const sections = t.raw("accessibility.sections") as string[];

  return (
    <LegalPageShell
      kicker={t("accessibility.kicker")}
      title={t("accessibility.title")}
      pendingNotice={t("pendingNotice")}
      sectionPendingLabel={t("sectionPendingLabel")}
      sections={sections.map((heading) => ({ heading }))}
    />
  );
}
