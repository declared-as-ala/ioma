import { useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export default function PrivacyPolicyPage() {
  const t = useTranslations("Legal");
  const sections = t.raw("privacy.sections") as string[];

  return (
    <LegalPageShell
      kicker={t("privacy.kicker")}
      title={t("privacy.title")}
      pendingNotice={t("pendingNotice")}
      sectionPendingLabel={t("sectionPendingLabel")}
      sections={sections.map((heading) => ({ heading }))}
    />
  );
}
