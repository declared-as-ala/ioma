import { useMutation } from "@tanstack/react-query";
import type { NewsletterSubscribeInput } from "@ioma/validation";
import { apiFetch } from "@/lib/api";

export function useNewsletterMutation() {
  return useMutation({
    mutationFn: (input: NewsletterSubscribeInput) =>
      apiFetch<{ subscribed: boolean }>("/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}
