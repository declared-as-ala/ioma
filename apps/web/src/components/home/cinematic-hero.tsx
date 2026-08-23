"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Sparkles, ArrowRight, Scan, ShieldCheck, Play, Pause } from "lucide-react";

export function CinematicHero() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Video ready state
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pointer position for subtle desktop micro-interaction
  const [canHover, setCanHover] = useState(false);
  const mouseX = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 120, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);

  // Parallax shifts derived from smooth mouse coordinates (desktop only, max ±4px / ±6px)
  const bgParallaxX = useTransform(smoothMouseX, [-1, 1], [-4, 4]);
  const fgParallaxX = useTransform(smoothMouseX, [-1, 1], [6, -6]);

  useEffect(() => {
    // Enable mouse parallax only on devices with precision pointer (desktop)
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mediaQuery.matches);

    const handleMouseMove = (e: MouseEvent) => {
      if (!mediaQuery.matches || shouldReduceMotion) return;
      const { innerWidth } = window;
      const nx = (e.clientX / innerWidth) * 2 - 1;
      mouseX.set(nx);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, shouldReduceMotion]);

  // Track scroll progress through the pinned container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Spring-smoothed scroll progress for organic fluid motion
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // ==========================================
  // NATIVE 60FPS BACKGROUND VIDEO PLAYBACK
  // ==========================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldReduceMotion) return;

    // Use IntersectionObserver to pause video when scrolled away to save GPU / battery
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.05 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  // ==========================================
  // SCROLL-DRIVEN MOTION MAPPINGS
  // ==========================================

  // 1. Background Media Camera Push & Fade
  const bgScale = useTransform(
    smoothProgress,
    [0, 0.35, 0.7, 1.0],
    [1.0, 1.03, 1.06, 1.08],
  );
  const bgOpacity = useTransform(smoothProgress, [0, 0.75, 1.0], [1.0, 0.95, 0.75]);
  const bgY = useTransform(smoothProgress, [0, 1.0], [0, -25]);

  // 2. Editorial Frame Transition (Phase 4 Unfolding)
  const frameScale = useTransform(
    smoothProgress,
    [0, 0.72, 0.96, 1.0],
    [1.0, 1.0, 0.965, 0.95],
  );
  const frameRadius = useTransform(smoothProgress, [0, 0.72, 0.96, 1.0], [0, 0, 16, 24]);
  const frameShadow = useTransform(
    smoothProgress,
    [0, 0.72, 1.0],
    [
      "0 0 0 rgba(0,0,0,0)",
      "0 20px 50px rgba(0,0,0,0.3)",
      "0 30px 70px rgba(0,0,0,0.45)",
    ],
  );

  // 3. Phase 1 — Initial Editorial Headline & CTAs
  const phase1Opacity = useTransform(smoothProgress, [0, 0.16, 0.26], [1, 0.7, 0]);
  const phase1Y = useTransform(smoothProgress, [0, 0.26], [0, -35]);
  const phase1PointerEvents = useTransform(smoothProgress, (p): "auto" | "none" =>
    p > 0.22 ? "none" : "auto",
  );

  // 4. Scroll Cue Fade
  const scrollCueOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);
  const scrollCueY = useTransform(smoothProgress, [0, 0.08], [0, 12]);

  // 5. Phase 2 — Skin Intelligence & Scientific Precision Layer
  const phase2Opacity = useTransform(
    smoothProgress,
    [0.18, 0.28, 0.52, 0.62],
    [0, 1, 1, 0],
  );
  const phase2Y = useTransform(smoothProgress, [0.18, 0.28, 0.52, 0.62], [30, 0, 0, -25]);
  const phase2Scale = useTransform(
    smoothProgress,
    [0.18, 0.28, 0.52, 0.62],
    [0.97, 1, 1, 1.02],
  );
  const probeLayerY = useTransform(smoothProgress, [0.15, 0.65], [60, -40]);
  const probeLayerScale = useTransform(smoothProgress, [0.15, 0.65], [0.95, 1.04]);

  // 6. Phase 3 — Second Editorial Message: "SUR-MESURE. PRÉCISION. IOMA."
  const phase3Opacity = useTransform(smoothProgress, [0.5, 0.6, 0.8, 0.9], [0, 1, 1, 0]);
  const phase3Y = useTransform(smoothProgress, [0.5, 0.6, 0.8, 0.9], [40, 0, 0, -30]);
  const phase3PointerEvents = useTransform(smoothProgress, (p): "auto" | "none" =>
    p >= 0.55 && p <= 0.85 ? "auto" : "none",
  );

  // 7. Phase 4 — Transition Unfolding Light Base Layer
  const lightPanelY = useTransform(smoothProgress, [0.75, 1.0], ["100%", "0%"]);
  const lightPanelOpacity = useTransform(
    smoothProgress,
    [0.75, 0.95, 1.0],
    [0, 0.85, 1.0],
  );

  // Optional manual play/pause toggle for user convenience
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // ==========================================
  // REDUCED MOTION STATIC FALLBACK
  // ==========================================
  if (shouldReduceMotion) {
    return (
      <section
        data-testid="cinematic-hero"
        className="relative flex min-h-[90svh] items-end overflow-hidden bg-ioma-black text-ioma-white"
      >
        <Image
          src="/images/homepage/hero-video-poster.jpg"
          alt="IOMA Paris Haute Cosmétique"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ioma-black via-ioma-black/60 to-ioma-black/20"
        />

        <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-6 pb-20 pt-32">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-heading text-ioma-violet font-semibold">
            <span className="inline-block size-1.5 rounded-full bg-ioma-violet" />
            <span>{t("hero.kicker")}</span>
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight">
            {t("hero.title")}
          </h1>

          <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-ioma-white/80">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              data-testid="hero-primary-cta"
              className="bg-ioma-violet hover:bg-ioma-violet/90 text-white uppercase tracking-widest font-semibold shadow-lg"
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
              className="border-ioma-white/40 bg-transparent text-ioma-white uppercase tracking-widest hover:bg-ioma-white/10 font-semibold"
            >
              <Link href="/shop">{t("hero.shopCta")}</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // PINNED CINEMATIC SCROLL HERO (VIDEO-DRIVEN)
  // ==========================================
  return (
    <div
      ref={containerRef}
      data-testid="cinematic-hero"
      className="relative w-full h-[180vh] md:h-[200vh] max-sm:h-[120svh] bg-ioma-black overflow-x-clip"
    >
      {/* Sticky Viewport Stage: Pinned during scroll storytelling */}
      <div className="sticky top-0 h-svh w-full overflow-hidden flex items-center justify-center">
        {/* Dynamic Editorial Frame Wrapper (Transforms into Magazine Frame in Phase 4) */}
        <motion.div
          style={{
            scale: frameScale,
            borderRadius: frameRadius,
            boxShadow: frameShadow,
          }}
          className="relative w-full h-full overflow-hidden bg-ioma-black will-change-transform"
        >
          {/* ========================================================= */}
          {/* LAYER 1: CINEMATIC 60FPS AMBIENT VIDEO BACKGROUND         */}
          {/* ========================================================= */}
          <motion.div
            style={{
              scale: bgScale,
              opacity: bgOpacity,
              y: bgY,
              x: canHover ? bgParallaxX : 0,
            }}
            className="absolute inset-0 size-full will-change-transform overflow-hidden"
          >
            {/* High-res Poster image visible instantly before any video byte is fetched */}
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

            {/* Hardware-accelerated 60fps Native Video Element */}
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
          </motion.div>

          {/* ========================================================= */}
          {/* LAYER 2: AMBIENT LUXURY VIGNETTE & LIGHT GRADIENTS        */}
          {/* ========================================================= */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ioma-black via-ioma-black/40 to-ioma-black/30"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ioma-black/60 via-transparent to-ioma-black/60"
          />
          {/* Subtle radial luxury glow around skin focus */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_20%,rgba(0,0,0,0.55)_80%)]"
          />

          {/* Optional subtle video control pill */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              isPlaying ? "Pause cinematic background" : "Play cinematic background"
            }
            className="absolute top-28 end-6 z-25 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-ioma-white/20 bg-ioma-black/40 backdrop-blur-md text-[0.65rem] uppercase tracking-wider text-ioma-white/70 hover:text-ioma-white hover:bg-ioma-black/60 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="size-3 text-ioma-violet" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="size-3 text-ioma-violet" />
                <span>Motion Active</span>
              </>
            )}
          </button>

          {/* ========================================================= */}
          {/* LAYER 3: INDEPENDENT PROBE / DEPTH ACCENT (PHASE 2 DEPTH) */}
          {/* ========================================================= */}
          <motion.div
            style={{
              opacity: phase2Opacity,
              y: probeLayerY,
              scale: probeLayerScale,
              x: canHover ? fgParallaxX : 0,
            }}
            className="pointer-events-none absolute right-4 sm:right-12 lg:right-24 top-1/4 sm:top-1/3 w-44 sm:w-64 lg:w-80 aspect-square hidden sm:block will-change-transform"
          >
            <div className="relative size-full rounded-full border border-ioma-white/10 bg-ioma-violet/5 p-6 backdrop-blur-[2px]">
              <Image
                src="/images/homepage/diagnosis-device.png"
                alt="IOMA Sphere Technology"
                fill
                sizes="320px"
                className="object-contain p-4 drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
              />
              {/* Pulsing reticle ring */}
              <div className="absolute inset-0 rounded-full border border-ioma-violet/20 animate-ping opacity-25" />
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* LAYER 4: PHASE 1 — INITIAL EDITORIAL HEADLINE & CTAS      */}
          {/* ========================================================= */}
          <motion.div
            data-testid="hero-phase-1"
            style={{
              opacity: phase1Opacity,
              y: phase1Y,
              pointerEvents: phase1PointerEvents,
            }}
            className="absolute inset-x-0 bottom-0 pb-20 sm:pb-24 lg:pb-28 pt-36 px-4 md:px-8 lg:px-12 flex flex-col justify-end size-full max-w-[1440px] mx-auto z-10 will-change-transform"
          >
            {/* Brand Eyebrow with elegant initial reveal */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-heading text-ioma-white/80 font-medium"
            >
              <span className="inline-block size-1.5 rounded-full bg-ioma-violet shadow-[0_0_8px_#aa9feb]" />
              <span className="tracking-[0.18em]">{t("hero.kicker")}</span>
            </motion.div>

            {/* Editorial Headline with typographic reveal */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 max-w-4xl font-display text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-ioma-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            >
              {t("hero.title")}
            </motion.h1>

            {/* Supporting Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-ioma-white/85 font-light"
            >
              {t("hero.subtitle")}
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Button
                asChild
                size="lg"
                data-testid="hero-primary-cta"
                className="bg-ioma-violet hover:bg-ioma-violet/90 text-white uppercase tracking-widest font-semibold shadow-[0_4px_20px_rgba(170,159,235,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                className="border-ioma-white/40 bg-ioma-black/30 backdrop-blur-sm text-ioma-white uppercase tracking-widest hover:bg-ioma-white/15 hover:text-ioma-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href="/shop" className="inline-flex items-center gap-2">
                  <span>{t("hero.shopCta")}</span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* ========================================================= */}
          {/* LAYER 5: PHASE 2 — SCIENTIFIC & DIAGNOSTIC INTELLIGENCE   */}
          {/* ========================================================= */}
          <motion.div
            data-testid="hero-phase-2"
            style={{
              opacity: phase2Opacity,
              y: phase2Y,
              scale: phase2Scale,
              x: canHover ? fgParallaxX : 0,
            }}
            className="pointer-events-none absolute inset-0 flex flex-col justify-center px-4 md:px-12 lg:px-20 max-w-[1440px] mx-auto z-20 will-change-transform"
          >
            {/* Top diagnostic status bar */}
            <div className="flex items-center justify-between border-b border-ioma-white/15 pb-4 max-w-xl">
              <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-ioma-violet font-semibold">
                <Scan className="size-3.5 animate-pulse text-ioma-violet" />
                <span>{t("hero.phase2Tag")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest text-ioma-white/60">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE 2026</span>
              </div>
            </div>

            {/* Diagnostic metrics list (Ultra-luxury clinical presentation) */}
            <div className="mt-8 space-y-4 max-w-md">
              {/* Metric 1: Hydratation */}
              <div className="rounded-sm border border-ioma-white/10 bg-ioma-black/40 backdrop-blur-md p-3.5 transition-all">
                <div className="flex items-center justify-between text-xs tracking-wider">
                  <span className="text-ioma-white/70 uppercase">
                    {t("hero.phase2Metric1")}
                  </span>
                  <span className="font-semibold text-ioma-white">
                    {t("hero.phase2Metric1Val")}
                  </span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ioma-white/10">
                  <div className="h-full w-[94%] bg-gradient-to-r from-ioma-violet/50 to-ioma-violet rounded-full" />
                </div>
              </div>

              {/* Metric 2: Indice d'Éclat */}
              <div className="rounded-sm border border-ioma-white/10 bg-ioma-black/40 backdrop-blur-md p-3.5 transition-all">
                <div className="flex items-center justify-between text-xs tracking-wider">
                  <span className="text-ioma-white/70 uppercase">
                    {t("hero.phase2Metric2")}
                  </span>
                  <span className="font-semibold text-ioma-white">
                    {t("hero.phase2Metric2Val")}
                  </span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ioma-white/10">
                  <div className="h-full w-[88%] bg-gradient-to-r from-ioma-violet/50 to-ioma-violet rounded-full" />
                </div>
              </div>

              {/* Metric 3: Fermeté Cellulaire */}
              <div className="rounded-sm border border-ioma-white/10 bg-ioma-black/40 backdrop-blur-md p-3.5 transition-all">
                <div className="flex items-center justify-between text-xs tracking-wider">
                  <span className="text-ioma-white/70 uppercase">
                    {t("hero.phase2Metric3")}
                  </span>
                  <span className="font-semibold text-ioma-white">
                    {t("hero.phase2Metric3Val")}
                  </span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ioma-white/10">
                  <div className="h-full w-[96%] bg-gradient-to-r from-ioma-violet/50 to-ioma-violet rounded-full" />
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-ioma-white/60 max-w-sm tracking-wider uppercase">
              18 paramètres biométriques • Lecture photométrique instantanée
            </p>
          </motion.div>

          {/* ========================================================= */}
          {/* LAYER 6: PHASE 3 — EDITORIAL MESSAGE TRANSFORMATION       */}
          {/* ========================================================= */}
          <motion.div
            data-testid="hero-phase-3"
            style={{
              opacity: phase3Opacity,
              y: phase3Y,
              pointerEvents: phase3PointerEvents,
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-8 max-w-4xl mx-auto z-25 will-change-transform"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ioma-white/20 bg-ioma-white/10 backdrop-blur-sm text-[0.65rem] uppercase tracking-[0.2em] text-ioma-white mb-6">
              <ShieldCheck className="size-3 text-ioma-violet" />
              <span>{t("hero.phase3Badge")}</span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-ioma-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
              {t("hero.phase3Title")}
            </h2>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-ioma-white/90 font-light drop-shadow-md">
              {t("hero.phase3Subtitle")}
            </p>

            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="bg-ioma-white hover:bg-ioma-white/90 text-ioma-black uppercase tracking-widest font-bold shadow-[0_4px_25px_rgba(255,255,255,0.25)] transition-all hover:scale-105"
              >
                <Link href="/diagnosis" className="inline-flex items-center gap-2">
                  <span>{t("hero.phase3Cta")}</span>
                  <ArrowRight className={`size-4 ${isRtl ? "rotate-180" : ""}`} />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* LAYER 7: MINIMAL PROGRESSING SCROLL INDICATOR CUE         */}
          {/* ========================================================= */}
          <motion.div
            data-testid="hero-scroll-cue"
            style={{
              opacity: scrollCueOpacity,
              y: scrollCueY,
            }}
            className="pointer-events-none absolute bottom-6 inset-x-0 flex flex-col items-center justify-center gap-2 text-center z-15"
          >
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-ioma-white/60 font-medium">
              {t("hero.scrollIndicator")}
            </span>
            <div className="relative w-[1px] h-8 bg-ioma-white/20 overflow-hidden">
              <motion.div
                animate={{ y: ["-100%", "100%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
                className="w-full h-1/2 bg-gradient-to-b from-transparent via-ioma-violet to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* ========================================================= */}
        {/* LAYER 8: PHASE 4 SEAMLESS UNFOLDING LIGHT PANEL           */}
        {/* ========================================================= */}
        <motion.div
          aria-hidden
          style={{
            y: lightPanelY,
            opacity: lightPanelOpacity,
          }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent z-30 will-change-transform"
        />
      </div>
    </div>
  );
}
