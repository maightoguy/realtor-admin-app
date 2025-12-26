// src/App.tsx (updated)
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing";
import Registration from "./pages/Registration";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { UserProvider } from "./context/UserContext"; // Add this import
import RequireAuth from "./components/auth/RequireAuth";

function App() {
  return (
    <UserProvider>
      {" "}
      {/* Wrap the entire app */}
      <Router>
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
      </Router>
    </UserProvider>
  );
}

export default App;
