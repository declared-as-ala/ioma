"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@ioma/validation";
import { Link, useRouter } from "@/i18n/navigation";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/hooks/use-auth";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("Login");
  const router = useRouter();
  const mutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<"client" | "pro">("client");

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    mutation.mutate(values, {
      onSuccess: () => {
        if (accountType === "pro") {
          router.push("/portal");
        } else {
          router.push("/account");
        }
      },
    });
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] bg-background overflow-hidden flex flex-col justify-center">
      {/* Subtle Background Glow Decorative Accents */}
      <div className="pointer-events-none absolute -top-40 -start-40 size-96 rounded-full bg-ioma-violet/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -end-40 size-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* LEFT COLUMN: Luxury Form Container */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 xl:col-span-5 xl:col-start-2"
          >
            <div className="relative rounded-2xl border border-border/80 bg-background/95 p-6 md:p-10 shadow-xl backdrop-blur-xl transition-all">
              {/* Header Badge & Titles */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-ioma-violet/30 bg-ioma-violet/5 px-3 py-1 text-[0.7rem] uppercase tracking-widest text-ioma-violet">
                  <Sparkles className="size-3 text-ioma-violet" />
                  <span>IOMA Paris • Private Portal</span>
                </div>

                <h1 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
                  {t("title")}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sign in to manage your skin diagnostics, personalized routines, and
                  luxury prescriptions.
                </p>
              </div>

              {/* Role Switcher Tabs */}
              <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1.5 border border-border/50">
                <button
                  type="button"
                  onClick={() => setAccountType("client")}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs uppercase tracking-wider font-medium transition-all ${
                    accountType === "client"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UserCheck className="size-3.5" />
                  <span>Client Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("pro")}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs uppercase tracking-wider font-medium transition-all ${
                    accountType === "pro"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 className="size-3.5" />
                  <span>Pro Partner</span>
                </button>
              </div>

              {/* B2B Application Notice if Pro tab selected */}
              {accountType === "pro" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2"
                >
                  <Building2 className="size-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span>Professional clinic or spa? </span>
                    <Link
                      href="/professionals/apply"
                      className="font-semibold underline underline-offset-2 hover:text-foreground"
                    >
                      Apply for B2B partner access →
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Form Element */}
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                className="mt-8 space-y-5"
              >
                <FieldGroup className="space-y-4">
                  {/* Email Field */}
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                        <FieldLabel
                          htmlFor="login-email"
                          className="text-xs uppercase tracking-wider text-muted-foreground"
                        >
                          {t("emailLabel")}
                        </FieldLabel>
                        <div className="relative flex items-center">
                          <Mail className="absolute start-3.5 size-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            placeholder="your.email@ioma-paris.com"
                            aria-invalid={fieldState.invalid}
                            className="ps-10 h-12 rounded-xl border-border bg-background text-sm transition-all focus:border-ioma-violet focus:ring-1 focus:ring-ioma-violet"
                          />
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* Password Field */}
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <FieldLabel
                            htmlFor="login-password"
                            className="text-xs uppercase tracking-wider text-muted-foreground"
                          >
                            {t("passwordLabel")}
                          </FieldLabel>
                          <Link
                            href="/privacy-policy"
                            className="text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative flex items-center">
                          <Lock className="absolute start-3.5 size-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••••••"
                            aria-invalid={fieldState.invalid}
                            className="ps-10 pe-10 h-12 rounded-xl border-border bg-background text-sm transition-all focus:border-ioma-violet focus:ring-1 focus:ring-ioma-violet"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute end-3.5 text-muted-foreground hover:text-foreground transition-colors p-1"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* Generic Error Notification */}
                  {mutation.isError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2"
                    >
                      <span>{t("errorGeneric")}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={mutation.isPending}
                    className="w-full h-12 rounded-xl bg-foreground text-background font-semibold uppercase tracking-widest text-xs hover:bg-foreground/90 transition-all shadow-md group mt-2"
                  >
                    {mutation.isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        <span>{t("submitting")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>{t("submit")}</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                </FieldGroup>
              </form>

              {/* Registration Link */}
              <div className="mt-8 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
                <span>{t("noAccount")} </span>
                <Link
                  href="/register"
                  className="font-semibold text-foreground underline underline-offset-4 hover:text-ioma-violet transition-colors ms-1"
                >
                  {t("registerLink")}
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[0.7rem] uppercase tracking-wider text-muted-foreground/80">
                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>256-Bit Encrypted • Private & Secure</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Luxury Editorial Hero Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="hidden lg:col-span-6 lg:block xl:col-span-5"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border/50 shadow-2xl">
              {/* Background Luxury Skincare Image */}
              <Image
                src="/images/login-hero.png"
                alt="IOMA Paris High-Fashion Luxury Skincare"
                fill
                priority
                unoptimized
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Floating Glassmorphism Cards & Typography Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                {/* Top Badge */}
                <div className="flex justify-start">
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1.5 text-[0.65rem] font-medium uppercase tracking-widest text-white border border-white/30 shadow-sm">
                    HAUTE DERMA-COSMÉTIQUE PARIS
                  </span>
                </div>

                {/* Bottom Quote Card */}
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 text-white shadow-lg space-y-3">
                    <p className="font-display text-lg leading-snug tracking-tight text-white">
                      “Your skin is unique. Science reads its code, luxury prescribes its
                      perfection.”
                    </p>

                    <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-2 text-xs text-white/90">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                        <span>Instant Skin Code Access</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                        <span>Clinical Efficacy Reports</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[0.7rem] uppercase tracking-widest text-white/70 text-center">
                    Paris • Dubai • Worldwide Flagship Network
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
