import { useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export default function TermsAndConditionsPage() {
  const t = useTranslations("Legal");
  const sections = t.raw("terms.sections") as string[];

  return (
    <LegalPageShell
      kicker={t("terms.kicker")}
      title={t("terms.title")}
      pendingNotice={t("pendingNotice")}
      sectionPendingLabel={t("sectionPendingLabel")}
      sections={sections.map((heading) => ({ heading }))}
    />
  );
}
