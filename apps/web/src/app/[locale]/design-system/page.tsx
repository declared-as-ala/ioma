"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const BRAND_SWATCHES = [
  { name: "ioma-black", label: "IOMA Black" },
  { name: "ioma-white", label: "IOMA White", border: true },
  { name: "ioma-violet", label: "IOMA Violet" },
  { name: "ioma-silver", label: "IOMA Silver" },
] as const;

const RANGE_SWATCHES = [
  { name: "hydra", label: "Hydra" },
  { name: "energize", label: "Energize" },
  { name: "renew", label: "Renew" },
  { name: "calm", label: "Calm" },
  { name: "purete", label: "Pureté" },
  { name: "matte", label: "Matte" },
  { name: "illumine", label: "Illumine" },
] as const;

// Internal-only preview of every restyled design-system primitive, per
// SPRINTS.md Sprint 2 acceptance criteria. Not linked from public
// navigation; exists so tokens/components can be reviewed together in one
// place, in both LTR and RTL, before they're used across real pages.
export default function DesignSystemPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <main className="mx-auto max-w-[1440px] space-y-20 px-4 md:px-6 py-16">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-heading text-muted-foreground">
          Internal — not linked from navigation
        </p>
        <h1 className="font-display text-3xl">Design System</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every token and restyled primitive from <code>DESIGN_SYSTEM.md</code>, rendered
          together for review. Source of truth for colors/type:{" "}
          <code>IOMA_CHARTE_GRAPHIQUE_2026_FR.pdf</code>.
        </p>
      </header>

      {/* Colors */}
      <section className="space-y-6">
        <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
          Colors — Brand
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {BRAND_SWATCHES.map((swatch) => (
            <div key={swatch.name} className="space-y-2">
              <div
                className={`h-20 rounded-md ${"border" in swatch && swatch.border ? "border border-border" : ""}`}
                style={{ backgroundColor: `var(--color-${swatch.name})` }}
              />
              <p className="text-xs text-muted-foreground">{swatch.label}</p>
            </div>
          ))}
        </div>

        <h2 className="pt-4 text-xs uppercase tracking-heading text-muted-foreground">
          Colors — Ranges (scoped, never generic UI accents)
        </h2>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-7">
          {RANGE_SWATCHES.map((swatch) => (
            <div key={swatch.name} data-range={swatch.name} className="space-y-2">
              <div
                className="h-16 rounded-md"
                style={{ backgroundColor: `var(--color-range-${swatch.name})` }}
              />
              <p className="text-xs text-muted-foreground">{swatch.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
          Typography
        </h2>
        <p className="font-display text-4xl">Le luxe du sur-mesure</p>
        <p className="text-3xl font-medium tracking-heading uppercase">
          Institutional Title
        </p>
        <p className="text-sm uppercase tracking-claim text-muted-foreground">
          Product Claim Style
        </p>
        <p className="max-w-xl text-base leading-relaxed">
          Body copy in Gotham-substitute Manrope — the institutional voice used across the
          public site, account, and admin surfaces.
        </p>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
          Buttons
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Form primitives */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-heading text-muted-foreground">Form</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Example field composition</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ds-name">Full name</FieldLabel>
                <Input id="ds-name" placeholder="Jane Doe" />
              </Field>
              <Field>
                <FieldLabel htmlFor="ds-concern">Skin concern</FieldLabel>
                <Select>
                  <SelectTrigger id="ds-concern" className="w-full">
                    <SelectValue placeholder="Select a concern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hydration">Hydration</SelectItem>
                    <SelectItem value="fine-lines">Fine lines</SelectItem>
                    <SelectItem value="radiance">Radiance</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="ds-message">Message</FieldLabel>
                <Textarea id="ds-message" placeholder="How can we help?" />
                <FieldDescription>Optional</FieldDescription>
              </Field>
              <div className="flex items-center gap-2">
                <Checkbox id="ds-consent" />
                <Label htmlFor="ds-consent" className="text-sm font-normal">
                  I agree to the privacy policy
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="ds-newsletter" />
                <Label htmlFor="ds-newsletter" className="text-sm font-normal">
                  Subscribe to the newsletter
                </Label>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </section>

      {/* Overlays */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
          Dialog & Sheet
        </h2>
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm cancellation</DialogTitle>
                <DialogDescription>
                  This action can&apos;t be undone. Per CLAUDE.md, every destructive
                  action requires this kind of confirmation.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Keep it</Button>
                <Button variant="destructive">Cancel booking</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Your bag</SheetTitle>
                <SheetDescription>
                  Mini-cart drawer pattern — real cart wiring lands in Sprint 4.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      {/* Tabs & Accordion */}
      <section className="grid gap-8 md:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
            Tabs
          </h2>
          <Tabs defaultValue="routine">
            <TabsList>
              <TabsTrigger value="routine">Routine</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            <TabsContent value="routine" className="text-sm text-muted-foreground">
              Morning and evening steps appear here.
            </TabsContent>
            <TabsContent value="ingredients" className="text-sm text-muted-foreground">
              Active ingredient list appears here.
            </TabsContent>
            <TabsContent value="faq" className="text-sm text-muted-foreground">
              Product FAQ appears here.
            </TabsContent>
          </Tabs>
        </div>

        <div className="min-w-0 space-y-4">
          <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
            Accordion
          </h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How is my routine personalized?</AccordionTrigger>
              <AccordionContent>
                Based on your diagnosis answers, an admin-managed rules engine recommends
                a range and step order — see DATA_MODEL.md
                &quot;DiagnosisRecommendation&quot;.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is the AI analysis a medical diagnosis?</AccordionTrigger>
              <AccordionContent>
                No — results are clearly labeled simulated until a real provider is
                integrated, and never presented as medical advice.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Table & Calendar */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
            Table
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Range</TableHead>
                <TableHead className="text-end">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Crème Sublime Revitalisante</TableCell>
                <TableCell>Renew</TableCell>
                <TableCell className="text-end">AED 480</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Contour des Yeux Jeunesse Éclair</TableCell>
                <TableCell>Energize</TableCell>
                <TableCell className="text-end">AED 320</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="min-w-0 space-y-4">
          <h2 className="text-xs uppercase tracking-heading text-muted-foreground">
            Calendar
          </h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="max-w-full rounded-md border border-border"
          />
        </div>
      </section>
    </main>
  );
}
