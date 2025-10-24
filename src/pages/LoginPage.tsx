import { useState } from "react";
import AuthLayout from "../components/auth components/AuthLayout";
import LoginForm from "../components/auth components/LoginForm";
// TODO: Import other auth components when created
// import ForgotPasswordForm from '../components/auth components/ForgotPasswordForm';
// import OtpComponent from '../components/auth components/OtpComponent';
// import ResetPasswordForm from '../components/auth components/ResetPasswordForm';

type AuthStep = "login" | "forgot" | "otp" | "reset";

const LoginPage = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>("login");

  const handleLoginSuccess = (email: string) => {
    console.log("Login successful for:", email);
    setCurrentStep("otp");
  };

  const handleForgotPassword = () => {
    setCurrentStep("forgot");
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case "login":
        return <LoginForm onForgot={handleForgotPassword} onSuccess={handleLoginSuccess} />;
      case "forgot":
        // TODO: Return ForgotPasswordForm component
        return <div>Forgot Password Form - TODO</div>;
      case "otp":
        // TODO: Return OtpComponent
        return <div>OTP Component - TODO</div>;
      case "reset":
        // TODO: Return ResetPasswordForm component
        return <div>Reset Password Form - TODO</div>;
      default:
        return <LoginForm onForgot={handleForgotPassword} onSuccess={handleLoginSuccess} />;
    }
  };

  return <AuthLayout>{renderStepComponent()}</AuthLayout>;
};

export default LoginPage;
