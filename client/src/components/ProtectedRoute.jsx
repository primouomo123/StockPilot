import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";


export default function ProtectedRoute() {
  const { currentUser, authIsReady } = useUserContext();

  if (!authIsReady) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  return <Outlet />;
}