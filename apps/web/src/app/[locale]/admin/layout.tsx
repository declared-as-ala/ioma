"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthHydrated();

  const isAdmin =
    user?.roles?.includes("administrator") ||
    user?.roles?.includes("super_administrator");

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, router, user]);

  if (!hydrated) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-[1440px] px-4 md:px-6 py-24">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-[800px] px-4 md:px-6 py-24 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
        <h1 className="mt-4 font-heading text-3xl font-light text-ioma-black">
          Admin Access Required
        </h1>
        <p className="mt-2 text-ioma-grey-500">
          You must be logged in as an administrator to access the platform control panel.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded bg-ioma-black px-6 py-3 text-sm font-medium text-white hover:bg-ioma-black/90"
        >
          Return Home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[256px_minmax(0,1fr)]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
