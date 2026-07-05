interface InformationTextDict {
  loading: string;
  loadError: string;
  pageTitle: string;
  pageDescription: string;
  cancel: string;
  saveChanges: string;
  saving: string;
  edit: string;
  personalInfoTitle: string;
  personalInfoDescription: string;
  accountEmailLabel: string;
  accountEmailHint: string;
  phoneNumbersTitle: string;
  phoneNumbersDescription: string;
  addNumber: string;
  noPhoneNumbers: string;
  socialMediaTitle: string;
  socialMediaDescription: string;
  addLink: string;
  noSocialLinks: string;
  toastProfileSavedTitle: string;
  toastProfileSavedMessage: string;
  toastSessionErrorTitle: string;
  toastSessionErrorMessage: string;
  restaurantNameRequired: string;
  invalidEmail: string;
  phoneRequired: string;
  urlRequired: string;
  urlMustStartWithHttps: string;
  alreadyAdded: (platform: string) => string;
}

export const informationText: Record<"en" | "fr", InformationTextDict> = {
  en: {
    loading: "Loading profile...",
    loadError: "Could not load restaurant profile.",
    pageTitle: "Profile Settings",
    pageDescription: "Manage your restaurant profile and digital presence",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    saving: "Saving...",
    edit: "Edit",
    personalInfoTitle: "Personal Information",
    personalInfoDescription: "Your account credentials",
    accountEmailLabel: "Account Email",
    accountEmailHint:
      "This is the email you use to log in. Contact support to change it.",
    phoneNumbersTitle: "Phone Numbers",
    phoneNumbersDescription: "Manage contact numbers",
    addNumber: "Add Number",
    noPhoneNumbers: "No phone numbers added yet.",
    socialMediaTitle: "Social Media",
    socialMediaDescription: "Connect your social profiles",
    addLink: "Add Link",
    noSocialLinks: "No social links added yet.",
    toastProfileSavedTitle: "Profile Saved",
    toastProfileSavedMessage: "Your restaurant profile has been updated.",
    toastSessionErrorTitle: "Session Error",
    toastSessionErrorMessage: "Restaurant session is missing.",
    restaurantNameRequired: "Restaurant name is required.",
    invalidEmail: "Enter a valid email address.",
    phoneRequired: "Phone number cannot be empty.",
    urlRequired: "URL cannot be empty.",
    urlMustStartWithHttps: "URL must start with https://",
    alreadyAdded: (platform: string) => `${platform} is already added.`,
  },
  fr: {
    loading: "Chargement du profil...",
    loadError: "Impossible de charger le profil du restaurant.",
    pageTitle: "Paramètres du profil",
    pageDescription:
      "Gérez le profil de votre restaurant et votre présence numérique",
    cancel: "Annuler",
    saveChanges: "Enregistrer les modifications",
    saving: "Enregistrement...",
    edit: "Modifier",
    personalInfoTitle: "Informations personnelles",
    personalInfoDescription: "Identifiants de votre compte",
    accountEmailLabel: "E-mail du compte",
    accountEmailHint:
      "C'est l'e-mail que vous utilisez pour vous connecter. Contactez le support pour le modifier.",
    phoneNumbersTitle: "Numéros de téléphone",
    phoneNumbersDescription: "Gérez les numéros de contact",
    addNumber: "Ajouter un numéro",
    noPhoneNumbers: "Aucun numéro de téléphone ajouté pour le moment.",
    socialMediaTitle: "Réseaux sociaux",
    socialMediaDescription: "Connectez vos profils sociaux",
    addLink: "Ajouter un lien",
    noSocialLinks: "Aucun lien social ajouté pour le moment.",
    toastProfileSavedTitle: "Profil enregistré",
    toastProfileSavedMessage:
      "Le profil de votre restaurant a été mis à jour.",
    toastSessionErrorTitle: "Erreur de session",
    toastSessionErrorMessage: "La session du restaurant est manquante.",
    restaurantNameRequired: "Le nom du restaurant est requis.",
    invalidEmail: "Veuillez saisir une adresse e-mail valide.",
    phoneRequired: "Le numéro de téléphone ne peut pas être vide.",
    urlRequired: "L'URL ne peut pas être vide.",
    urlMustStartWithHttps: "L'URL doit commencer par https://",
    alreadyAdded: (platform: string) => `${platform} est déjà ajouté.`,
  },
};