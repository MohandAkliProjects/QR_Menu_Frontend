import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import IconInput from "../../components/ui/IconInput";

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
  const [form, setForm]     = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

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
      // TODO: replace with real API call
      // const res = await api.login(form.email, form.password);
      navigate("/dashboard");

      // mock — remove when backend is ready
      await new Promise((r) => setTimeout(r, 800));
      if (form.email === "spectral@gmail.com" && form.password === "123456") {
        navigate("/dashboard");
      } else {
        setErrors({ general: "Invalid email or password." });
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center px-4">

      {/* brand */}
      <div className="flex flex-col items-center gap-1 mb-8">
        <h1 className="text-3xl font-bold text-primary-800">Spectral QR</h1>
        <p className="text-base text-text-400">Restaurant Admin Dashboard</p>
      </div>

      {/* card */}
      <Card className="w-full max-w-md flex flex-col gap-6">

        <h2 className="text-xl font-bold text-dark-700 text-center">Welcome Back</h2>

        {/* general error */}
        {errors.general && (
          <div className="px-4 py-3 rounded-xl bg-error-bg border border-error text-sm text-error">
            {errors.general}
          </div>
        )}

        {/* fields */}
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
            <IconInput
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={field("password")}
              error={errors.password}
            />
          </div>
        </div>

        {/* submit */}
        <Button
          label={loading ? "Signing in..." : "Sign In"}
          icon={LogIn}
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
        />
      </Card>

      {/* footer */}
      <p className="mt-8 text-sm text-text-400">
        © 2024 Spectral QR. All rights reserved.
      </p>

    </div>
  );
}

export default LoginPage;