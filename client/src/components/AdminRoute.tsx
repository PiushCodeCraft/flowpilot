import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.systemRole !== "ADMIN") {
    return <Navigate to="/overview" replace />;
  }

  return <Outlet />;
}