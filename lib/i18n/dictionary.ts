import type { AppLocale } from "./locale";
import type { AppMessages } from "./messages/tr";
import { enMessages } from "./messages/en";
import { trMessages } from "./messages/tr";

export type Messages = AppMessages;

export function getMessages(locale: AppLocale): Messages {
  return locale === "en" ? enMessages : trMessages;
}
