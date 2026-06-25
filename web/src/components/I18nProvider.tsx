"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { browserUiLocale } from "@/i18n/config";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const locale = browserUiLocale();
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
