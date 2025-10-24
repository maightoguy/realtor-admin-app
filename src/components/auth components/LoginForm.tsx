import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onForgot: () => void;
  onSuccess: (email: string) => void;
  onSignup?: () => void;
  onGoogle?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgot, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in both fields");
      return;
    }

    setLoading(true);

    // Simulate backend verification delay
    setTimeout(() => {
      setLoading(false);
      console.log("✅ Mock login successful for:", email);
      alert("Mock login success! Proceeding to OTP...");
      onSuccess(email); // pass to OTP
    }, 1500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-6 max-w-sm mx-auto justify-center p-6 md:mt-20"
    >
      <div className="">
        <h2 className="text-[25px] font-bold text-gray-900">
          Welcome back Admin!
        </h2>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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

      {/* Login */}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full py-3 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Login"}
      </button>

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
    </form>
  );
};

export default LoginForm;
