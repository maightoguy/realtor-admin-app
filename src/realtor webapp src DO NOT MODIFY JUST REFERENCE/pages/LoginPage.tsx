import { useEffect, useState } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { logger } from "../utils/logger";
import { authService } from "../services";

const LoginPage = () => {
  const [step, setStep] = useState<"login" | "forgot" | "reset">("login");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for Supabase auth events (especially password recovery)
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      logger.info(`[LOGIN PAGE] Auth event: ${event}`, {
        userId: session?.user?.id,
      });
      if (event === "PASSWORD_RECOVERY") {
        logger.info("[LOGIN PAGE] Password recovery event detected");
        setStep("reset");
      }
    });

    // Check URL for recovery mode
    if (searchParams.get("mode") === "recovery") {
      logger.info("[LOGIN PAGE] Recovery mode detected in URL");
      setStep("reset");

      // Verify if we actually have a session
      authService.getSession().then(({ data }) => {
        if (data.session) {
          logger.info("[LOGIN PAGE] Active session found during recovery");
        } else {
          logger.warn(
            "[LOGIN PAGE] Recovery mode but no active session found yet"
          );
        }
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  // === STEP FLOW ===
  return (
    <AuthLayout>
      {/* LOGIN */}
      {step === "login" && (
        <LoginForm
          onForgot={() => setStep("forgot")}
          onSuccess={(email) => {
            logger.info(
              "✅ [LOGIN PAGE] Login successful, navigating to dashboard",
              {
                email,
              }
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

      {/* RESET PASSWORD STEP */}
      {step === "reset" && (
        <ResetPasswordForm
          onBack={() => setStep("login")}
          onDone={() => navigate("/dashboard")}
        />
      )}
    </AuthLayout>
  );
};

export default LoginPage;
