import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PublicOnlyRoute;
