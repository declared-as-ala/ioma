"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Scan, ChevronDown } from "lucide-react";

export function CinematicHero() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Battery & GPU efficiency: pause video when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToNextSection = () => {
    if (containerRef.current) {
      const nextSection = containerRef.current.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      ref={containerRef}
      data-testid="cinematic-hero"
      className="relative w-full min-h-[85vh] sm:min-h-[92vh] flex items-end overflow-hidden bg-ioma-black text-white"
    >
      {/* ========================================================================= */}
      {/* 1. 60FPS HARDWARE-ACCELERATED NATIVE VIDEO BACKGROUND                     */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 size-full overflow-hidden">
        {/* Instant high-res poster (0 delay) */}
        <Image
          src="/images/homepage/hero-video-poster.jpg"
          alt="IOMA Paris Haute Cosmétique"
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center select-none transition-opacity duration-700 ${
            isVideoLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />

        {/* 60fps Native Looping Video */}
        <video
          ref={videoRef}
          src="/videos/hero-campaign-opt.mp4"
          playsInline
          muted
          autoPlay
          loop
          preload="auto"
          poster="/images/homepage/hero-video-poster.jpg"
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => setIsVideoLoaded(true)}
          className="absolute inset-0 size-full object-cover object-center select-none pointer-events-none"
        >
          <source src="/videos/hero-campaign-opt.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ========================================================================= */}
      {/* 2. LUXURY EDITORIAL GRADIENTS & VIGNETTE                                 */}
      {/* ========================================================================= */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ioma-black via-ioma-black/50 to-ioma-black/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ioma-black/70 via-transparent to-ioma-black/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_20%,rgba(0,0,0,0.6)_85%)]"
      />

      {/* ========================================================================= */}
      {/* 3. HERO EDITORIAL CONTENT & CALLS TO ACTION                               */}
      {/* ========================================================================= */}
      <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12 pb-16 sm:pb-20 pt-32 z-10">
        <div className="max-w-3xl">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[11px] uppercase tracking-[0.2em] text-white/90 font-medium mb-4">
            <span className="inline-block size-1.5 rounded-full bg-ioma-violet shadow-[0_0_8px_#aa9feb] animate-pulse" />
            <span>{t("hero.kicker")}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
            {t("hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-white/90 font-light drop-shadow-md">
            {t("hero.subtitle")}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              data-testid="hero-primary-cta"
              className="bg-ioma-violet hover:bg-ioma-violet/90 text-white uppercase tracking-widest font-semibold shadow-[0_4px_25px_rgba(170,159,235,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/diagnosis" className="inline-flex items-center gap-2">
                <Sparkles className="size-4" />
                <span>{t("hero.diagnosisCta")}</span>
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              data-testid="hero-secondary-cta"
              className="border-white/40 bg-black/30 backdrop-blur-sm text-white uppercase tracking-widest hover:bg-white/20 hover:text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/shop" className="inline-flex items-center gap-2">
                <span>{t("hero.shopCta")}</span>
              </Link>
            </Button>
          </div>

          {/* Scientific Precision Quick Badges */}
          <div className="mt-10 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Scan className="size-4 text-ioma-violet shrink-0" />
              <span>18 paramètres cutanés</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Sur-mesure In.Lab</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/80">
              <span className="font-semibold text-white">100%</span>
              <span>Made in Paris, France</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FAST SCROLL CUE TO NEXT SECTION                                       */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={scrollToNextSection}
        aria-label="Scroll to discover products"
        className="absolute bottom-4 end-6 sm:end-12 z-20 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer group"
      >
        <span className="hidden sm:inline font-medium">Découvrir les soins</span>
        <div className="size-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/15 transition-all">
          <ChevronDown className="size-4 text-white/80 group-hover:translate-y-0.5 transition-transform" />
        </div>
      </button>
    </section>
  );
}
