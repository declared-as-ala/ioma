import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  DiagnosisAnswer,
  StandardDiagnosisResult,
  StandardDiagnosisSummary,
} from "@ioma/types";
import { apiFetch } from "@/lib/api";
import { guestHeaders } from "@/hooks/use-cart";

// Guest-eligible, mirrors cart's OptionalJwtAuthGuard pattern — a signed-in
// user's submission is tied to their account server-side automatically
// (via the bearer token apiFetch already attaches), no guest header needed
// for diagnosis itself, but sending it is harmless and keeps this
// consistent with the rest of the guest-or-auth surface.
export function useSubmitStandardDiagnosis() {
  return useMutation({
    mutationFn: (answers: DiagnosisAnswer[]) =>
      apiFetch<StandardDiagnosisResult>("/diagnosis/standard", {
        method: "POST",
        headers: guestHeaders(),
        body: JSON.stringify({ answers }),
      }),
  });
}

export function useStandardDiagnosisQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["diagnosis", "standard", id],
    queryFn: () => apiFetch<StandardDiagnosisResult>(`/diagnosis/standard/${id}`),
    enabled: Boolean(id),
  });
}

export function useStandardDiagnosisHistoryQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["diagnosis", "standard", "mine"],
    queryFn: () => apiFetch<StandardDiagnosisSummary[]>("/diagnosis/standard/mine"),
    enabled,
    retry: false,
  });
}
