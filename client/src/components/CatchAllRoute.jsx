


export default function CatchAllRoute() {
  const { currentUser, authIsLoading } = useUserContext();

  if (authIsLoading) return null;
  return <Navigate to={currentUser ? "/" : "/login"} replace />;
}