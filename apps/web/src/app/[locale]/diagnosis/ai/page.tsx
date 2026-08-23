"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function AiDiagnosisRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/diagnosis");
  }, [router]);

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-24" aria-busy="true">
      <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
      <div className="mt-10 h-40 animate-pulse bg-ioma-grey-100" />
    </main>
  );
}
