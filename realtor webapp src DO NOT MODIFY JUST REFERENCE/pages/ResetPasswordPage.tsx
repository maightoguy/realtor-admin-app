import AuthLayout from "../components/auth/AuthLayout";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <ResetPasswordForm
        onBack={() => navigate("/login", { replace: true })}
        onDone={() => navigate("/login", { replace: true })}
      />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
