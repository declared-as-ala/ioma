import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function FaqPage() {
  const t = useTranslations("FaqPage");

  const questions = [1, 2, 3, 4, 5] as const;

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-24">
      <p className="text-center text-xs uppercase tracking-heading text-muted-foreground">
        {t("kicker")}
      </p>
      <h1 className="mt-4 text-center font-display text-4xl tracking-wide">
        {t("title")}
      </h1>

      <Accordion type="single" collapsible className="mt-12">
        {questions.map((n) => (
          <AccordionItem key={n} value={`q${n}`}>
            <AccordionTrigger className="text-start font-display text-lg">
              {t(`q${n}Title`)}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {t(`q${n}Body`)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 text-center">
        <Button asChild variant="outline" size="lg" className="uppercase tracking-widest">
          <Link href="/contact">{t("contactCta")}</Link>
        </Button>
      </div>
    </main>
  );
}
