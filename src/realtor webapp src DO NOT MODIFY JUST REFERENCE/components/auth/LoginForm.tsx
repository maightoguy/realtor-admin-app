import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { userService } from "../../services/apiService";
import { logger } from "../../utils/logger";
import { trimValues } from "../../utils/trim";
import Loader from "../Loader";

interface LoginFormProps {
  onForgot: () => void;
  onSuccess: (email: string) => void;
  onSignup?: () => void;
  onGoogle?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onForgot,
  onSuccess,
  onGoogle,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Trim form values
    const trimmedData = trimValues({ email, password });
    const trimmedEmail = trimmedData.email as string;
    const trimmedPassword = trimmedData.password as string;

    // Validation
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please fill in both email and password");
      logger.warn("⚠️ [LOGIN] Validation failed: Missing fields");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      logger.warn("⚠️ [LOGIN] Validation failed: Invalid email format");
      return;
    }

    setLoading(true);
    logger.info("🔐 [LOGIN] Attempting login", { email: trimmedEmail });

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await authService.signIn(
        trimmedEmail,
        trimmedPassword
      );

      if (signInError) {
        logger.error("❌ [LOGIN] Sign in failed:", {
          message: signInError.message,
          status: signInError.status,
        });

        // User-friendly error messages
        let errorMessage = "Login failed. Please check your credentials.";

        if (signInError.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (signInError.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email before logging in.";
        } else if (signInError.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please try again later.";
        }

        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (!data.user) {
        logger.error("❌ [LOGIN] Sign in returned no user");
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Verify user profile exists (handle deleted accounts)
      try {
        const userProfile = await userService.getById(data.user.id);

        if (!userProfile) {
          logger.warn(
            "⚠️ [LOGIN] Auth succeeded but user profile not found (likely deleted)",
            {
              userId: data.user.id,
            }
          );

          const created = await authService.ensureUserProfile();
          if (!created) {
            await authService.signOut();
            setError("Account not found. It may have been deleted.");
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        logger.error("❌ [LOGIN] Failed to verify user profile:", err);
        // If we can't verify the profile, we shouldn't proceed
        await authService.signOut();
        setError("Failed to verify account details. Please try again.");
        setLoading(false);
        return;
      }

      logger.info("✅ [LOGIN] Login successful:", {
        userId: data.user.id,
        email: data.user.email,
      });

      // Stop loading before navigation
      setLoading(false);

      // Call success callback (this will trigger navigation)
      // Note: Session is already handled by authManager, no need to fetch it here
      onSuccess(trimmedEmail);
    } catch (err) {
      logger.error("❌ [LOGIN] Unexpected error during login:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-6 max-w-sm mx-auto justify-center p-6 md:mt-20"
    >
      <div className="">
        <h2 className="text-[25px] font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-purple-700 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null); // Clear error when user types
          }}
          placeholder="example@mail.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600 outline-none"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null); // Clear error when user types
            }}
            placeholder="********"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-purple-600 outline-none"
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

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Login */}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full py-3 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* Loading Overlay */}
      {loading && <Loader text="Logging in..." />}

      {/* Forgot Password */}
      <p className="text-center text-sm text-gray-600">
        Forgot Password?{" "}
        <button
          type="button"
          onClick={onForgot}
          className="text-purple-700 font-medium hover:underline"
        >
          Recover
        </button>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-gray-400 text-sm">Or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={onGoogle}
        className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M17.64 9.20498C17.64 8.59678 17.5825 8.01248 17.4774 7.45098H9V10.75H13.9944C13.8744 11.7 13.2562 12.46 12.3606 12.95V15.05H15.1721C16.9644 13.4675 17.64 11.07 17.64 9.205"
            fill="#4285F4"
          />
          <path
            d="M9 18C11.43 18 13.44 17.13 15.1721 15.05L12.3606 12.95C11.48 13.46 10.3644 13.75 9 13.75C6.66 13.75 4.73 12.01 4.07 9.84H1.12637V11.99C2.85851 15.32 5.71 18 9 18Z"
            fill="#34A853"
          />
          <path
            d="M4.07 9.84C3.94 9.33 3.86 8.79 3.86 8.25C3.86 7.71 3.94 7.17 4.07 6.66V4.51H1.12637C0.41 5.92 0 7.53 0 9.25C0 10.97 0.41 12.58 1.12637 13.99L4.07 11.84V9.84Z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.5C10.34 3.5 11.53 4.02 12.44 4.97L15.25 2.06C13.44 0.37 11.43 -0 9 0C5.71 0 2.85851 2.68 1.12637 6.01L4.07 8.16C4.73 6 - 6.66 4.25 9 4.25Z"
            fill="#EA4335"
          />
        </svg>
        <span className="text-gray-700 font-medium">Google</span>
      </button>
    </form>
  );
};

export default LoginForm;
