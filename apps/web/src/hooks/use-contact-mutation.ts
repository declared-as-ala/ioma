import { useMutation } from "@tanstack/react-query";
import type { ContactMessageInput } from "@ioma/validation";
import { apiFetch } from "@/lib/api";

interface ContactMessageResponse {
  id: string;
  receivedAt: string;
}

export function useContactMutation() {
  return useMutation({
    mutationFn: (input: ContactMessageInput) =>
      apiFetch<ContactMessageResponse>("/contact", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}
