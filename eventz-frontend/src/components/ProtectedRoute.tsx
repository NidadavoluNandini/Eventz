import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { getToken } from "../utils/auth";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/organizer/login" replace />;
  }

  return <>{children}</>;
}
