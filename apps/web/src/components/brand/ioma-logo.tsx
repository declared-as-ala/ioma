"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface IomaLogoProps {
  /** "white" only when black is unreadable against the background — see
   * DESIGN_SYSTEM.md "Logo". Never any other color. */
  variant?: "black" | "white";
  /** Show the "N°1 de la Cosmétique Personnalisée*" claim beneath the mark. */
  withClaim?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export function IomaLogo({
  variant = "black",
  withClaim = false,
  className,
  width = 140,
  height = 58,
}: IomaLogoProps) {
  const [imageError, setImageError] = useState(false);
  const color = variant === "white" ? "text-ioma-white" : "text-ioma-black";

  return (
    <span className={cn("inline-flex flex-col items-center gap-0.5", className)}>
      {!imageError ? (
        <Image
          src="/images/ioma-logo.avif"
          alt="IOMA Paris"
          width={width}
          height={height}
          priority
          unoptimized
          onError={() => setImageError(true)}
          className={cn(
            "h-10 w-auto object-contain transition-all duration-200",
            variant === "white" && "brightness-0 invert",
          )}
        />
      ) : (
        <span
          className={cn(
            "inline-flex select-none flex-col items-start gap-0.5 leading-none",
            color,
          )}
        >
          <span className="flex items-baseline gap-2">
            <span className="font-display text-2xl italic tracking-tight lowercase">
              ioma
            </span>
            <span className="text-[0.6rem] font-medium tracking-[0.25em] uppercase">
              Paris
            </span>
          </span>
        </span>
      )}
      {withClaim && (
        <span className="text-[0.55rem] tracking-tight text-muted-foreground text-center">
          N°1 de la Cosmétique Personnalisée*
        </span>
      )}
    </span>
  );
}
