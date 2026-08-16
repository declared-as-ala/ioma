import { cn } from "@/lib/utils";

interface IomaLogoProps {
  /** "white" only when black is unreadable against the background — see
   * DESIGN_SYSTEM.md "Logo". Never any other color. */
  variant?: "black" | "white";
  /** Show the "N°1 de la Cosmétique Personnalisée*" claim beneath the mark. */
  withClaim?: boolean;
  className?: string;
}

/**
 * No official logo vector file exists yet (see CLIENT_REQUIREMENTS.md).
 * This is a typographic approximation of the charter's wordmark — lowercase
 * "ioma" with a dotted "i", small-caps "PARIS" signature beneath — built to
 * the charter's proportion/spacing rules (DESIGN_SYSTEM.md "Logo"), not a
 * traced vector. Replace the markup here with the licensed SVG the moment
 * it's supplied; nothing else in the app references the logo internals
 * directly, only this component.
 */
export function IomaLogo({
  variant = "black",
  withClaim = false,
  className,
}: IomaLogoProps) {
  const color = variant === "white" ? "text-ioma-white" : "text-ioma-black";

  return (
    <span
      className={cn(
        "inline-flex select-none flex-col items-start gap-0.5 leading-none",
        color,
        className,
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
      {withClaim && (
        <span className="text-[0.55rem] tracking-tight text-muted-foreground">
          N°1 de la Cosmétique Personnalisée*
        </span>
      )}
    </span>
  );
}
