import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Scan, CheckCircle2 } from "lucide-react";

export function AiExpertSection() {
  return (
    <section className="bg-ioma-black text-white py-24 overflow-hidden relative">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Showcase */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-md overflow-hidden bg-muted/10 border border-white/10 p-6 flex items-center justify-center">
            <Image
              src="/images/homepage/diagnosis-device.png"
              alt="AI Skin Expert 2.0 Scanning Interface"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ioma-black via-transparent to-transparent" />

            {/* Floating metric badges */}
            <div className="absolute bottom-6 inset-x-6 grid grid-cols-3 gap-2">
              {[
                { label: "Hydratation", value: "98%" },
                { label: "Rides & Fermeté", value: "Niveau 2" },
                { label: "Éclat & Teint", value: "Optimum" },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className="bg-background/90 text-foreground p-2.5 rounded-sm backdrop-blur-md border border-white/20 text-center shadow-lg"
                >
                  <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground block">
                    {m.label}
                  </span>
                  <span className="text-xs font-bold text-ioma-violet block mt-0.5">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Story & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-widest border border-white/20">
              <Scan className="size-3.5 text-ioma-violet" />
              <span>Intelligence Artificielle & MEMS</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl tracking-tight text-white">
              AI Skin Expert 2.0 <br />
              <span className="font-serif italic text-ioma-violet">
                Votre ordonnance beauté instantanée.
              </span>
            </h2>

            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Propulsé par les algorithmes exclusifs de l'Atlas de la Peau IOMA Paris
              (plus d'un million de diagnostics réalisés), notre outil d'analyse par
              selfie évalue vos 6 paramètres cutanés majeurs et compose votre routine sur
              mesure en 3 paliers.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Analyse haute résolution de la texture et des ridules en 15 secondes",
                "Recommandation dynamique en 3 formules : Essentiel, Complet, Premium",
                "Données biométriques chiffrées et confidentielles",
                "Validation et réévaluation possible dans nos instituts partenaires à Dubaï",
              ].map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-xs sm:text-sm text-white/90"
                >
                  <CheckCircle2 className="size-4 text-ioma-violet shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-ioma-violet hover:bg-ioma-violet/90 text-white uppercase tracking-widest font-semibold shadow-lg"
              >
                <Link href="/diagnosis" className="inline-flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <span>Lancer l'analyse IA</span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 uppercase tracking-widest font-semibold"
              >
                <Link href="/technology">
                  <span>En savoir plus</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
