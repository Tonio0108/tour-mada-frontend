import { useAuth } from "./useAuth";

export const useRole = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  const canReserve = () => {
    return isAuthenticated && user?.type_utilisateur === "CLIENT";
  };

  const canAccessAdmin = () => {
    return isAuthenticated && isAdmin;
  };

  const isClient = () => {
    return isAuthenticated && user?.type_utilisateur === "CLIENT";
  };

  return {
    canReserve,
    canAccessAdmin,
    isClient,
    isAuthenticated,
    isAdmin,
    user,
  };
};
