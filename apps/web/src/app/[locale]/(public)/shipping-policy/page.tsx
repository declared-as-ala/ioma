import { useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export default function ShippingPolicyPage() {
  const t = useTranslations("Legal");
  const sections = t.raw("shipping.sections") as string[];

  return (
    <LegalPageShell
      kicker={t("shipping.kicker")}
      title={t("shipping.title")}
      pendingNotice={t("pendingNotice")}
      sectionPendingLabel={t("sectionPendingLabel")}
      sections={sections.map((heading) => ({ heading }))}
    />
  );
}
