import { useState } from "react";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import IconInput from "../../components/ui/IconInput";
import { ApiClientError } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/useLanguage";
import { loginText } from "./text/LoginPage.text";
import { generalText } from "./text/General.text";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function validate(
  form: FormState,
  t: (typeof loginText)[keyof typeof loginText]
): FormErrors {
  const errors: FormErrors = {};
  if (!form.email.trim()) {
    errors.email = t.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t.emailInvalid;
  }
  if (!form.password.trim()) {
    errors.password = t.passwordRequired;
  } else if (form.password.length < 6) {
    errors.password = t.passwordMinLength;
  }
  return errors;
}

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = loginText[language];
  const gt = generalText[language];

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const field =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined, general: undefined }));
    };

  const handleSubmit = async () => {
    const validationErrors = validate(form, t);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (error) {
      if(error instanceof ApiClientError) {
        if(error.status === 401) { // Unauthorized
          setErrors({ 
            general: t.invalidEmailOrPassword 
          });
        } else {
          setErrors({
            general: gt.error,
          });
        }
      } else {
        setErrors({
          general: gt.error,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-1 mb-8">
        <h1 className="text-3xl font-bold text-primary-800">{t.appTitle}</h1>
        <p className="text-base text-text-400">{t.appSubtitle}</p>
      </div>

      <Card className="w-full max-w-md flex flex-col gap-6">
        <h2 className="text-xl font-bold text-dark-700 text-center">
          {t.welcomeBack}
        </h2>

        {errors.general && (
          <div className="px-4 py-3 rounded-xl bg-error-bg border border-error text-sm text-error">
            {errors.general}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">
              {t.emailLabel}
            </label>
            <IconInput
              id="email"
              name="email"
              icon={Mail}
              type="email"
              placeholder={t.emailPlaceholder}
              value={form.email}
              onChange={field("email")}
              error={errors.email}
              autocomplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <IconInput
                id="password"
                name="password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={form.password}
                onChange={field("password")}
                error={errors.password}
                autocomplete="current-password"
                className="[&::-webkit-credentials-auto-fill-button]:hidden [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-400 hover:text-text-600 transition-colors hover:cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            label={loading ? t.signingIn : t.signIn}
            icon={LogIn}
            disabled={loading}
            fullWidth
            type="submit"
          />
        </form>
      </Card>

      <p className="mt-8 text-sm text-text-400">{t.copyright}</p>
    </div>
  );
}

export default LoginPage;