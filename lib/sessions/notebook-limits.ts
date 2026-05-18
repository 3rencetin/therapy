/** Seans not defteri doğrulama sınırları (DB check ile uyumlu) */
export const SESSION_NOTEBOOK_MAX_PAGES = 40;
export const SESSION_NOTEBOOK_MAX_TITLE_LEN = 200;
export const SESSION_NOTEBOOK_MAX_BODY_LEN = 50_000;

export function clampNotebookTitle(raw: string): string {
  return raw.trim().slice(0, SESSION_NOTEBOOK_MAX_TITLE_LEN);
}

export function clampNotebookBody(raw: string): string {
  return raw.slice(0, SESSION_NOTEBOOK_MAX_BODY_LEN);
}
