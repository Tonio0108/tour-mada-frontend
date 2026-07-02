import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toursService } from "@lib/services/toursService";

export function useCreateTourStandard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toursService.createTourStandard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
}

export function useDeleteTourStandard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toursService.deleteTourStandards,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
}

export function useCreateCustomTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toursService.createTourPersonnalise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours", "custom"] });
    },
  });
}
