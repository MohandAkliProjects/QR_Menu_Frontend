import { useState } from "react";
import { Lock, Save, X } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import SectionHeader from "../../shared/SectionHeader";
import { getErrorMessage } from "../../../api/errors";
import useToast from "../../../hooks/useToast";
import { useLanguage } from "../../../i18n/useLanguage";
import * as userService from "../../../services/user.service";
import { changePasswordText } from "../text/ChangePasswordCard.text";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ChangePasswordCardProps {
  onSuccess?: () => void;
}

const EMPTY_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function ChangePasswordCard({ onSuccess }: ChangePasswordCardProps) {
  const { language } = useLanguage();
  const t = changePasswordText[language];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PasswordForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const validatePassword = (form: PasswordForm): PasswordErrors => {
    const errors: PasswordErrors = {};
    if (!form.currentPassword) errors.currentPassword = t.errorCurrentRequired;
    if (!form.newPassword) errors.newPassword = t.errorNewRequired;
    else if (form.newPassword.length < 6) errors.newPassword = t.errorNewMinLength;
    if (!form.confirmPassword) errors.confirmPassword = t.errorConfirmRequired;
    else if (form.newPassword !== form.confirmPassword) errors.confirmPassword = t.errorConfirmMatch;
    return errors;
  };

  const field =
    (key: keyof PasswordForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleCancel = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSave = async () => {
    const errs = validatePassword(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword(form.currentPassword, form.newPassword);
      showToast("success", t.toastSuccessTitle, t.toastSuccessMessage);
      handleCancel();
      onSuccess?.();
    } catch (err) {
      showToast("error", t.toastErrorTitle, getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex flex-col gap-5">
      <SectionHeader
        icon={Lock}
        title={t.sectionTitle}
        description={t.sectionDescription}
      />

      {!showForm ? (
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-primary-50 border border-primary-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text-600">{t.passwordLabel}</span>
            <span className="text-xs text-text-400">{t.passwordMask}</span>
          </div>
          <Button
            label={t.changePasswordBtn}
            icon={Lock}
            variant="secondary"
            onClick={() => setShowForm(true)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4 rounded-lg border border-primary-200 bg-primary-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-600">
              {t.changePasswordTitle}
            </span>
            <button
              onClick={handleCancel}
              className="text-text-400 hover:text-text-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">
              {t.currentPasswordLabel}
            </label>
            <Input
              type="password"
              value={form.currentPassword}
              placeholder={t.currentPasswordPlaceholder}
              onChange={field("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-error">{errors.currentPassword}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">
                {t.newPasswordLabel}
              </label>
              <Input
                type="password"
                value={form.newPassword}
                placeholder={t.newPasswordPlaceholder}
                onChange={field("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-error">{errors.newPassword}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">
                {t.confirmPasswordLabel}
              </label>
              <Input
                type="password"
                value={form.confirmPassword}
                placeholder={t.confirmPasswordPlaceholder}
                onChange={field("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-error">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              label={t.cancel}
              onClick={handleCancel}
              className="bg-transparent border border-primary-300 text-text-600 hover:bg-primary-100"
            />
            <Button
              label={saving ? t.saving : t.save}
              icon={Save}
              onClick={handleSave}
              disabled={saving}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

export default ChangePasswordCard;