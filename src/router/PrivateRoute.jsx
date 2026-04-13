import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = ({
  children,
  requireAdmin = false,
  requireClient = false,
}) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          location.pathname + location.search
        )}`}
        replace
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireClient && user?.type_utilisateur !== "CLIENT") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;

