import { useState } from "react";
import { Building2, Phone, Globe, Edit2, Save, Plus } from "lucide-react";

import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import SectionHeader from "../../components/shared/SectionHeader";
import PhoneNumberItem from "../../components/ui/information/PhoneNumberItem";
import SocialMediaItem from "../../components/ui/information/SocialMediaItem";
import AvatarUpload from "../../components/ui/AvatarUpload";

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
}

interface FormErrors {
  restaurantName?: string;
  email?: string;
  password?: string;
  address?: string;
  city?: string;
  phones?: Record<number, string | undefined>; // ← add | undefined
  socials?: Record<number, string | undefined>; // ← add | undefined
}

const INITIAL: FormData = {
  restaurantName: "Spectral",
  email: "spectral@gmail.com",
  password: "············",
  address: "140 log B 3 N 22",
  city: "Algeria",
  phones: [{ id: 1, value: "05 58 76 58 96" }],
  socials: [
    { id: 1, platform: "FaceBook", url: "" },
    { id: 2, platform: "Instagram", url: "" },
  ],
};

const SOCIAL_PLATFORMS = [
  "FaceBook",
  "Instagram",
  "WebSite",
  "Twitter",
  "TikTok",
  "YouTube",
];

// ── validation ─────────────────────────────────────────
function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.restaurantName.trim())
    errors.restaurantName = "Restaurant name is required.";
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.password.trim()) errors.password = "Password is required.";
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.city.trim()) errors.city = "City is required.";

  // phones — each must be non-empty
  const phoneErrors: Record<number, string> = {};
  form.phones.forEach((p) => {
    if (!p.value.trim()) phoneErrors[p.id] = "Phone number cannot be empty.";
  });
  if (Object.keys(phoneErrors).length) errors.phones = phoneErrors;

  // socials — url must be filled + no duplicate platforms
  const socialErrors: Record<number, string> = {};
  const seenPlatforms: Record<string, number> = {}; // platform → first id

  form.socials.forEach((s) => {
    if (!s.url.trim()) {
      socialErrors[s.id] = "URL cannot be empty.";
    } else if (!/^https?:\/\/.+/.test(s.url.trim())) {
      socialErrors[s.id] = "URL must start with https://";
    }

    if (seenPlatforms[s.platform] !== undefined) {
      // mark the duplicate (current row), not the first one
      socialErrors[s.id] =
        (socialErrors[s.id] ? socialErrors[s.id] + " " : "") +
        `${s.platform} is already added.`;
    } else {
      seenPlatforms[s.platform] = s.id;
    }
  });
  if (Object.keys(socialErrors).length) errors.socials = socialErrors;

  return errors;
}

// ── page ───────────────────────────────────────────────
function InformationPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});

  /* ---- field helpers ---- */
  const field =
    (key: keyof Omit<FormData, "phones" | "socials">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      // clear error on change
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  /* ---- phone helpers ---- */
  const updatePhone = (id: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      phones: prev.phones.map((p) => (p.id === id ? { ...p, value } : p)),
    }));
    setErrors((prev) => ({
      ...prev,
      phones: { ...prev.phones, [id]: undefined },
    }));
  };

  const deletePhone = (id: number) =>
    setForm((prev) => ({
      ...prev,
      phones: prev.phones.filter((p) => p.id !== id),
    }));

  const addPhone = () =>
    setForm((prev) => ({
      ...prev,
      phones: [...prev.phones, { id: Date.now(), value: "" }],
    }));

  /* ---- social helpers ---- */
  const updateSocial = (
    id: number,
    key: keyof Omit<SocialLink, "id">,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      socials: prev.socials.map((s) =>
        s.id === id ? { ...s, [key]: value } : s,
      ),
    }));
    setErrors((prev) => ({
      ...prev,
      socials: { ...prev.socials, [id]: undefined },
    }));
  };

  const deleteSocial = (id: number) =>
    setForm((prev) => ({
      ...prev,
      socials: prev.socials.filter((s) => s.id !== id),
    }));

  const addSocial = () => {
    // pick a platform that hasn't been used yet
    const usedPlatforms = new Set(form.socials.map((s) => s.platform));
    const nextPlatform =
      SOCIAL_PLATFORMS.find((p) => !usedPlatforms.has(p)) ??
      SOCIAL_PLATFORMS[0];

    setForm((prev) => ({
      ...prev,
      socials: [
        ...prev.socials,
        { id: Date.now(), platform: nextPlatform, url: "" },
      ],
    }));
  };

  /* ---- actions ---- */
  const handleEdit = () => {
    setErrors({});
    setIsEditing(true);
  };

  const handleSave = () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // stop — don't save
    }
    // ✅ No errors — safe to save
    // TODO: call your API here later → await api.updateProfile(form)
    setIsEditing(false);
    setErrors({});
  };

  /* ---- render ---- */
  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      {/* page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Profile Settings"
          description="Manage your restaurant profile and digital presence"
          showDescription
        />
        {isEditing ? (
          <Button label="Save Changes" icon={Save} onClick={handleSave} />
        ) : (
          <Button label="Edit" icon={Edit2} onClick={handleEdit} />
        )}
      </div>

      {/* business information */}
      <Card className="flex flex-col gap-5">
        <SectionHeader
          icon={Building2}
          title="Business Information"
          description="Restaurant profile details"
        />

        <div className="flex flex-col gap-4">

        <AvatarUpload isEditing={isEditing} />

    {/* divider */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">Email</label>
              <Input
                value={form.email}
                readOnly={!isEditing}
                placeholder="email@example.com"
                onChange={field("email")}
              />
              {errors.email && (
                <p className="text-xs text-error">{errors.email}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-600">
                Password
              </label>
              <Input
                value={form.password}
                readOnly={!isEditing}
                placeholder="••••••••"
                onChange={field("password")}
              />
              {errors.password && (
                <p className="text-xs text-error">{errors.password}</p>
              )}
            </div>
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

      {/* phone numbers */}
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

      {/* social media */}
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
