// src/App.tsx (updated)
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LandingPage from "./pages/Landing";
import Registration from "./pages/Registration";
import LoginPage from "./pages/LoginPage";
import EmailConfirmedPage from "./pages/EmailConfirmed";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmDeletePage from "./pages/ConfirmDeletePage";
import Dashboard from "./pages/Dashboard";
import { UserProvider, useUser } from "./context/UserContext"; // Add this import
import RequireAuth from "./components/auth/RequireAuth";
import { useIdleTimeout } from "./hooks/useIdleTimeout";
import SessionTimeoutModal from "./components/auth/SessionTimeoutModal";
import { useEffect } from "react";
import { authService } from "./services/authService";

function AppContent() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isRecoveryNow =
    location.hash.includes("type=recovery") ||
    location.search.includes("mode=recovery") ||
    location.search.includes("type=recovery");

  useEffect(() => {
    try {
      if (isRecoveryNow) {
        localStorage.setItem("realtor_app_recovery_mode", "1");
      } else {
        localStorage.removeItem("realtor_app_recovery_mode");
      }
    } catch {
      // ignore
    }
  }, [isRecoveryNow]);

  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!isRecoveryNow) return;

    if (location.pathname !== "/reset-password") {
      navigate(`/reset-password${location.hash}`, { replace: true });
    }
  }, [isRecoveryNow, location.hash, location.pathname, navigate]);

  // Best Practice: 30 mins for standard users, 15 mins for admins
  const timeoutDuration =
    user?.role === "admin" ? 15 * 60 * 1000 : 30 * 60 * 1000;

  const { isWarning, resetTimer, logout } = useIdleTimeout({
    timeout: timeoutDuration,
    warningTime: 60 * 1000, // 1 minute warning
    enabled: !!user,
  });

  return (
    <>
      <SessionTimeoutModal
        isOpen={isWarning}
        onStayLoggedIn={resetTimer}
        onLogout={logout}
        remainingTime={60 * 1000}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/confirm-delete" element={<ConfirmDeletePage />} />
        <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      {" "}
      {/* Wrap the entire app */}
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
