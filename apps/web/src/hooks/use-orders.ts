import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order } from "@ioma/types";
import { apiFetch } from "@/lib/api";
import { guestHeaders } from "@/hooks/use-cart";

export interface CheckoutInput {
  shippingAddress: {
    fullName: string;
    phone: string;
    emirate: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
  };
  billingAddress?: CheckoutInput["shippingAddress"];
  deliveryMethod: "standard" | "express";
  paymentMethod: "mock_success" | "mock_failure";
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckoutInput) =>
      apiFetch<Order>("/orders", {
        method: "POST",
        headers: guestHeaders(),
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.setQueryData(["cart"], undefined),
  });
}

export function useOrderQuery(orderNumber: string, token?: string) {
  return useQuery({
    queryKey: ["order", orderNumber, token],
    queryFn: () =>
      apiFetch<Order>(`/orders/${orderNumber}${token ? `?token=${token}` : ""}`),
    enabled: Boolean(orderNumber),
  });
}

export function useOrdersQuery() {
  return useQuery({
    queryKey: ["orders", "own"],
    queryFn: () => apiFetch<Order[]>("/orders"),
  });
}

export function useRetryPaymentMutation(orderNumber: string, token?: string) {
  return useMutation({
    mutationFn: (paymentMethod: "mock_success" | "mock_failure") =>
      apiFetch<Order>(
        `/orders/${orderNumber}/retry-payment${token ? `?token=${token}` : ""}`,
        {
          method: "POST",
          headers: guestHeaders(),
          body: JSON.stringify({ paymentMethod }),
        },
      ),
  });
}
