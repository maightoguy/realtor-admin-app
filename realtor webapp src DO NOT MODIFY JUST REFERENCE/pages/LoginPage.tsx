import { useEffect, useState } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { logger } from "../utils/logger";
import { authService } from "../services";
import { useUser } from "../context/UserContext";

const LoginPage = () => {
  const [step, setStep] = useState<"login" | "forgot">("login");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const isRecovery =
      searchParams.get("mode") === "recovery" ||
      window.location.hash.includes("type=recovery");

    if (user && !isRecovery) {
      logger.info(
        "✅ [LOGIN PAGE] User already logged in, redirecting to dashboard",
      );
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate, searchParams]);

  useEffect(() => {
    const isRecovery =
      searchParams.get("mode") === "recovery" ||
      window.location.hash.includes("type=recovery");

    if (isRecovery) {
      navigate("/reset-password", { replace: true });
    }
  }, [navigate, searchParams]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) {
        logger.error("Google login failed", error);
      }
    } catch (err) {
      logger.error("Google login exception", err);
    }
  };

  // === STEP FLOW ===
  return (
    <AuthLayout>
      {/* LOGIN */}
      {step === "login" && (
        <LoginForm
          onForgot={() => setStep("forgot")}
          onGoogle={handleGoogleLogin}
          onSuccess={(email) => {
            logger.info(
              "✅ [LOGIN PAGE] Login successful, navigating to dashboard",
              {
                email,
              },
            );
            // Direct navigation to dashboard after successful login
            navigate("/dashboard");
          }}
        />
      )}

      {/* FORGOT PASSWORD */}
      {step === "forgot" && (
        <ForgotPasswordForm onBack={() => setStep("login")} />
      )}
    </AuthLayout>
  );
};

export default LoginPage;
