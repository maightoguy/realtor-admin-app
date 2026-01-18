import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { checkSupabaseConnection } from "./services/supabaseClient";
import { authManager } from "./services/authManager";

const hasRecoveryTokensInHash = () => {
  const hash = window.location.hash || "";
  return hash.includes("type=recovery");
};

if (
  window.location.pathname !== "/reset-password" &&
  hasRecoveryTokensInHash()
) {
  try {
    localStorage.setItem("realtor_app_recovery_mode", "1");
  } catch {
    // ignore
  }
  window.location.replace(`/reset-password${window.location.hash}`);
}

// Check Supabase connection on app launch
checkSupabaseConnection();

// Initialize auth manager (handles user persistence and token refresh)
authManager.initialize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
