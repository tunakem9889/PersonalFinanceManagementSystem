import { Navigate, Outlet } from "react-router-dom";
import { getAuthState } from "../../utils/auth";

/**
 * Protects routes that require ROLE_ADMIN.
 * - Not authenticated → redirect to /login
 * - Authenticated but not admin → redirect to /
 */
export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = getAuthState();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
