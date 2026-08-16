import { useTranslations } from "next-intl";
import { ContactForm } from "@/components/forms/contact-form";

export default function ContactPage() {
  const t = useTranslations("ContactPage");

  return (
    <main className="mx-auto max-w-xl px-4 md:px-6 py-24">
      <p className="text-center text-xs uppercase tracking-heading text-muted-foreground">
        {t("kicker")}
      </p>
      <h1 className="mt-4 text-center font-display text-4xl tracking-wide">
        {t("title")}
      </h1>
      <p className="mt-4 text-center text-base leading-relaxed text-muted-foreground">
        {t("intro")}
      </p>
      <div className="mt-12">
        <ContactForm />
      </div>
    </main>
  );
}
