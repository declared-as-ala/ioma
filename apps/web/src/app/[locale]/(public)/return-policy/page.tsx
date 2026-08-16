import { useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export default function ReturnPolicyPage() {
  const t = useTranslations("Legal");
  const sections = t.raw("returns.sections") as string[];

  return (
    <LegalPageShell
      kicker={t("returns.kicker")}
      title={t("returns.title")}
      pendingNotice={t("pendingNotice")}
      sectionPendingLabel={t("sectionPendingLabel")}
      sections={sections.map((heading) => ({ heading }))}
    />
  );
}
