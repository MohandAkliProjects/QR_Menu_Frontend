import { useState } from "react";
import { Edit2, Globe, Phone, Plus, Save, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import ToastContainer from "../../components/ui/ToastContainer";
import ChangePasswordCard from "../../components/ui/information/ChangePasswordCard";
import RestaurantInfoCard from "../../components/ui/information/RestaurantInfoCard";
import type { RestaurantInfoFields, RestaurantInfoErrors } from "../../components/ui/information/RestaurantInfoCard";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import { SOCIAL_PLATFORMS } from "../../lib/constants/social";
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

interface RestaurantForm extends RestaurantInfoFields {
  phones: { id: number; value: string }[];
  socials: SocialLink[];
}

interface RestaurantFormErrors extends RestaurantInfoErrors {
  phones?: Record<number, string | undefined>;
  socials?: Record<number, string | undefined>;
}

function validateRestaurant(form: RestaurantForm): RestaurantFormErrors {
  const errors: RestaurantFormErrors = {};

  if (!form.restaurantName.trim())
    errors.restaurantName = "Restaurant name is required.";
  if (form.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress))
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

function InformationPage() {
  const { restaurantId, email: userEmail } = useAuth();
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  const [avatarKey, setAvatarKey] = useState(0);
  const [deleteLogo, setDeleteLogo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<RestaurantForm | null>(null);
  const [errors, setErrors] = useState<RestaurantFormErrors>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const restaurantKey = ["restaurant", restaurantId];

  const {
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: restaurantKey,
    queryFn: () => restaurantService.getRestaurant(restaurantId!),
    enabled: !!restaurantId,
    // Populate the form when data first arrives (or on refetch after save)
    // We use select to avoid re-setting form while user is editing
    staleTime: Infinity,
  });

  useQuery({
    queryKey: restaurantKey,
    queryFn: () => restaurantService.getRestaurant(restaurantId!),
    enabled: !!restaurantId && !isEditing,
    staleTime: Infinity,
    select: (restaurant) => {
      const mapped = restaurantResponseToForm(restaurant);
      return {
        restaurantName: mapped.restaurantName,
        emailAddress: restaurant.emailAddress ?? "",
        address: mapped.address,
        city: mapped.city,
        phones: mapped.phones,
        socials: mapped.socials,
        logoUrl: mapped.logoUrl,
      };
    },
  });


  const { data: restaurantData } = useQuery({
    queryKey: restaurantKey,
    queryFn: () => restaurantService.getRestaurant(restaurantId!),
    enabled: !!restaurantId,
    staleTime: Infinity,
  });

  const serverForm: RestaurantForm | null = restaurantData
    ? (() => {
        const mapped = restaurantResponseToForm(restaurantData);
        return {
          restaurantName: mapped.restaurantName,
          emailAddress: restaurantData.emailAddress ?? "",
          address: mapped.address,
          city: mapped.city,
          phones: mapped.phones,
          socials: mapped.socials,
          logoUrl: mapped.logoUrl,
        };
      })()
    : null;

  const activeForm = isEditing ? form : serverForm;

  const saveMutation = useMutation({
    mutationFn: (f: RestaurantForm) =>
      restaurantService.updateRestaurant(
        restaurantId!,
        restaurantFormToUpdateRequest(f),
        logoFile,
        deleteLogo,
        null,
        false
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKey });
      setLogoFile(null);
      setDeleteLogo(false);
      setIsEditing(false);
      setErrors({});
      setForm(null);
      showToast("success", "Profile Saved", "Your restaurant profile has been updated.");
    },
    onError: (err) => showToast("error", "Save Failed", getErrorMessage(err)),
  });

  const handleEdit = () => {
    setErrors({});
    setForm(serverForm);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setLogoFile(null);
    setDeleteLogo(false);
    setAvatarKey((k) => k + 1);
    setForm(null);
  };

  const handleSave = () => {
    if (!restaurantId || !activeForm) {
      showToast("error", "Session Error", "Restaurant session is missing.");
      return;
    }
    const validationErrors = validateRestaurant(activeForm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("error", "Validation Error", "Please fix the highlighted fields.");
      return;
    }
    saveMutation.mutate(activeForm);
  };

  const handleInfoChange = (
    key: keyof Omit<RestaurantInfoFields, "logoUrl">,
    value: string
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updatePhone = (id: number, value: string) => {
    setForm((prev) =>
      prev ? { ...prev, phones: prev.phones.map((p) => (p.id === id ? { ...p, value } : p)) } : prev
    );
    setErrors((prev) => ({ ...prev, phones: { ...prev.phones, [id]: undefined } }));
  };

  const deletePhone = (id: number) =>
    setForm((prev) =>
      prev ? { ...prev, phones: prev.phones.filter((p) => p.id !== id) } : prev
    );

  const addPhone = () =>
    setForm((prev) =>
      prev ? { ...prev, phones: [...prev.phones, { id: Date.now(), value: "" }] } : prev
    );

  const updateSocial = (id: number, key: keyof Omit<SocialLink, "id">, value: string) => {
    setForm((prev) =>
      prev ? { ...prev, socials: prev.socials.map((s) => (s.id === id ? { ...s, [key]: value } : s)) } : prev
    );
    setErrors((prev) => ({ ...prev, socials: { ...prev.socials, [id]: undefined } }));
  };

  const deleteSocial = (id: number) =>
    setForm((prev) =>
      prev ? { ...prev, socials: prev.socials.filter((s) => s.id !== id) } : prev
    );

  const addSocial = () => {
    setForm((prev) => {
      if (!prev) return prev;
      const usedPlatforms = new Set(prev.socials.map((s) => s.platform));
      const nextPlatform = SOCIAL_PLATFORMS.find((p) => !usedPlatforms.has(p)) ?? SOCIAL_PLATFORMS[0];
      return {
        ...prev,
        socials: [...prev.socials, { id: Date.now(), platform: nextPlatform, url: "" }],
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full">
        <PageLoadingState message="Loading profile..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <PageErrorState
          message={getErrorMessage(error, "Could not load restaurant profile.")}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!activeForm) return null;

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
            <Button label="Cancel" variant="secondary" onClick={handleCancel} />
          )}
          {isEditing ? (
            <Button
              label={saveMutation.isPending ? "Saving..." : "Save Changes"}
              icon={Save}
              onClick={handleSave}
              disabled={saveMutation.isPending}
            />
          ) : (
            <Button label="Edit" icon={Edit2} onClick={handleEdit} />
          )}
        </div>
      </div>

      <Card className="flex flex-col gap-5">
        <SectionHeader
          icon={User}
          title="Personal Information"
          description="Your account credentials"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-600">Account Email</label>
          <Input value={userEmail ?? ""} readOnly placeholder="your@email.com" />
          <p className="text-xs text-text-400">
            This is the email you use to log in. Contact support to change it.
          </p>
        </div>
      </Card>

      <ChangePasswordCard />

      <RestaurantInfoCard
        isEditing={isEditing}
        fields={{
          restaurantName: activeForm.restaurantName,
          emailAddress: activeForm.emailAddress,
          address: activeForm.address,
          city: activeForm.city,
          logoUrl: activeForm.logoUrl,
        }}
        errors={{
          restaurantName: errors.restaurantName,
          emailAddress: errors.emailAddress,
          address: errors.address,
          city: errors.city,
        }}
        avatarKey={avatarKey}
        onChange={handleInfoChange}
        onFileSelected={(file) => {
          setLogoFile(file);
          setDeleteLogo(false);
        }}
        onDeleteLogo={() => {
          setDeleteLogo(true);
          setLogoFile(null);
        }}
      />

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
          {activeForm.phones.length === 0 && (
            <p className="text-sm text-text-400 text-center py-2">
              No phone numbers added yet.
            </p>
          )}
          {activeForm.phones.map((phone) => (
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
          action={
            isEditing && (
              <Button label="Add Link" icon={Plus} onClick={addSocial} />
            )
          }
        />
        <div className="flex flex-col gap-3">
          {activeForm.socials.length === 0 && (
            <p className="text-sm text-text-400 text-center py-2">
              No social links added yet.
            </p>
          )}
          {activeForm.socials.map((social) => (
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