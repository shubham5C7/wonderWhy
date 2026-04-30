import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) return <div>Loading...</div>;
 if (!user) return <Navigate to="/signup" replace />;



  return children;
};

export default ProtectedRoute;