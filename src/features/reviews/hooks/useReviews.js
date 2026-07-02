import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@lib/services/reviewService";

export function useTourReviews(tourId) {
  return useQuery({
    queryKey: ["reviews", "tour", tourId],
    queryFn: () => reviewService.getByTour(tourId),
    enabled: !!tourId,
  });
}

export function useTopReviews() {
  return useQuery({
    queryKey: ["reviews", "top"],
    queryFn: reviewService.getTopReviews,
  });
}

export function usePublishedReviews() {
  return useQuery({
    queryKey: ["reviews", "published"],
    queryFn: reviewService.getPublishedReviews,
  });
}

export function useAllReviews() {
  return useQuery({
    queryKey: ["reviews", "all"],
    queryFn: reviewService.getAll,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publie }) => reviewService.updateStatus(id, publie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
