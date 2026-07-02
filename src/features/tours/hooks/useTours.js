import { useQuery } from "@tanstack/react-query";
import { toursService } from "@lib/services/toursService";

export function useTours() {
  return useQuery({
    queryKey: ["tours"],
    queryFn: toursService.getAllTourStandards,
  });
}

export function useTour(tourId) {
  return useQuery({
    queryKey: ["tours", tourId],
    queryFn: () => toursService.getTourStandardsById(tourId),
    enabled: !!tourId,
  });
}

export function useCustomTours() {
  return useQuery({
    queryKey: ["tours", "custom"],
    queryFn: toursService.getAllTourPersonnalise,
  });
}
