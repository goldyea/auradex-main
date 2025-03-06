import { useState } from "react";
import { Navigate } from "react-router-dom";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import { useAuth } from "../lib/auth";

const Login = () => {
  const { user, signIn, signUp } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (data: { username: string; password: string }) => {
    try {
      setError(null);
      console.log("Login attempt with:", data);
      const result = await signIn(data.username, data.password);
      console.log("Login result:", result);
      if ("error" in result) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
    }
  };

  const handleRegister = async (data: {
    username: string;
    email?: string;
    password: string;
  }) => {
    try {
      setError(null);
      console.log("Register attempt with:", data);
      const result = await signUp(data.email, data.username, data.password);
      console.log("Register result:", result);
      if ("error" in result) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D1F] flex items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0D0D1F] to-[#0D0D1F]"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-6">
          <img
            src="https://storage.googleapis.com/tempo-public-images/figma-exports%2Fgithub%7C93087797-1741047856057-node-7%3A3-1741047854577.png"
            alt="Auradex Logo"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white">
            Auradex Entertainment
          </h1>
          <p className="text-gray-400 mt-2">
            Create an account or login with existing credentials
          </p>
        </div>

        {isLoginView ? (
          <LoginModal
            isOpen={true}
            onClose={() => setIsLoginView(false)}
            onLogin={handleLogin}
          />
        ) : (
          <RegisterModal
            isOpen={true}
            onClose={() => setIsLoginView(true)}
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsLoginView(true)}
          />
        )}

        {isLoginView && (
          <div className="mt-4 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={() => setIsLoginView(false)}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Sign up
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
