import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import EmailConfirmed from "./pages/EmailConfirmed";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route path="/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
