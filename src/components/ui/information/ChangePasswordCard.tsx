import { useState } from "react";
import { Lock, Save, X } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import SectionHeader from "../../shared/SectionHeader";
import { getErrorMessage } from "../../../api/errors";
import useToast from "../../../hooks/useToast";
import * as userService from "../../../services/user.service";


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


function validatePassword(form: PasswordForm): PasswordErrors {
  const errors: PasswordErrors = {};
  if (!form.currentPassword)
    errors.currentPassword = "Current password is required.";
  if (!form.newPassword)
    errors.newPassword = "New password is required.";
  else if (form.newPassword.length < 6)
    errors.newPassword = "Password must be at least 6 characters.";
  if (!form.confirmPassword)
    errors.confirmPassword = "Please confirm your new password.";
  else if (form.newPassword !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

const EMPTY_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};


interface ChangePasswordCardProps {
  onSuccess?: () => void;
}


function ChangePasswordCard({ onSuccess }: ChangePasswordCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PasswordForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

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
      await userService.changePassword(
        form.currentPassword,
        form.newPassword,
      );
      showToast("success", "Password Updated", "Your password has been changed.");
      handleCancel();
      onSuccess?.();
    } catch (err) {
      showToast("error", "Update Failed", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex flex-col gap-5">
      <SectionHeader
        icon={Lock}
        title="Password"
        description="Manage your account password"
      />

      {!showForm ? (
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-primary-50 border border-primary-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text-600">Password</span>
            <span className="text-xs text-text-400">••••••••••••</span>
          </div>
          <Button
            label="Change Password"
            icon={Lock}
            variant="secondary"
            onClick={() => setShowForm(true)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4 rounded-lg border border-primary-200 bg-primary-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-600">
              Change Password
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
              Current Password
            </label>
            <Input
              type="password"
              value={form.currentPassword}
              placeholder="Enter current password"
              onChange={field("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-error">{errors.currentPassword}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">
                New Password
              </label>
              <Input
                type="password"
                value={form.newPassword}
                placeholder="Min 6 characters"
                onChange={field("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-error">{errors.newPassword}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">
                Confirm Password
              </label>
              <Input
                type="password"
                value={form.confirmPassword}
                placeholder="Repeat new password"
                onChange={field("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-error">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              onClick={handleCancel}
              className="bg-transparent border border-primary-300 text-text-600 hover:bg-primary-100"
            />
            <Button
              label={saving ? "Saving..." : "Update Password"}
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