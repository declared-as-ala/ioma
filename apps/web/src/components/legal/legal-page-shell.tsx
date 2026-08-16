interface LegalSection {
  heading: string;
}

interface LegalPageShellProps {
  kicker: string;
  title: string;
  pendingNotice: string;
  sections: LegalSection[];
  sectionPendingLabel: string;
}

// Real, navigable structure for every legal page — the actual legal text
// is not ours to write (CLAUDE.md: never invent content that should come
// from the client/counsel). Each section header is genuine and relevant to
// the policy type; the body is explicitly marked pending rather than
// filled with placeholder or invented legal language. See
// CLIENT_REQUIREMENTS.md "Legal page copy".
export function LegalPageShell({
  kicker,
  title,
  pendingNotice,
  sections,
  sectionPendingLabel,
}: LegalPageShellProps) {
  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-24">
      <p className="text-xs uppercase tracking-heading text-muted-foreground">{kicker}</p>
      <h1 className="mt-4 font-display text-4xl">{title}</h1>

      <div
        role="status"
        className="mt-8 rounded-md border border-border bg-accent px-4 md:px-6 py-4 text-sm text-muted-foreground"
      >
        {pendingNotice}
      </div>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-display text-xl">{section.heading}</h2>
            <p className="mt-2 text-sm italic text-muted-foreground">
              {sectionPendingLabel}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
