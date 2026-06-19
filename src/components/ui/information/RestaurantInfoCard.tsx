import { Building2 } from "lucide-react";

import Card from "../../ui/Card";
import Input from "../../ui/Input";
import SectionHeader from "../../shared/SectionHeader";
import AvatarUpload from "../../ui/AvatarUpload";
import { useLanguage } from "../../../i18n/useLanguage";
import { restaurantInfoText } from "../text/RestaurantInfoCard.text";

export interface RestaurantInfoFields {
  restaurantName: string;
  emailAddress: string;
  address: string;
  city: string;
  logoUrl: string | null;
}

export interface RestaurantInfoErrors {
  restaurantName?: string;
  emailAddress?: string;
  address?: string;
  city?: string;
}

interface RestaurantInfoCardProps {
  isEditing: boolean;
  fields: RestaurantInfoFields;
  errors: RestaurantInfoErrors;
  avatarKey: number;
  onChange: (key: keyof Omit<RestaurantInfoFields, "logoUrl">, value: string) => void;
  onFileSelected: (file: File) => void;
  onDeleteLogo: () => void;
}

function RestaurantInfoCard({
  isEditing,
  fields,
  errors,
  avatarKey,
  onChange,
  onFileSelected,
  onDeleteLogo,
}: RestaurantInfoCardProps) {
  const { language } = useLanguage();
  const t = restaurantInfoText[language];

  const field =
    (key: keyof Omit<RestaurantInfoFields, "logoUrl">) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(key, e.target.value);

  return (
    <Card className="flex flex-col gap-5">
      <SectionHeader
        icon={Building2}
        title={t.sectionTitle}
        description={t.sectionDescription}
      />

      <div className="flex flex-col gap-4">
        <AvatarUpload
          key={avatarKey}
          isEditing={isEditing}
          initialUrl={fields.logoUrl}
          onFileSelected={(file) => onFileSelected(file)}
          onDelete={onDeleteLogo}
        />

        <div className="border-t border-primary-200" />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-600">
            {t.restaurantNameLabel}
          </label>
          <Input
            value={fields.restaurantName}
            readOnly={!isEditing}
            placeholder={t.restaurantNamePlaceholder}
            onChange={field("restaurantName")}
          />
          {errors.restaurantName && (
            <p className="text-xs text-error">{errors.restaurantName}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-600">
            {t.emailLabel}
          </label>
          <Input
            value={fields.emailAddress}
            readOnly={!isEditing}
            placeholder={t.emailPlaceholder}
            onChange={field("emailAddress")}
          />
          {errors.emailAddress && (
            <p className="text-xs text-error">{errors.emailAddress}</p>
          )}
          <p className="text-xs text-text-400">{t.emailHint}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">
              {t.addressLabel}
            </label>
            <Input
              value={fields.address}
              readOnly={!isEditing}
              placeholder={t.addressPlaceholder}
              onChange={field("address")}
            />
            {errors.address && (
              <p className="text-xs text-error">{errors.address}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-600">
              {t.cityLabel}
            </label>
            <Input
              value={fields.city}
              readOnly={!isEditing}
              placeholder={t.cityPlaceholder}
              onChange={field("city")}
            />
            {errors.city && (
              <p className="text-xs text-error">{errors.city}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default RestaurantInfoCard;