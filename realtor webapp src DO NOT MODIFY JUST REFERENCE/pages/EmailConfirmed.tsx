import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { authService } from "../services/authService";

const EmailConfirmedPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resendState, setResendState] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isResending, setIsResending] = useState(false);

  const { isError, title, description } = useMemo(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get("error") || "";
    const errorDescription = url.searchParams.get("error_description") || "";

    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const hashError = hashParams.get("error") || "";
    const hashErrorDescription = hashParams.get("error_description") || "";

    const finalError = error || hashError;
    const finalErrorDescription = errorDescription || hashErrorDescription;

    if (finalError) {
      return {
        isError: true,
        title: "Email confirmation failed",
        description:
          finalErrorDescription ||
          "We couldn't confirm your email. Please try again or request a new confirmation email.",
      };
    }

    return {
      isError: false,
      title: "Email confirmed",
      description:
        "Your email has been confirmed successfully. Please close this browser tab and proceed to login.",
    };
  }, []);

  const handleResend = async () => {
    setResendState(null);
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setResendState({ type: "error", text: "Enter a valid email address." });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await authService.resendConfirmationEmail(trimmedEmail);
      if (error) {
        setResendState({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Failed to resend confirmation email. Please try again.",
        });
        return;
      }

      setResendState({
        type: "success",
        text: "Confirmation email sent. Please check your inbox (and spam).",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isError ? "bg-red-50" : "bg-green-50"
            }`}
          >
            {isError ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V13"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 17H12.01"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="#16A34A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-[#0A1B39]">{title}</h1>
            <p className="mt-1 text-sm text-[#667085]">{description}</p>
          </div>
        </div>

        {isError && (
          <div className="mt-6 rounded-xl border border-[#EAECF0] p-4">
            <h2 className="text-sm font-semibold text-[#0A1B39]">
              Resend confirmation email
            </h2>
            <p className="mt-1 text-xs text-[#667085]">
              Enter your email address and we’ll send a new confirmation link.
            </p>

            <div className="mt-3 space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (resendState) setResendState(null);
                }}
                placeholder="e.g name@email.com"
                className="w-full h-11 px-3 border border-[#E6E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6500AC] focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className={`w-full h-11 font-medium rounded-lg transition-colors ${
                  isResending
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#6500AC] text-white hover:bg-[#5C009D]"
                }`}
              >
                {isResending ? "Sending…" : "Resend email"}
              </button>
              {resendState && (
                <div
                  className={`text-xs ${
                    resendState.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {resendState.text}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full h-11 bg-[#6500AC] text-white font-medium rounded-lg hover:bg-[#5C009D] transition-colors"
          >
            Go to login
          </button>
          <button
            onClick={() => window.close()}
            className="w-full h-11 bg-white border border-[#E6E7EC] text-[#0A1B39] font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close this tab
          </button>
          <p className="text-xs text-[#667085] text-center">
            If the tab doesn’t close, you can close it manually.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailConfirmedPage;
