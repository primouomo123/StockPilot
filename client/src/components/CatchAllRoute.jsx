import { Navigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";


export default function CatchAllRoute() {
  const { currentUser, authIsLoading } = useUserContext();

  if (authIsLoading) return null;
  return <Navigate to={currentUser ? "/" : "/login"} replace />;
}