import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiAnalysisResult, AiAnalysisSummary } from "@ioma/types";
import { apiFetch, apiUpload } from "@/lib/api";

export function useRecordAiConsent() {
  return useMutation({
    mutationFn: () =>
      apiFetch<{ consentedAt: string }>("/ai-analysis/consent", { method: "POST" }),
  });
}

export function useSubmitAiAnalysis() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiUpload<AiAnalysisResult>("/ai-analysis", formData);
    },
  });
}

// Polls while the async BullMQ pipeline is still queued/processing, stops
// once a terminal status (completed/failed) is reached.
export function useAiAnalysisQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["ai-analysis", id],
    queryFn: () => apiFetch<AiAnalysisResult>(`/ai-analysis/${id}`),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 1500;
    },
  });
}

export function useAiAnalysisHistoryQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["ai-analysis", "mine"],
    queryFn: () => apiFetch<AiAnalysisSummary[]>("/ai-analysis/mine"),
    enabled,
    retry: false,
  });
}

export function useDeleteAiAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/ai-analysis/${id}`, { method: "DELETE" }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["ai-analysis", "mine"] });
      queryClient.removeQueries({ queryKey: ["ai-analysis", id] });
    },
  });
}
