import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Loader from "../Loader";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useUser();
  if (loading) return <Loader text="Checking session..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
