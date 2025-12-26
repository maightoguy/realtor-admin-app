import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { trimValues } from "../../utils/trim";

export type CreateAccountData = {
  email: string;
  password: string;
};

type Props = {
  initialData?: Partial<CreateAccountData>;
  onNext: (data: CreateAccountData) => void;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CreateAccountForm: React.FC<Props> = ({
  initialData = {},
  onNext,
}) => {
  const [email, setEmail] = useState(initialData.email ?? "");
  const [password, setPassword] = useState(initialData.password ?? "");
  const [confirm, setConfirm] = useState(initialData.password ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState(false);

  const isEmailValid = useMemo(() => emailRegex.test(email.trim()), [email]);
  const isPasswordValid = useMemo(() => password.length >= 8, [password]);
  const isConfirmMatch = useMemo(
    () => password === confirm && confirm.length > 0,
    [password, confirm]
  );

  const isValid = isEmailValid && isPasswordValid && isConfirmMatch;

  useEffect(() => {
    // reset touched when user modifies form significantly
    if (touched && isValid) setTouched(false);
  }, [isValid, touched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    const trimmedData = trimValues({ email, password });
    onNext(trimmedData as CreateAccountData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[375px] md:max-w-[720px] mx-auto px-6 py-6"
      noValidate
    >
      {/* Heading */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="mt-2 text-sm text-gray-600">
          You have an account?{" "}
          <Link to="/login" className="text-[#6500AC] underline">
            Login
          </Link>
        </p>
      </div>

      {/* Email */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Email Address
        </label>
        <div className="bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg px-4 py-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g ****@mail.com"
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
            aria-invalid={!isEmailValid && touched}
            aria-describedby="email-error"
          />
        </div>
        {!isEmailValid && touched && (
          <p id="email-error" className="mt-2 text-xs text-red-600">
            Enter a valid email address
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Password
        </label>
        <div className="relative bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg px-4 py-3">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Input Password"
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 pr-10"
            aria-invalid={!isPasswordValid && touched}
            aria-describedby="pwd-error"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {/* simple eye icon */}
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3l18 18"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.88 9.88A3 3 0 0114.12 14.12"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.94 17.94C16.24 19.08 14.14 19.75 12 19.75 7.5 19.75 3.86 16.78 2 12c.95-2.6 2.72-4.62 4.88-5.88"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2.5 12s3-6.5 9.5-6.5S21.5 12 21.5 12s-3 6.5-9.5 6.5S2.5 12 2.5 12z"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
        {!isPasswordValid && touched && (
          <p id="pwd-error" className="mt-2 text-xs text-red-600">
            Password must be at least 8 characters
          </p>
        )}
      </div>

      {/* Confirm password */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Confirm password
        </label>
        <div className="relative bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg px-4 py-3">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Enter Password again"
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 pr-10"
            aria-invalid={!isConfirmMatch && touched}
            aria-describedby="confirm-error"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowConfirmPassword((s) => !s)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              /* eye-off icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3l18 18"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.88 9.88A3 3 0 0114.12 14.12"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.94 17.94C16.24 19.08 14.14 19.75 12 19.75 7.5 19.75 3.86 16.78 2 12c.95-2.6 2.72-4.62 4.88-5.88"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2.5 12s3-6.5 9.5-6.5S21.5 12 21.5 12s-3 6.5-9.5 6.5S2.5 12 2.5 12z"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
        {!isConfirmMatch && touched && (
          <p id="confirm-error" className="mt-2 text-xs text-red-600">
            Passwords do not match
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="mb-4">
        <button
          type="submit"
          disabled={!isValid}
          aria-disabled={!isValid}
          className={`w-full rounded-xl py-4 font-medium text-lg transition-all ${
            isValid
              ? "bg-[#6500AC] text-white hover:opacity-95 focus:ring-2 focus:ring-[#6500AC]/40"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Proceed
        </button>
      </div>

      {/* Terms */}
      <p className="text-center text-xs text-gray-600 mb-6 max-w-[320px] mx-auto">
        By clicking on “Proceed”, You agree to our{" "}
        <a href="#" className="text-[#6500AC] underline">
          Terms of service
        </a>{" "}
        and{" "}
        <a href="#" className="text-[#6500AC] underline">
          Privacy Policy
        </a>
      </p>

      {/* divider + or */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[#F0F2F5]" />
        <div className="text-sm text-gray-500 px-3">Or</div>
        <div className="flex-1 h-px bg-[#F0F2F5]" />
      </div>

      {/* Google */}
      <div className="mb-8">
        <button
          type="button"
          className="w-full border border-[#F0F1F2] rounded-lg py-4 flex items-center justify-center gap-3 bg-white"
        >
          {/* Google icon (inline) */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden
          >
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
      </div>
    </form>
  );
};
