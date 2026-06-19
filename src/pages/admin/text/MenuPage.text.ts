interface MenuTextDict {
  pageTitle: string;
  pageDescription: string;
  preview: string;
  edit: string;
  cancel: string;
  saveChanges: string;
  saving: string;
  defaultMenuTitle: string;
  defaultMenuMessage: string;
  noMenuError: string;
  loading: string;
  loadError: string;
  menuTitlesTitle: string;
  menuTitlesDescription: string;
  addLabel: string;
  currencyTitle: string;
  currencyDescription: string;
  currencyRequired: string;
  menuSummaryTitle: string;
  categories: string;
  dishes: string;
  dangerZoneTitle: string;
  dangerZoneDescription: string;
  deleteMenu: string;
  deleteMenuModalTitle: string;
  yesDelete: string;
  deleting: string;
  deleteWarningTitle: string;
  deleteWarningMessage: string;
  toastMenuSavedTitle: string;
  toastMenuSavedMessage: string;
  toastSaveFailedTitle: string;
  toastMenuDeletedTitle: string;
  toastMenuDeletedMessage: string;
  toastDeleteFailedTitle: string;
  toastValidationTitle: string;
  toastValidationMessage: string;
  requiredTitle: (langLabel: string) => string;
}

export const menuText: Record<"en" | "fr", MenuTextDict> = {
  en: {
    pageTitle: "Menu",
    pageDescription: "Manage your restaurant default menu",
    preview: "Preview",
    edit: "Edit",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    saving: "Saving...",
    defaultMenuTitle: "Default Menu",
    defaultMenuMessage:
      "This restaurant uses one default menu. Multi-menu support will be added later.",
    noMenuError: "No default menu found for this restaurant.",
    loading: "Loading menu...",
    loadError: "Could not load menu.",
    menuTitlesTitle: "Menu Titles",
    menuTitlesDescription: "One title per supported language",
    addLabel: "Add",
    currencyTitle: "Currency",
    currencyDescription: "The currency shown to customers on your public menu",
    currencyRequired: "Currency is required.",
    menuSummaryTitle: "Menu Summary",
    categories: "Categories",
    dishes: "Dishes",
    dangerZoneTitle: "Danger Zone",
    dangerZoneDescription:
      "Deleting this menu will permanently remove all categories and dishes associated with it.",
    deleteMenu: "Delete Menu",
    deleteMenuModalTitle: "Delete Menu",
    yesDelete: "Yes, Delete",
    deleting: "Deleting...",
    deleteWarningTitle: "This action cannot be undone",
    deleteWarningMessage:
      "Deleting this menu will permanently remove all categories, dishes, translations, and menu settings.",
    toastMenuSavedTitle: "Menu Saved",
    toastMenuSavedMessage: "Your menu has been updated.",
    toastSaveFailedTitle: "Save Failed",
    toastMenuDeletedTitle: "Menu Deleted",
    toastMenuDeletedMessage: "The menu has been deleted successfully.",
    toastDeleteFailedTitle: "Delete Failed",
    toastValidationTitle: "Validation Error",
    toastValidationMessage: "Please fill in all required fields.",
    requiredTitle: (langLabel: string) => `${langLabel} title is required.`,
  },
  fr: {
    pageTitle: "Menu",
    pageDescription: "Gérez le menu par défaut de votre restaurant",
    preview: "Aperçu",
    edit: "Modifier",
    cancel: "Annuler",
    saveChanges: "Enregistrer les modifications",
    saving: "Enregistrement...",
    defaultMenuTitle: "Menu par défaut",
    defaultMenuMessage:
      "Ce restaurant utilise un seul menu par défaut. La prise en charge multi-menus sera ajoutée plus tard.",
    noMenuError: "Aucun menu par défaut trouvé pour ce restaurant.",
    loading: "Chargement du menu...",
    loadError: "Impossible de charger le menu.",
    menuTitlesTitle: "Titres du menu",
    menuTitlesDescription: "Un titre par langue prise en charge",
    addLabel: "Ajouter",
    currencyTitle: "Devise",
    currencyDescription: "La devise affichée aux clients sur votre menu public",
    currencyRequired: "La devise est requise.",
    menuSummaryTitle: "Résumé du menu",
    categories: "Catégories",
    dishes: "Plats",
    dangerZoneTitle: "Zone de danger",
    dangerZoneDescription:
      "La suppression de ce menu retirera définitivement toutes les catégories et plats associés.",
    deleteMenu: "Supprimer le menu",
    deleteMenuModalTitle: "Supprimer le menu",
    yesDelete: "Oui, supprimer",
    deleting: "Suppression...",
    deleteWarningTitle: "Cette action est irréversible",
    deleteWarningMessage:
      "La suppression de ce menu retirera définitivement toutes les catégories, plats, traductions et paramètres du menu.",
    toastMenuSavedTitle: "Menu enregistré",
    toastMenuSavedMessage: "Votre menu a été mis à jour.",
    toastSaveFailedTitle: "Échec de l'enregistrement",
    toastMenuDeletedTitle: "Menu supprimé",
    toastMenuDeletedMessage: "Le menu a été supprimé avec succès.",
    toastDeleteFailedTitle: "Échec de la suppression",
    toastValidationTitle: "Erreur de validation",
    toastValidationMessage: "Veuillez remplir tous les champs obligatoires.",
    requiredTitle: (langLabel: string) => `Le titre en ${langLabel} est requis.`,
  },
};