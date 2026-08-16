import { useMutation } from "@tanstack/react-query";
import type { AuthResult } from "@ioma/types";
import type { LoginInput, RegisterInput } from "@ioma/validation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<AuthResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: setSession,
  });
}

export function useRegisterMutation() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<AuthResult>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: setSession,
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  return useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await apiFetch("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        }).catch(() => undefined);
      }
    },
    onSuccess: clearSession,
    onError: clearSession,
  });
}
