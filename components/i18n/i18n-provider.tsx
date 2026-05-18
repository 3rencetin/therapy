"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { Messages } from "@/lib/i18n/dictionary";
import type { AppLocale } from "@/lib/i18n/locale";
import { createTranslator, type TranslateFn } from "@/lib/i18n/translate";

type I18nValue = { locale: AppLocale; t: TranslateFn };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: AppLocale;
  messages: Messages;
  children: ReactNode;
}) {
  const t = useMemo(() => createTranslator(messages), [messages]);
  const value = useMemo(() => ({ locale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
