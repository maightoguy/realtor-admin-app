import { useState } from "react";
import { Link } from "react-router-dom";

interface ForgotPasswordFormProps {
  onOtp: (email: string) => void;
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onOtp,
  onBack,
}) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onOtp(email);
  };

  const isActive = email.trim() !== "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
      {/*md:items-center md:my-[50%] md:justify-center*/}

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 ">
        {/* Header */}
        <div className="flex flex-col items-start justify-start gap-3 ">
          <button type="button" onClick={onBack}>
            <span className="text-2xl font-bold text-gray-700">←</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">
            Forgot Password
          </h2>
        </div>

        <p className="text-gray-500 text-sm text-left">
          Don’t have an account?{" "}
          <Link to="/register" className="text-purple-700 font-medium">
            Sign Up
          </Link>
        </p>

        {/* Email Field */}
        <div className="text-left">
          <label className="block text-gray-600 font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g ****@mail.com"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-400"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isActive}
          className={`w-full py-3 rounded-xl font-semibold text-white transition ${
            isActive
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Send OTP
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
