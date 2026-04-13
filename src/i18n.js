import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "./locales/fr.json";
import en from "./locales/en.json";
import it from "./locales/it.json";

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    it: { translation: it }
  },
  lng: "fr",           // langue par défaut
  fallbackLng: "fr",   // si traduction manquante
  interpolation: { escapeValue: false }
});

export default i18n;
