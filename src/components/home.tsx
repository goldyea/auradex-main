import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const Home = () => {
  const { user } = useAuth();

  // Redirect to dashboard if authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Redirect to login if not authenticated
  return <Navigate to="/login" replace />;
};

export default Home;
