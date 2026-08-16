"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiUpload } from "@/lib/api";
import type {
  ProfessionalApplication,
  B2BProductListItem,
  B2BOrderListItem,
} from "@ioma/types";

// --- Application hooks ---

export function useApplications() {
  return useQuery({
    queryKey: ["professional", "applications"],
    queryFn: () => apiFetch<ProfessionalApplication[]>("/professional/applications"),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["professional", "applications", id],
    queryFn: () => apiFetch<ProfessionalApplication>(`/professional/applications/${id}`),
    enabled: !!id,
  });
}

export function useCreateDraftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<ProfessionalApplication>("/professional/applications/draft", {
        method: "POST",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["professional", "applications"] }),
  });
}

export function useSubmitApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiFetch<ProfessionalApplication>(`/professional/applications/${id}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["professional", "applications"] }),
  });
}

export function useUploadDocumentMutation(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiUpload<{ documentId: string; originalName: string }>(
        `/professional/applications/${applicationId}/upload`,
        formData,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["professional", "applications", applicationId] }),
  });
}

// --- Admin hooks ---

export function usePendingApplications() {
  return useQuery({
    queryKey: ["professional", "admin", "applications"],
    queryFn: () =>
      apiFetch<ProfessionalApplication[]>("/professional/admin/applications"),
  });
}

export function useApproveApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes?: string }) =>
      apiFetch(`/professional/admin/applications/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ reviewNotes }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["professional", "admin"] }),
  });
}

export function useRejectApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes: string }) =>
      apiFetch(`/professional/admin/applications/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reviewNotes }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["professional", "admin"] }),
  });
}

// --- B2B Catalog ---

export function useB2BCatalog(params?: { range?: string; q?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.range) searchParams.set("range", params.range);
  if (params?.q) searchParams.set("q", params.q);
  const qs = searchParams.toString();
  return useQuery({
    queryKey: ["b2b", "catalog", params],
    queryFn: () => apiFetch<B2BProductListItem[]>(`/pro/catalog${qs ? `?${qs}` : ""}`),
  });
}

// --- B2B Orders ---

export function useB2BOrders() {
  return useQuery({
    queryKey: ["b2b", "orders"],
    queryFn: () => apiFetch<B2BOrderListItem[]>("/orders/pro/list"),
  });
}

// --- B2B Cart ---

export function useAddToCartB2BMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sku, qty }: { sku: string; qty: number }) =>
      apiFetch("/cart/pro/items", {
        method: "POST",
        body: JSON.stringify({ sku, qty }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}
