import { useMutation } from "@tanstack/react-query";
import { authService } from "@lib/services/authService";
import { setAuthToken } from "@lib/api";

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      if (data.token) {
        await setAuthToken(data.token);
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: async (data) => {
      if (data.token) {
        await setAuthToken(data.token);
      }
    },
  });
}
