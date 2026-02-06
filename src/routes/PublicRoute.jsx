import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  // If logged in → redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
