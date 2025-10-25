import { useEffect, useState } from "react";

interface OTPFormProps {
  email: string;
  onBack: () => void;
  onVerified: () => void | Promise<void>;
}

const OTPForm: React.FC<OTPFormProps> = ({ email, onBack, onVerified }) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(59);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const next = document.getElementById(`otp-${index + 1}`);
        next?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length === 6) {
      alert("Mock OTP verified!");
      setTimeout(onVerified, 1000);
    } else {
      alert("Please enter all 6 digits");
    }
  };

  const isDisabled = otp.join("").length < 6;

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 md:my-[50%]">
      {/* Back Button */}
      <div className="w-full max-w-sm mb-8">
        <button
          type="button"
          onClick={onBack}
          className="text-2xl text-gray-700 hover:text-purple-700 "
        >
          ←
        </button>
      </div>

      {/* Content */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col items-center gap-6"
      >
        {/* Heading */}
        <div className="text-start">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            OTP Verification
          </h2>
          <p className="text-gray-500 text-sm">
            Please enter the 6-digit sent to{" "}
            <span className="font-semibold text-black">{email}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-between w-full max-w-xs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          ))}
        </div>

        {/* Countdown */}
        <p className="text-gray-600 text-sm">
          Resend In{" "}
          <span className="text-purple-700 font-medium">
            00:{timeLeft.toString().padStart(2, "0")}
          </span>
        </p>

        {/* Confirm Button */}
        <button
          type="submit"
          disabled={isDisabled}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            isDisabled
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-purple-700 hover:bg-purple-800"
          }`}
        >
          Confirm OTP
        </button>
      </form>
    </div>
  );
};

export default OTPForm;
