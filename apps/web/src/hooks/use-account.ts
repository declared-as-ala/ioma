import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AccountDeletionRequest, Address, CustomerProfile } from "@ioma/types";
import type {
  AddressInput,
  ChangePasswordInput,
  DeletionRequestInput,
  ProfileInput,
} from "@ioma/validation";
import { apiFetch } from "@/lib/api";

const PROFILE_KEY = ["account", "profile"] as const;
const ADDRESSES_KEY = ["account", "addresses"] as const;

export function useProfileQuery() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => apiFetch<CustomerProfile>("/account/profile"),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) =>
      apiFetch<CustomerProfile>("/account/profile", {
        method: "PATCH",
        body: JSON.stringify({
          ...input,
          phone: input.phone || undefined,
          dateOfBirth: input.dateOfBirth || null,
        }),
      }),
    onSuccess: (profile) => queryClient.setQueryData(PROFILE_KEY, profile),
  });
}

export function useAddressesQuery() {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: () => apiFetch<Address[]>("/account/addresses"),
  });
}

function useAddressMutation(method: "POST" | "PATCH") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: AddressInput }) =>
      apiFetch<Address>(`/account/addresses${id ? `/${id}` : ""}`, {
        method,
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useCreateAddressMutation() {
  return useAddressMutation("POST");
}

export function useUpdateAddressMutation() {
  return useAddressMutation("PATCH");
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/account/addresses/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      apiFetch<void>("/account/password", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
  });
}

export function useDeletionRequestMutation() {
  return useMutation({
    mutationFn: (input: DeletionRequestInput) =>
      apiFetch<AccountDeletionRequest>("/account/deletion-request", {
        method: "POST",
        body: JSON.stringify({ reason: input.reason.trim() || undefined }),
      }),
  });
}
