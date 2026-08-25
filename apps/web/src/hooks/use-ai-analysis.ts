import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdaptiveQuestion,
  AiAnalysisResult,
  AiAnalysisSummary,
  AiChatMessage,
  BeforeAfterComparison,
} from "@ioma/types";
import type { RoutineTier } from "@ioma/config";
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

export function useAdaptiveQuestionsQuery(
  id: string | undefined,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["ai-analysis", id, "questions"],
    queryFn: () => apiFetch<AdaptiveQuestion[]>(`/ai-analysis/${id}/adaptive-questions`),
    enabled: Boolean(id) && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      return Array.isArray(data) && data.length > 0 ? false : 1000;
    },
  });
}

export function useSubmitAdaptiveAnswers(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      answers: { questionKey: string; value: string | string[] }[];
      routineText?: string;
      budgetPreference?: string;
      routinePreference?: string;
    }) =>
      apiFetch<AiAnalysisResult>(`/ai-analysis/${id}/adaptive-answers`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["ai-analysis", id], updated);
    },
  });
}

export function useSelectRoutineTier(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tier: RoutineTier) =>
      apiFetch<AiAnalysisResult>(`/ai-analysis/${id}/select-tier`, {
        method: "POST",
        body: JSON.stringify({ tier }),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["ai-analysis", id], updated);
    },
  });
}

export function useAskAdvisor(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { message: string; locale: "en" | "fr" | "ar" }) =>
      apiFetch<{
        message: string;
        suggestedQuestions: string[];
        chatHistory: AiChatMessage[];
      }>(`/ai-analysis/${id}/chat`, {
        method: "POST",
        body: JSON.stringify(params),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<AiAnalysisResult>(["ai-analysis", id], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          chatHistory: data.chatHistory,
          suggestedQuestions: data.suggestedQuestions,
        };
      });
    },
  });
}

export function useSubmitFollowUp(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      day: number;
      comfortRating: number;
      tightnessAfterCleansing: boolean;
      irritationNoticed: boolean;
      notes?: string;
    }) =>
      apiFetch<AiAnalysisResult>(`/ai-analysis/${id}/follow-up`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["ai-analysis", id], updated);
    },
  });
}

export function useCompareAnalysesQuery(
  prevId: string | undefined,
  currId: string | undefined,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["ai-analysis", "compare", prevId, currId],
    queryFn: () =>
      apiFetch<BeforeAfterComparison>(`/ai-analysis/compare/${prevId}/${currId}`),
    enabled: Boolean(prevId && currId && enabled),
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
