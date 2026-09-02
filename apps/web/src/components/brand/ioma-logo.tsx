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
  return (
    <span className={cn("inline-flex flex-col items-center gap-1", className)}>
      <Image
        src="/ioma_paris_logo_280x117_19776788-8360-4380-ac89-b055c196a1be.avif"
        alt="IOMA Paris"
        width={width}
        height={height}
        priority
        className={cn(
          "h-auto w-auto max-h-12 object-contain transition-all duration-200",
          variant === "white" && "brightness-0 invert",
        )}
      />
      {withClaim && (
        <span className="text-[0.55rem] tracking-tight text-muted-foreground text-center">
          N°1 de la Cosmétique Personnalisée*
        </span>
      )}
    </span>
  );
}
