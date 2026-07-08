import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const token = localStorage.getItem("accessToken");
  
  // If no token exists, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
