import type { Metadata } from "next";
import { Manrope, Jost, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { isRtl, type Locale } from "@ioma/config";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/components/providers/query-provider";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { RouteProgressBar } from "@/components/motion/route-progress-bar";
import { PageTransition } from "@/components/motion/page-transition";
import { ToastContainer } from "@/components/ui/toast";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { BottomTabBarSpacer } from "@/components/layout/bottom-tab-bar-spacer";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import "../globals.css";

// Gotham/Futura PT substitutes until licensed font files are supplied (see
// DESIGN_SYSTEM.md, DECISIONS.md, CLIENT_REQUIREMENTS.md). Cairo covers the
// `ar` locale — the charter specifies no Arabic typeface, so a geometric
// Arabic sans that pairs visually with Gotham/Futura was chosen deliberately
// rather than defaulting to a generic system font.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-jost",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IOMA Paris | Dubai",
  description:
    "IOMA Paris — N°1 de la Cosmétique Personnalisée. The official IOMA Paris digital flagship for Dubai and the UAE.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const dir = isRtl(locale as Locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${manrope.variable} ${jost.variable} ${cairo.variable}`}
    >
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <OrganizationJsonLd />
            <RouteProgressBar />
            <Header />
            <PageTransition>{children}</PageTransition>
            <Footer />
            <BottomTabBarSpacer />
            <CartDrawer />
            <ToastContainer />
            <BottomTabBar />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
