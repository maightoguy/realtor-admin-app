import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/authService";
import Loader from "../Loader";

interface LoginFormProps {
  onForgot: () => void;
  onSuccess: (params: { email: string; userId: string }) => void;
  onRequiresEmailConfirmation: (params: {
    email: string;
    password: string;
  }) => void;
  error?: string | null;
  onClearError?: () => void;
  onSignup?: () => void;
  onGoogle?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onForgot,
  onSuccess,
  onRequiresEmailConfirmation,
  error,
  onClearError,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Please fill in both fields");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.signInWithPassword(
        email.trim(),
        password
      );
      if (result.error) {
        const message =
          result.error.message || "Login failed. Please try again.";
        const isEmailNotConfirmed =
          message.toLowerCase().includes("email not confirmed") ||
          message.toLowerCase().includes("email_not_confirmed");

        if (isEmailNotConfirmed) {
          try {
            await authService.resendConfirmationEmail(email.trim());
          } catch {}
          onRequiresEmailConfirmation({ email: email.trim(), password });
          setLoading(false);
          return;
        }

        setLocalError(message);
        setLoading(false);
        return;
      }

      if (!result.data.user) {
        setLocalError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess({
        email: result.data.user.email ?? email.trim(),
        userId: result.data.user.id,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "An unexpected error occurred.";
      setLocalError(message);
      setLoading(false);
    }
  };

  const mergedError = localError ?? error ?? null;

  return (
    <>
      <Loader isOpen={loading} text="Verifying..." />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-6 w-full max-w-md mx-auto justify-center px-2 sm:px-4 md:px-0 md:mt-10"
      >
      <div>
        <h2 className="text-[22px] sm:text-[25px] font-bold text-gray-900">
          Welcome back Admin!
        </h2>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setLocalError(null);
            onClearError?.();
          }}
          placeholder="example@mail.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-600 outline-none text-sm"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLocalError(null);
              onClearError?.();
            }}
            placeholder="********"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 focus:ring-2 focus:ring-purple-600 outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {mergedError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{mergedError}</p>
        </div>
      )}

      {/* Login */}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full py-3 bg-purple-700 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-purple-800 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Login"}
      </button>

      {/* Forgot Password */}
      <p className="text-center text-xs sm:text-sm text-gray-600">
        Forgot Password?{" "}
        <button
          type="button"
          onClick={onForgot}
          className="text-purple-700 font-medium hover:underline text-xs sm:text-sm"
        >
          Recover
        </button>
      </p>
      </form>
    </>
  );
};

export default LoginForm;
