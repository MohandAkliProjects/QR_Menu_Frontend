import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Phone,
  Globe,
  Edit2,
  Save,
  Plus,
  User,
  Lock,
  X,
} from "lucide-react";

import { getErrorMessage } from "../../api/errors";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import SectionHeader from "../../components/shared/SectionHeader";
import PhoneNumberItem from "../../components/ui/information/PhoneNumberItem";
import SocialMediaItem from "../../components/ui/information/SocialMediaItem";
import AvatarUpload from "../../components/ui/AvatarUpload";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import {
  restaurantFormToUpdateRequest,
  restaurantResponseToForm,
} from "../../lib/mappers";
import * as restaurantService from "../../services/restaurant.service";
import * as userService from "../../services/user.service";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
}

interface RestaurantForm {
  restaurantName: string;
  emailAddress: string;
  address: string;
  city: string;
  phones: { id: number; value: string }[];
  socials: SocialLink[];
  logoUrl: string | null;
}

interface RestaurantFormErrors {
  restaurantName?: string;
  emailAddress?: string;
  address?: string;
  city?: string;
  phones?: Record<number, string | undefined>;
  socials?: Record<number, string | undefined>;
}

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

const SOCIAL_PLATFORMS = [
  "FaceBook",
  "Instagram",
  "WebSite",
  "Twitter",
  "TikTok",
  "YouTube",
];


function validateRestaurant(form: RestaurantForm): RestaurantFormErrors {
  const errors: RestaurantFormErrors = {};

  if (!form.restaurantName.trim())
    errors.restaurantName = "Restaurant name is required.";
  if (
    form.emailAddress &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress)
  )
    errors.emailAddress = "Enter a valid email address.";

  const phoneErrors: Record<number, string> = {};
  form.phones.forEach((p) => {
    if (!p.value.trim()) phoneErrors[p.id] = "Phone number cannot be empty.";
  });
  if (Object.keys(phoneErrors).length) errors.phones = phoneErrors;

  const socialErrors: Record<number, string> = {};
  const seenPlatforms: Record<string, number> = {};
  form.socials.forEach((s) => {
    if (!s.url.trim()) {
      socialErrors[s.id] = "URL cannot be empty.";
    } else if (!/^https?:\/\/.+/.test(s.url.trim())) {
      socialErrors[s.id] = "URL must start with https://";
    }
    if (seenPlatforms[s.platform] !== undefined) {
      socialErrors[s.id] =
        (socialErrors[s.id] ? `${socialErrors[s.id]} ` : "") +
        `${s.platform} is already added.`;
    } else {
      seenPlatforms[s.platform] = s.id;
    }
  });
  if (Object.keys(socialErrors).length) errors.socials = socialErrors;

  return errors;
}

function validatePassword(form: PasswordForm): PasswordErrors {
  const errors: PasswordErrors = {};
  if (!form.currentPassword)
    errors.currentPassword = "Current password is required.";
  if (!form.newPassword) errors.newPassword = "New password is required.";
  else if (form.newPassword.length < 6)
    errors.newPassword = "Password must be at least 6 characters.";
  if (!form.confirmPassword)
    errors.confirmPassword = "Please confirm your new password.";
  else if (form.newPassword !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}


function InformationPage() {
  const { restaurantId, email: userEmail } = useAuth();

 
  const [avatarKey, setAvatarKey] = useState(0);
  const [deleteLogo, setDeleteLogo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<RestaurantForm | null>(null);
  const [errors, setErrors] = useState<RestaurantFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);


  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const { toasts, showToast, removeToast } = useToast();


  const loadProfile = useCallback(async () => {
    if (!restaurantId) {
      setError("Restaurant session is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const restaurant = await restaurantService.getRestaurant(restaurantId);
      const mapped = restaurantResponseToForm(restaurant);
      setForm({
        restaurantName: mapped.restaurantName,
        emailAddress: restaurant.emailAddress ?? "",
        address: mapped.address,
        city: mapped.city,
        phones: mapped.phones,
        socials: mapped.socials,
        logoUrl: mapped.logoUrl,
      });
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Could not load restaurant profile.",
      );
      setError(message);
      showToast("error", "Load Failed", message);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, showToast]);

  /*useEffect(() => {
    loadProfile();
  }, [loadProfile]);*/

  useEffect(() => {
  let cancelled = false;

  async function run() {
    if (!restaurantId) {
      if (!cancelled) {
        setError("Restaurant session is missing.");
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const restaurant = await restaurantService.getRestaurant(restaurantId);
      const mapped = restaurantResponseToForm(restaurant);
      if (!cancelled) {
        setForm({
          restaurantName: mapped.restaurantName,
          emailAddress: restaurant.emailAddress ?? "",
          address: mapped.address,
          city: mapped.city,
          phones: mapped.phones,
          socials: mapped.socials,
          logoUrl: mapped.logoUrl,
        });
      }
    } catch (err) {
      if (!cancelled) {
        const message = getErrorMessage(err, "Could not load restaurant profile.");
        setError(message);
        showToast("error", "Load Failed", message);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  run();
  return () => { cancelled = true; };
}, [restaurantId, showToast]);

  const field =
    (key: keyof Omit<RestaurantForm, "phones" | "socials">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => (prev ? { ...prev, [key]: e.target.value } : prev));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const updatePhone = (id: number, value: string) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            phones: prev.phones.map((p) => (p.id === id ? { ...p, value } : p)),
          }
        : prev,
    );
    setErrors((prev) => ({
      ...prev,
      phones: { ...prev.phones, [id]: undefined },
    }));
  };

  const deletePhone = (id: number) =>
    setForm((prev) =>
      prev ? { ...prev, phones: prev.phones.filter((p) => p.id !== id) } : prev,
    );

  const addPhone = () =>
    setForm((prev) =>
      prev
        ? { ...prev, phones: [...prev.phones, { id: Date.now(), value: "" }] }
        : prev,
    );

  const updateSocial = (
    id: number,
    key: keyof Omit<SocialLink, "id">,
    value: string,
  ) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            socials: prev.socials.map((s) =>
              s.id === id ? { ...s, [key]: value } : s,
            ),
          }
        : prev,
    );
    setErrors((prev) => ({
      ...prev,
      socials: { ...prev.socials, [id]: undefined },
    }));
  };

  const deleteSocial = (id: number) =>
    setForm((prev) =>
      prev
        ? { ...prev, socials: prev.socials.filter((s) => s.id !== id) }
        : prev,
    );

  const addSocial = () => {
    setForm((prev) => {
      if (!prev) return prev;
      const usedPlatforms = new Set(prev.socials.map((s) => s.platform));
      const nextPlatform =
        SOCIAL_PLATFORMS.find((p) => !usedPlatforms.has(p)) ??
        SOCIAL_PLATFORMS[0];
      return {
        ...prev,
        socials: [
          ...prev.socials,
          { id: Date.now(), platform: nextPlatform, url: "" },
        ],
      };
    });
  };

  const handleEdit = () => {
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setLogoFile(null);
    setDeleteLogo(false);
    setAvatarKey((k) => k + 1); 
    loadProfile();
  };

  const handleSave = async () => {
    if (!restaurantId || !form) {
      showToast("error", "Session Error", "Restaurant session is missing.");
      return;
    }

    const validationErrors = validateRestaurant(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast(
        "error",
        "Validation Error",
        "Please fix the highlighted fields.",
      );
      return;
    }

    setSaving(true);
    try {
      const updated = await restaurantService.updateRestaurant(
        restaurantId,
        restaurantFormToUpdateRequest(form),
        logoFile,
        deleteLogo,
        null,
        false,
      );
      const mapped = restaurantResponseToForm(updated);
      setForm({
        restaurantName: mapped.restaurantName,
        emailAddress: updated.emailAddress ?? "",
        address: mapped.address,
        city: mapped.city,
        phones: mapped.phones,
        socials: mapped.socials,
        logoUrl: mapped.logoUrl,
      });
      setLogoFile(null);
      setIsEditing(false);
      setErrors({});
      showToast(
        "success",
        "Profile Saved",
        "Your restaurant profile has been updated.",
      );
    } catch (err) {
      showToast("error", "Save Failed", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const passwordField =
    (key: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({ ...prev, [key]: e.target.value }));
      setPasswordErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleCancelPassword = () => {
    setShowPasswordForm(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  };

  const handleSavePassword = async () => {
    const errs = validatePassword(passwordForm);
    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      showToast(
        "success",
        "Password Updated",
        "Your password has been changed.",
      );
      handleCancelPassword();
    } catch (err) {
      showToast("error", "Update Failed", getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  if (!form && loading) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full">
        <PageLoadingState message="Loading profile..." />
      </div>
    );
  }

  if (!form && error) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <PageErrorState message={error} onRetry={loadProfile} />
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Page header + edit controls */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Profile Settings"
          description="Manage your restaurant profile and digital presence"
          showDescription
        />
        <div className="flex items-center gap-3">
          {isEditing && (
            <Button
              label="Cancel"
              variant="secondary"
              onClick={handleCancel}
            />
          )}
          {isEditing ? (
            <Button
              label={saving ? "Saving..." : "Save Changes"}
              icon={Save}
              onClick={handleSave}
              disabled={saving}
            />
          ) : (
            <Button label="Edit" icon={Edit2} onClick={handleEdit} />
          )}
        </div>
      </div>

      {/* ── Personal Info Card ── */}
      <Card className="flex flex-col gap-5">
        <SectionHeader
          icon={User}
          title="Personal Information"
          description="Your account credentials"
        />
        <div className="flex flex-col gap-4">
          {/* User email — read only, from token */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">
              Account Email
            </label>
            <Input
              value={userEmail ?? ""}
              readOnly
              placeholder="your@email.com"
            />
            <p className="text-xs text-text-400">
              This is the email you use to log in. Contact support to change it.
            </p>
          </div>

          {/* Password section */}
          {!showPasswordForm ? (
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-primary-50 border border-primary-200">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text-600">
                  Password
                </span>
                <span className="text-xs text-text-400">••••••••••••</span>
              </div>
              <Button
                label="Change Password"
                icon={Lock}
                variant="secondary"
                onClick={() => setShowPasswordForm(true)}              />
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4 rounded-lg border border-primary-200 bg-primary-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-600">
                  Change Password
                </span>
                <button
                  onClick={handleCancelPassword}
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
                  value={passwordForm.currentPassword}
                  placeholder="Enter current password"
                  onChange={passwordField("currentPassword")}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-error">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-600">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    placeholder="Min 6 characters"
                    onChange={passwordField("newPassword")}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-error">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-600">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    placeholder="Repeat new password"
                    onChange={passwordField("confirmPassword")}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-error">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  label="Cancel"
                  onClick={handleCancelPassword}
                  className="bg-transparent border border-primary-300 text-text-600 hover:bg-primary-100"
                />
                <Button
                  label={savingPassword ? "Saving..." : "Update Password"}
                  icon={Save}
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Restaurant Info Card ── */}
      <Card className="flex flex-col gap-5">
        <SectionHeader
          icon={Building2}
          title="Business Information"
          description="Restaurant profile details"
        />
        <div className="flex flex-col gap-4">
          <AvatarUpload
            key={avatarKey}  
            isEditing={isEditing}
            initialUrl={form.logoUrl}
            onFileSelected={(file) => {
              setLogoFile(file);
              setDeleteLogo(false);
            }}
            onDelete={() => {
              setDeleteLogo(true);
              setLogoFile(null);
            }}
          />
          <div className="border-t border-primary-200" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">
              Restaurant Name
            </label>
            <Input
              value={form.restaurantName}
              readOnly={!isEditing}
              placeholder="Restaurant name"
              onChange={field("restaurantName")}
            />
            {errors.restaurantName && (
              <p className="text-xs text-error">{errors.restaurantName}</p>
            )}
          </div>

          {/* Restaurant contact email — different from login email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">
              Restaurant Contact Email
            </label>
            <Input
              value={form.emailAddress}
              readOnly={!isEditing}
              placeholder="contact@restaurant.com"
              onChange={field("emailAddress")}
            />
            {errors.emailAddress && (
              <p className="text-xs text-error">{errors.emailAddress}</p>
            )}
            <p className="text-xs text-text-400">
              This email is shown to customers, not used for login.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">
                Address
              </label>
              <Input
                value={form.address}
                readOnly={!isEditing}
                placeholder="Street address"
                onChange={field("address")}
              />
              {errors.address && (
                <p className="text-xs text-error">{errors.address}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">City</label>
              <Input
                value={form.city}
                readOnly={!isEditing}
                placeholder="City"
                onChange={field("city")}
              />
              {errors.city && (
                <p className="text-xs text-error">{errors.city}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Phone Numbers Card ── */}
      <Card className="flex flex-col gap-5">
        <SectionHeader
          icon={Phone}
          title="Phone Numbers"
          description="Manage contact numbers"
          action={
            isEditing && (
              <Button label="Add Number" icon={Plus} onClick={addPhone} />
            )
          }
        />
        <div className="flex flex-col gap-3">
          {form.phones.length === 0 && (
            <p className="text-sm text-text-400 text-center py-2">
              No phone numbers added yet.
            </p>
          )}
          {form.phones.map((phone) => (
            <div key={phone.id} className="flex flex-col gap-1">
              <PhoneNumberItem
                value={phone.value}
                isEditing={isEditing}
                onChange={(v) => updatePhone(phone.id, v)}
                onDelete={() => deletePhone(phone.id)}
              />
              {errors.phones?.[phone.id] && (
                <p className="text-xs text-error pl-1">
                  {errors.phones[phone.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Social Media Card ── */}
      <Card className="flex flex-col gap-5">
        <SectionHeader
          icon={Globe}
          title="Social Media"
          description="Connect your social profiles"
          action={
            isEditing && (
              <Button label="Add Link" icon={Plus} onClick={addSocial} />
            )
          }
        />
        <div className="flex flex-col gap-3">
          {form.socials.length === 0 && (
            <p className="text-sm text-text-400 text-center py-2">
              No social links added yet.
            </p>
          )}
          {form.socials.map((social) => (
            <div key={social.id} className="flex flex-col gap-1">
              <SocialMediaItem
                platform={social.platform}
                url={social.url}
                isEditing={isEditing}
                onPlatformChange={(v) => updateSocial(social.id, "platform", v)}
                onUrlChange={(v) => updateSocial(social.id, "url", v)}
                onDelete={() => deleteSocial(social.id)}
              />
              {errors.socials?.[social.id] && (
                <p className="text-xs text-error pl-1">
                  {errors.socials[social.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default InformationPage;