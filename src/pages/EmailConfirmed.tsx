import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth components/AuthLayout";
import { authManager } from "../services/authManager";
import { authService } from "../services/authService";

function getHashParam(hash: string, key: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  const v = params.get(key);
  return v && v.trim().length > 0 ? v : null;
}

export default function EmailConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const errorDescription = useMemo(() => {
    const fromHash = getHashParam(location.hash, "error_description");
    if (fromHash) return decodeURIComponent(fromHash.replace(/\+/g, " "));
    return null;
  }, [location.hash]);

  useEffect(() => {
    setMessage(
      errorDescription
        ? { type: "error", text: errorDescription }
        : { type: "success", text: "Email confirmed. You can proceed to login." }
    );
  }, [errorDescription]);

  const handleGoToLogin = async () => {
    try {
      await authService.signOut();
    } finally {
      authManager.clearUser();
      navigate("/login", { replace: true });
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setIsResending(true);
    setMessage(null);
    try {
      const { error } = await authService.resendConfirmationEmail(trimmedEmail);
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setMessage({
        type: "success",
        text: "Confirmation email sent! Please check your inbox.",
      });
    } catch (e) {
      const text =
        e instanceof Error ? e.message : "Failed to resend confirmation email.";
      setMessage({ type: "error", text });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="flex flex-col items-start gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Email confirmation</h2>
          <p className="text-gray-500 text-sm">
            Use the button below to go back to login. If you landed here in error,
            you can resend the confirmation email.
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoToLogin}
          className="w-full py-3 rounded-xl font-semibold text-white bg-purple-700 hover:bg-purple-800 transition"
        >
          Go to login
        </button>

        <form onSubmit={handleResend} className="space-y-3">
          <div className="text-left">
            <label className="block text-gray-600 font-medium mb-2">
              Resend confirmation email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g admin@mail.com"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!email.trim() || isResending}
            className={`w-full py-3 rounded-xl font-semibold text-white transition ${
              email.trim() && !isResending
                ? "bg-gray-900 hover:bg-gray-950"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isResending ? "Resending..." : "Resend email"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

