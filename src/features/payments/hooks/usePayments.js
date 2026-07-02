import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@lib/services/paymentService";

export function useClientPayments(clientId) {
  return useQuery({
    queryKey: ["payments", "client", clientId],
    queryFn: () => paymentService.getClientPaiements(clientId),
    enabled: !!clientId,
  });
}

export function useAllPayments() {
  return useQuery({
    queryKey: ["payments", "all"],
    queryFn: paymentService.getAllPaiement,
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentService.addPaiement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => paymentService.updatePaiementStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
