"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "@mantine/hooks";
import { I18nextProvider } from "react-i18next";
import { fetchUserSettings } from "@/lib/account-settings";
import { TOKEN_KEY } from "@/lib/auth-storage";
import i18n from "@/i18n";
import { browserUiLocale, resolveUiLocale } from "@/i18n/config";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [token] = useLocalStorage<string | null>({
    key: TOKEN_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });

  const { data: userSettings } = useQuery({
    queryKey: ["user-settings", token],
    queryFn: () => fetchUserSettings(token!),
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  const nativeLanguage = userSettings?.native_language;

  useEffect(() => {
    const locale = nativeLanguage ? resolveUiLocale(nativeLanguage) : browserUiLocale();
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [nativeLanguage]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
