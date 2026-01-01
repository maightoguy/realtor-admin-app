/* eslint-disable @typescript-eslint/no-unused-vars */
// RegistrationPage.tsx
import React, { useEffect, useState } from "react";
import type { CreateAccountData } from "../components/registration components/CreateAccountForm";
import { CreateAccountForm } from "../components/registration components/CreateAccountForm";
import StepProgress from "../components/registration components/StepProgress";
import StepBar from "../components/registration components/StepBar";
import { PersonalInfoForm } from "../components/registration components/PersonalInfoForm";
import heroImage from "../assets/Hero-background.jpg";
import VeriplotLogo from "../assets/Veriplot Primary logo 2.svg";
import KYCReminder from "../components/registration components/KYCReminder";
import VeriplotSvg from "../modules/HeroWorkObjects";
import { Link, useNavigate } from "react-router-dom";
import { registrationService } from "../services/registrationService";
import { logger } from "../utils/logger";
import Loader from "../components/Loader";

const steps = [
  { label: "Registration" },
  { label: "Personal Information" },
  { label: "KYC" },
];

const RegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [createAccountData, setCreateAccountData] =
    useState<CreateAccountData | null>(null);
  const [personalInfoData, setPersonalInfoData] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    referral?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    email: string;
  } | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const navigate = useNavigate();

  const referralCodeFromUrl = (() => {
    try {
      const value = new URLSearchParams(window.location.search).get("ref");
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!referralCodeFromUrl) return;
    localStorage.setItem("pending_referral_code", referralCodeFromUrl);
  }, [referralCodeFromUrl]);

  const handleResendEmail = async () => {
    if (!registrationSuccess?.email) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      const { error } = await registrationService.resendConfirmationEmail(
        registrationSuccess.email
      );

      if (error) {
        setResendMessage({ type: "error", text: error.message });
      } else {
        setResendMessage({
          type: "success",
          text: "Confirmation email sent! Please check your inbox.",
        });
      }
    } catch (err) {
      setResendMessage({
        type: "error",
        text: "Failed to resend email. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row md:p-6">
      {/* LEFT SIDE (image + tagline) */}
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src={heroImage}
          alt="Hero banner"
          className="w-full h-full object-cover rounded-3xl"
        />
        <Link to="/" className="absolute top-5 left-5">
          <VeriplotSvg />
        </Link>
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          {/* Step bar (desktop only) */}
          <div className="hidden md:block">
            <StepBar currentStep={currentStep} />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold">
            Unlock Real Estate Earnings, One property at a time
          </h2>
          <p className="mt-2 text-gray-200 text-sm">
            Login to access verified property listings, and track your
            commissions, all in one seamless platform.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (form + steps) */}
      <div className="flex-1 flex flex-col items-center py-6 px-2 md:px-16">
        {/* Logo (MOBILE ONLY) */}
        <Link to="/" className="w-full max-w-md mb-6 px-6 md:hidden">
          <img
            src={VeriplotLogo}
            alt="Veriplot logo"
            className="h-8 w-auto md:h-9 mb-3"
          />
        </Link>

        {/* Step Progress + Back Button */}
        <div className="w-full max-w-md flex flex-col items-start gap-2">
          <StepProgress steps={steps} currentStep={currentStep} />

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
              className="flex text-gray-700 mt-6 ml-5 "
            >
              <span className="text-2xl font-bold text-gray-700">←</span>
            </button>
          )}
        </div>

        {/* Forms */}
        <div className="w-full max-w-md mt-6">
          {/* Registration Success Message */}
          {registrationSuccess && (
            <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-center">
                {/* Success Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Check Your Email!
                </h2>

                {/* Message */}
                <p className="text-gray-600 mb-4">
                  We've sent a confirmation email to
                </p>
                <p className="text-lg font-semibold text-purple-700 mb-6">
                  {registrationSuccess.email}
                </p>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Next steps:</strong>
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Check your inbox (and spam folder)</li>
                    <li>Click the confirmation link in the email</li>
                    <li>Return here to log in</li>
                  </ol>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    logger.info("✅ [REGISTRATION PAGE] Navigating to login");
                    navigate("/login");
                  }}
                  className="w-full py-3 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-colors mb-4"
                >
                  Go to Login
                </button>

                {/* Resend Email Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Didn't receive the email?{" "}
                    <button
                      onClick={handleResendEmail}
                      disabled={isResending}
                      className={`text-purple-700 font-medium hover:underline ${
                        isResending ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isResending ? "Resending..." : "Resend"}
                    </button>
                  </p>
                  {resendMessage && (
                    <p
                      className={`text-sm mt-2 ${
                        resendMessage.type === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {resendMessage.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Registration Forms (hidden when success message is shown) */}
          {!registrationSuccess && currentStep === 0 && (
            <CreateAccountForm
              initialData={createAccountData ?? undefined}
              onNext={(data) => {
                setCreateAccountData(data);
                setCurrentStep(1);
              }}
            />
          )}

          {!registrationSuccess && currentStep === 1 && (
            <PersonalInfoForm
              initialData={
                personalInfoData ??
                (referralCodeFromUrl ? { referral: referralCodeFromUrl } : undefined)
              }
              onNext={(data) => {
                setPersonalInfoData(data);
                setCurrentStep(2); // go to KYC
              }}
            />
          )}

          {!registrationSuccess && currentStep === 2 && (
            <KYCReminder
              onContinue={async () => {
                // Collect all registration data and submit (without KYC document)
                if (!createAccountData || !personalInfoData) {
                  setError("Please complete all required steps");
                  return;
                }

                setIsLoading(true);
                setError(null);

                try {
                  const result = await registrationService.register({
                    email: createAccountData.email,
                    password: createAccountData.password,
                    firstName: personalInfoData.firstName,
                    lastName: personalInfoData.lastName,
                    phone: personalInfoData.phone,
                    gender: personalInfoData.gender,
                    referralCode: personalInfoData.referral,
                    // No KYC document - user will complete it later
                  });

                  if (result.success) {
                    // Registration successful - show email confirmation message
                    logger.info(
                      "✅ [REGISTRATION PAGE] Registration successful, showing confirmation"
                    );
                    setRegistrationSuccess({
                      email: createAccountData.email,
                    });
                    setIsLoading(false);
                  } else {
                    // Registration failed - show user-friendly error
                    const errorMessage =
                      result.error || "Registration failed. Please try again.";
                    logger.error(
                      "❌ [REGISTRATION PAGE] Registration failed:",
                      errorMessage
                    );
                    setError(errorMessage);
                    setIsLoading(false);
                  }
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "An unexpected error occurred"
                  );
                } finally {
                  setIsLoading(false);
                }
              }}
            />
          )}

          {/* Error Message */}
          {!registrationSuccess && error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-600 font-medium mb-1">
                    Registration Failed
                  </p>
                  <p className="text-sm text-red-600">{error}</p>
                  {error.includes("already registered") && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-sm text-red-700 mb-2">
                        Already have an account?
                      </p>
                      <button
                        onClick={() => {
                          logger.info(
                            "🔗 [REGISTRATION PAGE] Navigating to login from error"
                          );
                          navigate("/login");
                        }}
                        className="text-sm text-purple-700 font-medium hover:underline"
                      >
                        Go to Login →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {!registrationSuccess && isLoading && (
            <Loader text="Creating your account... Please wait." />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
