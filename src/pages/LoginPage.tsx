import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth components/AuthLayout";
import LoginForm from "../components/auth components/LoginForm";
import ForgotPasswordForm from "../components/auth components/ForgotPasswordForm";
import OtpComponent from "../components/auth components/OtpComponent";
import ResetPasswordForm from "../components/auth components/ResetPasswordForm";

type AuthStep = "login" | "forgot" | "otp" | "reset";

const LoginPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<AuthStep>("login");
  const [userEmail, setUserEmail] = useState<string>("");
  const [otpContext, setOtpContext] = useState<"login" | "reset">("login");

  const handleLoginSuccess = (email: string) => {
    console.log("Login successful for:", email);
    setUserEmail(email);
    setOtpContext("login");
    setCurrentStep("otp");
  };

  const handleForgotPassword = () => {
    setCurrentStep("forgot");
  };

  const handleForgotPasswordSubmit = (email: string) => {
    setUserEmail(email);
    setOtpContext("reset");
    setCurrentStep("otp");
  };

  const handleOtpVerified = () => {
    if (otpContext === "login") {
      // Navigate to dashboard after successful login OTP verification
      navigate("/dashboard");
    } else {
      // For password reset flow, go to reset password step
      setCurrentStep("reset");
    }
  };

  const handlePasswordReset = () => {
    setCurrentStep("login");
    setUserEmail("");
  };

  const handleBackToLogin = () => {
    setCurrentStep("login");
    setUserEmail("");
  };

  const handleOtpBack = () => {
    setCurrentStep("login");
    setUserEmail("");
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case "login":
        return (
          <LoginForm
            onForgot={handleForgotPassword}
            onSuccess={handleLoginSuccess}
          />
        );
      case "forgot":
        return (
          <ForgotPasswordForm
            onOtp={(email: string) => handleForgotPasswordSubmit(email)}
            onBack={handleBackToLogin}
          />
        );
      case "otp":
        return (
          <OtpComponent
            email={userEmail}
            onBack={handleOtpBack}
            onVerified={handleOtpVerified}
          />
        );
      case "reset":
        return (
          <ResetPasswordForm
            onBack={() => setCurrentStep("otp")}
            onDone={handlePasswordReset}
          />
        );
      default:
        return (
          <LoginForm
            onForgot={handleForgotPassword}
            onSuccess={handleLoginSuccess}
          />
        );
    }
  };

  return <AuthLayout>{renderStepComponent()}</AuthLayout>;
};

export default LoginPage;
