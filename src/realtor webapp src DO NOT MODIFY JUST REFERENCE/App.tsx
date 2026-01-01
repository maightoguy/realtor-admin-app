// src/App.tsx (updated)
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing";
import Registration from "./pages/Registration";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { UserProvider } from "./context/UserContext"; // Add this import
import RequireAuth from "./components/auth/RequireAuth";
import { useIdleTimeout } from "./hooks/useIdleTimeout";

function AppContent() {
  // Use idle timeout hook (30 minutes)
  useIdleTimeout(30 * 60 * 1000);

  return (
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
