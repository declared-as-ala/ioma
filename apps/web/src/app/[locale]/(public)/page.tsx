import { useTranslations } from "next-intl";
import Image from "next/image";
import { PRODUCT_RANGE_COLORS, type ProductRangeKey } from "@ioma/config";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { SoftBlurIn } from "@/components/motion/soft-blur-in";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CtaArrow } from "@/components/ui/cta-arrow";
import { FeaturedProducts } from "@/components/shop/featured-products";

const RANGE_ORDER: ProductRangeKey[] = [
  "hydra",
  "energize",
  "renew",
  "calm",
  "purete",
  "matte",
  "illumine",
];

const DIAGNOSIS_METRICS = [
  "metric1",
  "metric2",
  "metric3",
  "metric4",
  "metric5",
  "metric6",
] as const;

// Sprint 3 homepage, restructured to match the client-approved reference
// layout. Featured Products (deferred in Sprint 3 pending real catalog
// data — see CLAUDE.md "Rules Against Placeholders") was built in Sprint 4
// once /products became real; see components/shop/featured-products.tsx.
// The "Résultats visibles" stat band keeps the reference's visual design
// but the numbers are shown pending real data rather than invented — see
// PROGRESS.md and CLAUDE.md ("never invent clinical claims/percentages").
//
// Imagery: no real IOMA product/campaign photography exists yet (see
// CLIENT_REQUIREMENTS.md). public/images/homepage/* are AI-generated,
// non-branded editorial stand-ins (no logos, no product bottles with
// visible branding, no invented claims) — replace with licensed
// photography when supplied, no component changes needed beyond the file.
export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-ioma-black text-ioma-white">
        <Image
          src="/images/homepage/hero-portrait.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ioma-black via-ioma-black/50 to-transparent"
        />
        <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-6 pb-20">
          <p className="text-xs uppercase tracking-heading text-ioma-white/70">
            {t("hero.kicker")}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl tracking-wide sm:text-6xl">
            <SoftBlurIn>{t("hero.title")}</SoftBlurIn>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ioma-white/70">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="uppercase tracking-widest"
            >
              <Link href="/diagnosis">{t("hero.diagnosisCta")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ioma-white/40 bg-transparent text-ioma-white uppercase tracking-widest hover:bg-ioma-white/10 hover:text-ioma-white"
            >
              <Link href="/shop">{t("hero.shopCta")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* La Maison */}
      <ScrollReveal>
        <section className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
          <p className="text-xs uppercase tracking-heading text-muted-foreground">
            {t("maison.label")}
          </p>
          <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-16">
            <h2 className="font-display text-3xl sm:text-4xl">{t("maison.title")}</h2>
            <div>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                {t("maison.body")}
              </p>
              <Button
                asChild
                variant="link"
                className="mt-4 px-0 uppercase tracking-widest"
              >
                <Link href="/maison" className="inline-flex items-center gap-1.5">
                  {t("maison.cta")} <CtaArrow />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Diagnosis */}
      <ScrollReveal>
        <section className="mx-auto grid max-w-[1440px] gap-8 px-4 md:px-6 pb-24 md:grid-cols-2 md:items-center md:gap-16">
          <div className="relative h-72 overflow-hidden rounded-md bg-ioma-black sm:h-[32rem]">
            <Image
              src="/images/homepage/diagnosis-device.png"
              alt="Close-up of a skin-diagnosis device in use, soft violet light on skin"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-heading text-muted-foreground">
              {t("diagnosis.label")}
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">
              {t("diagnosis.title")}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              {t("diagnosis.body")}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-6 md:grid-cols-3 md:gap-x-6">
              {DIAGNOSIS_METRICS.map((key) => (
                <span
                  key={key}
                  className="text-xs uppercase tracking-widest text-foreground/80"
                >
                  {t(`diagnosis.${key}`)}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="uppercase tracking-widest">
                <Link href="/diagnosis">{t("diagnosis.diagnosisCta")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="uppercase tracking-widest"
              >
                <Link href="/booking" prefetch={false}>
                  {t("diagnosis.bookCta")}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Ranges */}
      <ScrollReveal>
        <section className="mx-auto max-w-[1440px] px-4 md:px-6 pb-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-lg font-display text-3xl sm:text-4xl">
              {t("ranges.title")}
            </h2>
            <Button asChild variant="link" className="px-0 uppercase tracking-widest">
              <Link href="/shop" className="inline-flex items-center gap-1.5">
                {t("ranges.cta")} <CtaArrow />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md bg-border sm:grid-cols-2 lg:grid-cols-4">
            {RANGE_ORDER.map((range) => (
              <Link
                key={range}
                href={{ pathname: "/shop", query: { range } }}
                data-range={range}
                className="group flex flex-col gap-3 bg-background p-6 transition-colors hover:bg-accent"
              >
                <span
                  aria-hidden
                  className="h-2 w-8 rounded-full"
                  style={{ backgroundColor: PRODUCT_RANGE_COLORS[range] }}
                />
                <span className="font-display text-lg capitalize">{range}</span>
                <span className="text-sm text-muted-foreground">
                  {t(`ranges.${range}`)}
                </span>
              </Link>
            ))}
            <Link
              href="/shop"
              className="flex flex-col items-start justify-center gap-2 bg-background p-6 transition-colors hover:bg-accent"
            >
              <span className="inline-flex items-center gap-1.5 text-sm uppercase tracking-widest">
                {t("ranges.cta")} <CtaArrow />
              </span>
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* Featured products */}
      <ScrollReveal>
        <section className="mx-auto max-w-[1440px] px-4 md:px-6 pb-24">
          <p className="text-xs uppercase tracking-heading text-muted-foreground">
            {t("featured.label")}
          </p>
          <h2 className="mt-4 max-w-lg font-display text-3xl sm:text-4xl">
            {t("featured.title")}
          </h2>
          <FeaturedProducts />
        </section>
      </ScrollReveal>

      {/* Visible results */}
      <ScrollReveal>
        <section className="bg-ioma-black px-4 md:px-6 py-24 text-ioma-white">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-xs uppercase tracking-heading text-ioma-white/60">
              {t("results.label")}
            </p>
            <h2 className="mt-4 max-w-lg font-display text-3xl sm:text-4xl">
              {t("results.title")}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ioma-white/70">
              {t("results.intro")}
            </p>
            <div className="mt-12 grid gap-10 border-t border-ioma-white/15 pt-10 sm:grid-cols-3">
              {(["stat1Caption", "stat2Caption", "stat3Caption"] as const).map((key) => (
                <div key={key}>
                  <p className="font-display text-4xl text-ioma-violet">—</p>
                  <p className="mt-2 max-w-[16rem] text-sm text-ioma-white/70">
                    {t(`results.${key}`)}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-10 max-w-xl text-xs leading-relaxed text-ioma-white/40">
              {t("results.disclaimer")}
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Soins / Partners */}
      <ScrollReveal>
        <section className="mx-auto grid max-w-[1440px] gap-8 px-4 md:px-6 py-24 md:grid-cols-2 md:gap-8">
          <div>
            <div className="relative h-64 overflow-hidden rounded-md bg-ioma-grey-100 sm:h-80">
              <Image
                src="/images/homepage/product-bottle.png"
                alt="Minimalist product photography of a skincare bottle"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="mt-6 text-xs uppercase tracking-heading text-muted-foreground">
              {t("soins.label")}
            </p>
            <h3 className="mt-2 font-display text-2xl">{t("soins.title")}</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("soins.body")}
            </p>
            <Button
              asChild
              variant="link"
              className="mt-3 px-0 uppercase tracking-widest"
            >
              <Link href="/treatments" className="inline-flex items-center gap-1.5">
                {t("soins.cta")} <CtaArrow />
              </Link>
            </Button>
          </div>
          <div>
            <div className="relative h-64 overflow-hidden rounded-md bg-ioma-grey-100 sm:h-80">
              <Image
                src="/images/homepage/spa-interior.png"
                alt="Minimalist luxury spa interior"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="mt-6 text-xs uppercase tracking-heading text-muted-foreground">
              {t("partners.label")}
            </p>
            <h3 className="mt-2 font-display text-2xl">{t("partners.title")}</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("partners.body")}
            </p>
            <Button
              asChild
              variant="link"
              className="mt-3 px-0 uppercase tracking-widest"
            >
              <Link href="/partners" className="inline-flex items-center gap-1.5">
                {t("partners.cta")} <CtaArrow />
              </Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>

      {/* Professionals band */}
      <ScrollReveal>
        <section className="bg-accent px-4 md:px-6 py-24 text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="font-display text-3xl">{t("professionals.title")}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t("professionals.body")}
            </p>
            <Button asChild size="lg" className="mt-8 uppercase tracking-widest">
              <Link href="/professionals">{t("professionals.cta")}</Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>

      {/* Journal */}
      <ScrollReveal>
        <section className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-heading text-muted-foreground">
                {t("journal.label")}
              </p>
              <h2 className="mt-4 max-w-lg font-display text-3xl sm:text-4xl">
                {t("journal.title")}
              </h2>
            </div>
            <Button asChild variant="link" className="px-0 uppercase tracking-widest">
              <Link href="/journal" className="inline-flex items-center gap-1.5">
                {t("journal.cta")} <CtaArrow />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
            {(
              [
                {
                  kicker: t("journal.article1Kicker"),
                  title: t("journal.article1Title"),
                  slug: "dubai-summer-barrier-routine",
                },
                {
                  kicker: t("journal.article2Kicker"),
                  title: t("journal.article2Title"),
                  slug: "reading-a-diagnosis",
                },
              ] as const
            ).map((article) => (
              <Link
                key={article.slug}
                href={`/journal/${article.slug}`}
                className="group"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {article.kicker}
                </p>
                <p className="mt-2 font-display text-xl transition-colors group-hover:text-muted-foreground">
                  {article.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Appointment CTA */}
      <ScrollReveal>
        <section className="bg-ioma-black px-4 md:px-6 py-24 text-center text-ioma-white">
          <div className="mx-auto max-w-xl">
            <h2 className="font-display text-3xl">{t("appointment.title")}</h2>
            <p className="mt-4 text-base leading-relaxed text-ioma-white/70">
              {t("appointment.body")}
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-8 uppercase tracking-widest"
            >
              <Link href="/booking" prefetch={false}>
                {t("appointment.cta")}
              </Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
