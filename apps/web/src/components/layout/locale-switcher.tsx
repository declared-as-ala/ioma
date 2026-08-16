"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@ioma/config";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LocaleSwitcher() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function onChange(nextLocale: string) {
    router.replace(
      // @ts-expect-error -- pathname/params are dynamically typed by next-intl
      { pathname, params },
      { locale: nextLocale as Locale },
    );
  }

  return (
    <Select value={locale} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        aria-label={t("languageSwitcher")}
        data-testid="locale-switcher-trigger"
        className="border-none bg-transparent text-xs uppercase tracking-widest shadow-none"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SUPPORTED_LOCALES.map((code) => (
          <SelectItem key={code} value={code}>
            {LOCALE_LABELS[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
