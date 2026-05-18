import { cookies } from "next/headers";

import { APP_LOCALE_COOKIE } from "@/lib/i18n/cookie";
import { getMessages } from "@/lib/i18n/dictionary";
import type { AppLocale } from "@/lib/i18n/locale";
import { parseLocale } from "@/lib/i18n/locale";
import { createTranslator } from "@/lib/i18n/translate";

export async function getServerLocale(): Promise<AppLocale> {
  const jar = await cookies();
  return parseLocale(jar.get(APP_LOCALE_COOKIE)?.value);
}

export async function getServerTranslator() {
  const locale = await getServerLocale();
  const messages = getMessages(locale);
  return { locale, messages, t: createTranslator(messages) };
}
