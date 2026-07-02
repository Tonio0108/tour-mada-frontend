import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationService } from "@lib/services/reservationService";

export function useClientReservations(clientId) {
  return useQuery({
    queryKey: ["reservations", "client", clientId],
    queryFn: () => reservationService.getClientReservations(clientId),
    enabled: !!clientId,
  });
}

export function useAllReservations() {
  return useQuery({
    queryKey: ["reservations", "all"],
    queryFn: reservationService.getAllReservations,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reservationService.createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => reservationService.updateReservation(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reservationService.cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
