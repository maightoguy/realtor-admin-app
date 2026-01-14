// src/App.tsx (updated)
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing";
import Registration from "./pages/Registration";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { UserProvider, useUser } from "./context/UserContext"; // Add this import
import RequireAuth from "./components/auth/RequireAuth";
import { useIdleTimeout } from "./hooks/useIdleTimeout";
import SessionTimeoutModal from "./components/auth/SessionTimeoutModal";

function AppContent() {
  const { user } = useUser();

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
