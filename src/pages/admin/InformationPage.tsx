import { useCallback, useEffect, useState } from "react";
import { Building2, Phone, Globe, Edit2, Save, Plus } from "lucide-react";

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

interface SocialLink {
  id: number;
  platform: string;
  url: string;
}

interface FormData {
  restaurantName: string;
  email: string;
  password: string;
  address: string;
  city: string;
  phones: { id: number; value: string }[];
  socials: SocialLink[];
  logoUrl: string | null;
}

interface FormErrors {
  restaurantName?: string;
  email?: string;
  password?: string;
  address?: string;
  city?: string;
  phones?: Record<number, string | undefined>;
  socials?: Record<number, string | undefined>;
}

const SOCIAL_PLATFORMS = [
  "FaceBook",
  "Instagram",
  "WebSite",
  "Twitter",
  "TikTok",
  "YouTube",
];

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.restaurantName.trim())
    errors.restaurantName = "Restaurant name is required.";
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.city.trim()) errors.city = "City is required.";

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

function InformationPage() {
  const { restaurantId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
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
      console.log("API RESPONSE", restaurant);
      setForm(restaurantResponseToForm(restaurant));
    } catch (err) {
      const message = getErrorMessage(err, "Could not load restaurant profile.");
      setError(message);
      showToast("error", "Load Failed", message);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, showToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── ALL HANDLERS DEFINED HERE ──────────────────────────────────────
  // must be before early returns so they are always defined

  const field =
    (key: keyof Omit<FormData, "phones" | "socials">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => (prev ? { ...prev, [key]: e.target.value } : prev));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const updatePhone = (id: number, value: string) => {
    setForm((prev) =>
      prev
        ? { ...prev, phones: prev.phones.map((p) => (p.id === id ? { ...p, value } : p)) }
        : prev
    );
    setErrors((prev) => ({
      ...prev,
      phones: { ...prev.phones, [id]: undefined },
    }));
  };

  const deletePhone = (id: number) =>
    setForm((prev) =>
      prev ? { ...prev, phones: prev.phones.filter((p) => p.id !== id) } : prev
    );

  const addPhone = () =>
    setForm((prev) =>
      prev
        ? { ...prev, phones: [...prev.phones, { id: Date.now(), value: "" }] }
        : prev
    );

  const updateSocial = (
    id: number,
    key: keyof Omit<SocialLink, "id">,
    value: string
  ) => {
    setForm((prev) =>
      prev
        ? { ...prev, socials: prev.socials.map((s) => (s.id === id ? { ...s, [key]: value } : s)) }
        : prev
    );
    setErrors((prev) => ({
      ...prev,
      socials: { ...prev.socials, [id]: undefined },
    }));
  };

  const deleteSocial = (id: number) =>
    setForm((prev) =>
      prev ? { ...prev, socials: prev.socials.filter((s) => s.id !== id) } : prev
    );

  const addSocial = () => {
    setForm((prev) => {
      if (!prev) return prev;
      const usedPlatforms = new Set(prev.socials.map((s) => s.platform));
      const nextPlatform =
        SOCIAL_PLATFORMS.find((p) => !usedPlatforms.has(p)) ?? SOCIAL_PLATFORMS[0];
      return {
        ...prev,
        socials: [...prev.socials, { id: Date.now(), platform: nextPlatform, url: "" }],
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
    loadProfile();
  };

  const handleSave = async () => {
     console.log("FORM:", form);

    if (!restaurantId || !form) {
      showToast("error", "Session Error", "Restaurant session is missing.");
      return;
    }

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("error", "Validation Error", "Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      if (logoFile) {
        try {
          await restaurantService.uploadLogo(restaurantId, logoFile);
          setLogoFile(null);
        } catch (err) {
          showToast("error", "Logo Upload Failed", getErrorMessage(err));
        }
      }

      const updated = await restaurantService.updateRestaurant(
        restaurantId,
        restaurantFormToUpdateRequest(form)
      );
      setForm(restaurantResponseToForm(updated));
      setIsEditing(false);
      setErrors({});
      showToast("success", "Profile Saved", "Your restaurant profile has been updated.");
    } catch (err) {
      showToast("error", "Save Failed", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── EARLY RETURNS AFTER ALL HANDLERS ───────────────────────────────

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

  // ── RENDER ─────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      <ToastContainer toasts={toasts} onClose={removeToast} />

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
              onClick={handleCancel}
              className="bg-transparent border border-primary-300 text-text-600 hover:bg-primary-100"
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

      <Card className="flex flex-col gap-5">
        <SectionHeader
          icon={Building2}
          title="Business Information"
          description="Restaurant profile details"
        />
        <div className="flex flex-col gap-4">
          <AvatarUpload
            isEditing={isEditing}
            initialUrl={form.logoUrl}
            onFileSelected={(file) => setLogoFile(file)}
          />
          <div className="border-t border-primary-200" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">Restaurant Name</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">Email</label>
              <Input
                value={form.email}
                readOnly={!isEditing}
                placeholder="email@example.com"
                onChange={field("email")}
              />
              {errors.email && <p className="text-xs text-error">{errors.email}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">Password</label>
              <Input value={form.password} readOnly placeholder="••••••••" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">Address</label>
              <Input
                value={form.address}
                readOnly={!isEditing}
                placeholder="Street address"
                onChange={field("address")}
              />
              {errors.address && <p className="text-xs text-error">{errors.address}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">City</label>
              <Input
                value={form.city}
                readOnly={!isEditing}
                placeholder="City"
                onChange={field("city")}
              />
              {errors.city && <p className="text-xs text-error">{errors.city}</p>}
            </div>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-5">
        <SectionHeader
          icon={Phone}
          title="Phone Numbers"
          description="Manage contact numbers"
          action={isEditing && <Button label="Add Number" icon={Plus} onClick={addPhone} />}
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
                <p className="text-xs text-error pl-1">{errors.phones[phone.id]}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-5">
        <SectionHeader
          icon={Globe}
          title="Social Media"
          description="Connect your social profiles"
          action={isEditing && <Button label="Add Link" icon={Plus} onClick={addSocial} />}
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
                <p className="text-xs text-error pl-1">{errors.socials[social.id]}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default InformationPage;