"use client";

import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { IomaLogo } from "@/components/brand/ioma-logo";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  variant?: "luxury" | "admin" | "minimal";
  className?: string;
  fullScreen?: boolean;
}

export function PageLoader({
  label,
  variant = "luxury",
  className,
  fullScreen = true,
}: PageLoaderProps) {
  const t = useTranslations("Nav");
  const displayLabel = label || t("loadingLive") || "Loading live data…";

  if (variant === "admin") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={displayLabel}
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center transition-all duration-300",
          fullScreen ? "min-h-[70vh] w-full" : "py-16",
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          {/* Outer glowing ring */}
          <div className="absolute size-14 rounded-full border-2 border-primary/20 animate-ping" />
          {/* Inner rotating spinner */}
          <div className="flex size-12 items-center justify-center rounded-full border-2 border-primary border-t-transparent animate-spin">
            <Loader2 className="size-5 text-primary animate-pulse" />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground/80">
            {displayLabel}
          </p>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-[shimmer_1.5s_infinite] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={displayLabel}
        className={cn(
          "flex items-center justify-center gap-3 py-8 text-muted-foreground",
          className
        )}
      >
        <Loader2 className="size-4 animate-spin text-primary" />
        <span className="text-xs tracking-wider uppercase font-medium">
          {displayLabel}
        </span>
      </div>
    );
  }

  // Luxury Default Theme (Matching IOMA Paris editorial identity)
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={displayLabel}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden bg-background text-foreground transition-all duration-500",
        fullScreen ? "min-h-[75vh] w-full px-4" : "py-20 px-4",
        className
      )}
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <div className="size-96 rounded-full bg-ioma-violet/15 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Pulsing Brand Mark */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-ioma-violet/20 via-primary/10 to-ioma-violet/20 blur-md animate-pulse" />
          <div className="relative flex items-center justify-center rounded-full bg-background/80 p-4 backdrop-blur-sm border border-border/50 shadow-sm">
            <IomaLogo variant="black" className="scale-110" />
          </div>
        </div>

        {/* Dynamic Loading Shimmer Bar */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] font-medium text-foreground/75">
            <Sparkles className="size-3 text-ioma-violet animate-spin" />
            <span>{displayLabel}</span>
          </div>

          <div className="relative h-0.5 w-48 overflow-hidden rounded-full bg-border/40">
            <div className="absolute inset-y-0 left-0 w-1/3 animate-[loading-bar_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-ioma-violet to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0"
          >
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
