import { useState } from "react";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import IconInput from "../../components/ui/IconInput";
import { getErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.password.trim()) {
    errors.password = "Password is required.";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  return errors;
}

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const field = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined, general: undefined }));
    };

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (error) {
      setErrors({ general: getErrorMessage(error, "Invalid email or password.") });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-1 mb-8">
        <h1 className="text-3xl font-bold text-primary-800">Spectral QR</h1>
        <p className="text-base text-text-400">Restaurant Admin Dashboard</p>
      </div>

      <Card className="w-full max-w-md flex flex-col gap-6">
        <h2 className="text-xl font-bold text-dark-700 text-center">Welcome Back</h2>

        {errors.general && (
          <div className="px-4 py-3 rounded-xl bg-error-bg border border-error text-sm text-error">
            {errors.general}
          </div>
        )}

        <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">Email</label>
            <IconInput
              icon={Mail}
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={field("email")}
              error={errors.email}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">Password</label>
            <div className="relative">
              <IconInput
  icon={Lock}
  type={showPassword ? "text" : "password"}
  placeholder="Enter your password"
  value={form.password}
  onChange={field("password")}
  error={errors.password}
  className="[&::-webkit-credentials-auto-fill-button]:hidden [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
/>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-400 hover:text-text-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <Button
          label={loading ? "Signing in..." : "Sign In"}
          icon={LogIn}
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
        />
      </Card>

      <p className="mt-8 text-sm text-text-400">
        © 2024 Spectral QR. All rights reserved.
      </p>
    </div>
  );
}

export default LoginPage;