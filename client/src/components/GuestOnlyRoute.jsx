import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";


export default function GuestOnlyRoute() {
  const { currentUser, authIsLoading } = useUserContext();

  if (authIsLoading) return null;
  if (currentUser) return <Navigate to="/" replace />;

  return <Outlet />;
}