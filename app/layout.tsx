import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Instrument_Serif } from "next/font/google";

import { I18nProvider } from "@/components/i18n/i18n-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { siteConfig } from "@/config/site";
import { getMessages } from "@/lib/i18n/dictionary";
import { intlLocaleForApp } from "@/lib/i18n/locale";
import { getServerLocale } from "@/lib/i18n/server";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600"],
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Güvenli çevrim içi terapi`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getServerLocale();
  const messages = getMessages(locale);
  return (
    <html lang={intlLocaleForApp(locale)} data-theme="light" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${instrument.variable} font-sans`}>
        <ThemeScript />
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
