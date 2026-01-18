import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { authService } from "../services/authService";

const ConfirmDeletePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const startedAt = Date.now();

      while (!cancelled && Date.now() - startedAt < 8000) {
        try {
          const { data } = await authService.getSession();
          if (data.session) {
            navigate(
              "/dashboard?tab=Settings&settingsTab=Profile&confirmDelete=1",
              { replace: true }
            );
            return;
          }
        } catch {
          // ignore
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (!cancelled) {
        setError("Confirmation link expired. Please request a new one.");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <AuthLayout>
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Confirming your request
        </h2>
        {!error ? (
          <p className="text-gray-600 text-sm">
            Please wait while we verify your link.
          </p>
        ) : (
          <p className="text-red-600 text-sm">{error}</p>
        )}
      </div>
    </AuthLayout>
  );
};

export default ConfirmDeletePage;
