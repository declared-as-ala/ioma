import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface ProtocolItem {
  _id: string;
  slug: string;
  title: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  category: "facial" | "body" | "diagnostic" | "homecare";
  applicableRangeKeys: string[];
  pdfUrl: string | null;
  videoUrl: string | null;
  durationMinutes: number;
}

export function useProtocols(category?: string, rangeKey?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (rangeKey) params.set("rangeKey", rangeKey);
  const queryStr = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: ["protocols", category, rangeKey],
    queryFn: () => apiFetch<ProtocolItem[]>(`/protocols${queryStr}`),
  });
}

export function useProtocolBySlug(slug: string) {
  return useQuery({
    queryKey: ["protocol", slug],
    queryFn: () => apiFetch<ProtocolItem>(`/protocols/${slug}`),
    enabled: !!slug,
  });
}
