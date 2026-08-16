import { useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export default function AiConsentPage() {
  const t = useTranslations("Legal");
  const sections = t.raw("aiConsent.sections") as string[];

  return (
    <LegalPageShell
      kicker={t("aiConsent.kicker")}
      title={t("aiConsent.title")}
      pendingNotice={t("pendingNotice")}
      sectionPendingLabel={t("sectionPendingLabel")}
      sections={sections.map((heading) => ({ heading }))}
    />
  );
}
