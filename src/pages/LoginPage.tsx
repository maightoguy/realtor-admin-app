import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AuthLayout from "../components/auth components/AuthLayout";
import LoginForm from "../components/auth components/LoginForm";
import ForgotPasswordForm from "../components/auth components/ForgotPasswordForm";
import OtpComponent from "../components/auth components/OtpComponent";
import ResetPasswordForm from "../components/auth components/ResetPasswordForm";
import { authManager } from "../services/authManager";
import { authService } from "../services/authService";
import { userService } from "../services/apiService";

type AuthStep = "login" | "forgot" | "confirm" | "reset";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<AuthStep>("login");
  const [userEmail, setUserEmail] = useState<string>("");
  const [pageError, setPageError] = useState<string | null>(null);
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const isFinalizingRef = useRef(false);

  const finalizeLogin = async (userId: string) => {
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;
    try {
      const user = await userService.getById(userId);
      if (!user) {
        await authService.signOut();
        authManager.clearUser();
        setPageError("Account not found.");
        setCurrentStep("login");
        return;
      }

      if (user.role !== "admin") {
        await authService.signOut();
        authManager.clearUser();
        setPageError("Access Denied: Admin privileges required.");
        setCurrentStep("login");
        return;
      }

      authManager.saveUser(user);
      navigate("/dashboard");
    } finally {
      isFinalizingRef.current = false;
    }
  };

  const handleForgotPassword = () => {
    setCurrentStep("forgot");
  };

  const handleBackToLogin = () => {
    setCurrentStep("login");
    setUserEmail("");
    setPendingCredentials(null);
    setPageError(null);
  };

  useEffect(() => {
    let cancelled = false;

    authService
      .getSession()
      .then(async ({ data }) => {
        const userId = data.session?.user?.id;
        if (!cancelled && userId) {
          await finalizeLogin(userId);
        }
      })
      .catch((e) => {
        const message =
          e instanceof Error ? e.message : "Unable to restore session.";
        if (!cancelled) setPageError(message);
      });

    const { data } = authService.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setCurrentStep("reset");
      }
      if (event === "SIGNED_OUT") {
        authManager.clearUser();
      }
      if (event === "SIGNED_IN") {
        const userId = session?.user?.id;
        if (userId) {
          finalizeLogin(userId).catch((e) => {
            const message =
              e instanceof Error ? e.message : "Unable to sign in.";
            setPageError(message);
          });
        }
      }
    });

    if (searchParams.get("mode") === "recovery") {
      setCurrentStep("reset");
    }

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [searchParams]);

  const renderStepComponent = () => {
    switch (currentStep) {
      case "login":
        return (
          <LoginForm
            onForgot={handleForgotPassword}
            error={pageError}
            onClearError={() => setPageError(null)}
            onSuccess={async ({ userId }) => {
              setPageError(null);
              await finalizeLogin(userId);
            }}
            onRequiresEmailConfirmation={({ email, password }) => {
              setUserEmail(email);
              setPendingCredentials({ email, password });
              setCurrentStep("confirm");
            }}
          />
        );
      case "forgot":
        return <ForgotPasswordForm onBack={handleBackToLogin} />;
      case "confirm":
        return (
          <OtpComponent
            email={userEmail}
            onBack={handleBackToLogin}
            onContinue={async () => {
              const sessionResult = await authService.getSession();
              const sessionUserId = sessionResult.data.session?.user?.id;
              if (sessionUserId) {
                await finalizeLogin(sessionUserId);
                return;
              }

              if (!pendingCredentials) {
                setCurrentStep("login");
                return;
              }

              const result = await authService.signInWithPassword(
                pendingCredentials.email,
                pendingCredentials.password
              );

              if (result.error) throw result.error;
              if (!result.data.user) {
                throw new Error("Login failed. Please try again.");
              }
              await finalizeLogin(result.data.user.id);
            }}
          />
        );
      case "reset":
        return (
          <ResetPasswordForm
            onBack={handleBackToLogin}
            onDone={async () => {
              const { data } = await authService.getSession();
              const userId = data.session?.user?.id;
              if (userId) {
                await finalizeLogin(userId);
                return;
              }
              handleBackToLogin();
            }}
          />
        );
      default:
        return (
          <LoginForm
            onForgot={handleForgotPassword}
            error={pageError}
            onClearError={() => setPageError(null)}
            onSuccess={async ({ userId }) => {
              setPageError(null);
              await finalizeLogin(userId);
            }}
            onRequiresEmailConfirmation={({ email, password }) => {
              setUserEmail(email);
              setPendingCredentials({ email, password });
              setCurrentStep("confirm");
            }}
          />
        );
    }
  };

  return <AuthLayout>{renderStepComponent()}</AuthLayout>;
};

export default LoginPage;
