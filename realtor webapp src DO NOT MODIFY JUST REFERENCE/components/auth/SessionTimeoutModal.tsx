import { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
  remainingTime: number; // in milliseconds
}

const SessionTimeoutModal = ({
  isOpen,
  onStayLoggedIn,
  onLogout,
  remainingTime,
}: SessionTimeoutModalProps) => {
  const [timeLeft, setTimeLeft] = useState(Math.ceil(remainingTime / 1000));

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(Math.ceil(remainingTime / 1000));

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, remainingTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              Session Expiring
            </h3>
            <p className="text-gray-500">
              For your security, your session will end in{" "}
              <span className="font-bold text-amber-600">
                {timeLeft} seconds
              </span>{" "}
              due to inactivity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Log out
            </button>
            <button
              onClick={onStayLoggedIn}
              className="flex-1 px-4 py-2.5 bg-[#5E17EB] text-white font-semibold rounded-xl hover:bg-[#4a11b8] transition-colors flex items-center justify-center gap-2"
            >
              <Clock size={18} />
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
