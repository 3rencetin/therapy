import type { Messages } from "@/lib/i18n/dictionary";

export type TranslateFn = (path: string, vars?: Record<string, string | number>) => string;

export function createTranslator(messages: Messages): TranslateFn {
  return function t(path: string, vars?: Record<string, string | number>): string {
    const keys = path.split(".");
    let cur: unknown = messages;
    for (const k of keys) {
      if (cur && typeof cur === "object" && k in cur) {
        cur = (cur as Record<string, unknown>)[k];
      } else {
        cur = undefined;
        break;
      }
    }
    let out = typeof cur === "string" ? cur : path;
    if (vars) {
      for (const [vk, vv] of Object.entries(vars)) {
        out = out.split(`{${vk}}`).join(String(vv));
      }
    }
    return out;
  };
}
