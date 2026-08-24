"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { Volume2, VolumeX, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiExpertPresenceProps {
  isSpeaking?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  title?: string;
  subtitle?: string;
  spokenText?: string;
}

export function AiExpertPresence({
  isSpeaking = false,
  isMuted = false,
  onToggleMute,
  title,
  subtitle,
  spokenText,
}: AiExpertPresenceProps) {
  const t = useTranslations("Diagnosis.expert");
  const locale = useLocale() as Locale;

  const expertName = t("name");
  const expertTitle = t("title");

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-b from-card to-accent/20 p-6 md:p-8 shadow-sm">
      {/* Top Header: Expert identity + Audio control */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div
              className={`size-12 rounded-full border border-border bg-foreground text-background flex items-center justify-center font-display text-sm font-semibold tracking-wider transition-transform duration-500 ${
                isSpeaking ? "scale-105 ring-4 ring-foreground/20" : ""
              }`}
            >
              EP
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-medium tracking-wide text-foreground">
                {title || expertName}
              </h3>
              <span className="text-[0.65rem] bg-accent px-2 py-0.5 rounded-full text-muted-foreground uppercase tracking-widest font-medium border border-border/60">
                {t("verifiedBadge")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {subtitle || expertTitle}
            </p>
          </div>
        </div>

        {onToggleMute && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleMute}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            title={isMuted ? t("unmuteVoice") : t("muteVoice")}
          >
            {isMuted ? (
              <VolumeX className="size-4 text-muted-foreground" />
            ) : (
              <Volume2 className={`size-4 ${isSpeaking ? "text-emerald-500 animate-pulse" : ""}`} />
            )}
          </Button>
        )}
      </div>

      {/* Spoken Text Display */}
      {spokenText && (
        <div className="mt-5 rounded-lg border border-border/60 bg-background/80 p-4 text-xs md:text-sm leading-relaxed text-foreground font-normal">
          <div className="flex items-start gap-2.5">
            <Sparkles className="size-4 text-foreground shrink-0 mt-0.5 opacity-70" />
            <div className="space-y-1">
              <p className="whitespace-pre-wrap">{spokenText}</p>
            </div>
          </div>
        </div>
      )}

      {/* Audio Wave Visualizer when speaking */}
      {isSpeaking && (
        <div className="mt-4 flex items-center justify-center gap-1.5 py-1">
          <span className="h-2 w-1 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="h-3.5 w-1 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="h-5 w-1 bg-foreground rounded-full animate-bounce" />
          <span className="h-3.5 w-1 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-1 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="ms-2 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            {t("speakingStatus")}
          </span>
        </div>
      )}
    </div>
  );
}
