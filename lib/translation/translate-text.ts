import "server-only";

const DEEPL_FREE_URL = "https://api-free.deepl.com/v2/translate";
const DEEPL_PRO_URL = "https://api.deepl.com/v2/translate";
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

/** MyMemory ücretsiz katman ~500 bayt/istek; güvenli parça boyutu */
const CHUNK_MAX_CHARS = 420;

const LIBRE_PUBLIC_BASES = [
  "https://translate.argosopentech.com",
  "https://libretranslate.com",
] as const;

function deeplBaseUrl(apiKey: string): string {
  return apiKey.endsWith(":fx") ? DEEPL_FREE_URL : DEEPL_PRO_URL;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkText(text: string): string[] {
  const input = text.trim();
  if (!input) return [];
  if (input.length <= CHUNK_MAX_CHARS) return [input];

  const chunks: string[] = [];
  const blocks = input.split(/(\n\n+)/);

  let buffer = "";
  for (const block of blocks) {
    if (block.length > CHUNK_MAX_CHARS) {
      if (buffer.trim()) {
        chunks.push(buffer);
        buffer = "";
      }
      for (let i = 0; i < block.length; i += CHUNK_MAX_CHARS) {
        chunks.push(block.slice(i, i + CHUNK_MAX_CHARS));
      }
      continue;
    }

    const next = buffer + block;
    if (next.length > CHUNK_MAX_CHARS && buffer.trim()) {
      chunks.push(buffer);
      buffer = block;
    } else {
      buffer = next;
    }
  }

  if (buffer.trim()) chunks.push(buffer);
  return chunks.length > 0 ? chunks : [input];
}

async function translateWithDeepL(text: string, apiKey: string): Promise<string> {
  const params = new URLSearchParams({
    text,
    source_lang: "TR",
    target_lang: "EN",
  });

  const res = await fetch(deeplBaseUrl(apiKey), {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`DEEPL_HTTP_${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const json = (await res.json()) as { translations?: { text?: string }[] };
  const out = json.translations?.[0]?.text?.trim();
  if (!out) throw new Error("DEEPL_EMPTY");
  return out;
}

async function translateWithMyMemory(text: string): Promise<string> {
  const params = new URLSearchParams({
    q: text,
    langpair: "tr|en",
  });

  const contactEmail = process.env.MYMEMORY_CONTACT_EMAIL?.trim();
  if (contactEmail) params.set("de", contactEmail);

  const res = await fetch(`${MYMEMORY_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`MYMEMORY_HTTP_${res.status}`);
  }

  const json = (await res.json()) as {
    responseStatus?: number;
    responseDetails?: string;
    responseData?: { translatedText?: string };
  };

  if (json.responseStatus && json.responseStatus !== 200) {
    throw new Error(`MYMEMORY_${json.responseStatus}: ${json.responseDetails ?? "quota or error"}`);
  }

  const out = json.responseData?.translatedText?.trim();
  if (!out) throw new Error("MYMEMORY_EMPTY");
  return out;
}

async function translateWithLibreBase(base: string, text: string): Promise<string> {
  const root = base.replace(/\/$/, "");
  const apiKey = process.env.LIBRETRANSLATE_API_KEY?.trim();

  const res = await fetch(`${root}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "tr",
      target: "en",
      format: "text",
      ...(apiKey ? { api_key: apiKey } : {}),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LIBRE_HTTP_${res.status}${detail ? `: ${detail.slice(0, 120)}` : ""}`);
  }

  const json = (await res.json()) as { translatedText?: string; error?: string };
  if (json.error) throw new Error(`LIBRE_ERR: ${json.error}`);
  const out = json.translatedText?.trim();
  if (!out) throw new Error("LIBRE_EMPTY");
  return out;
}

async function translateWithLibre(text: string): Promise<string> {
  const custom = process.env.LIBRETRANSLATE_URL?.trim();
  const bases = custom ? [custom.replace(/\/$/, ""), ...LIBRE_PUBLIC_BASES] : [...LIBRE_PUBLIC_BASES];

  let lastError: Error | null = null;
  for (const base of bases) {
    try {
      return await translateWithLibreBase(base, text);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError ?? new Error("LIBRE_ALL_FAILED");
}

export type TranslationProvider = "mymemory" | "libre" | "deepl";

export function getTranslationProvider(): TranslationProvider {
  if (process.env.DEEPL_API_KEY?.trim()) return "deepl";
  if (process.env.LIBRETRANSLATE_URL?.trim() || process.env.LIBRETRANSLATE_API_KEY?.trim()) {
    return "libre";
  }
  return "mymemory";
}

async function translateSegment(text: string): Promise<string> {
  const input = text.trim();
  if (!input) return "";

  const deeplKey = process.env.DEEPL_API_KEY?.trim();
  if (deeplKey) {
    try {
      return await translateWithDeepL(input, deeplKey);
    } catch {
      /* DeepL başarısızsa ücretsiz yedeklere düş */
    }
  }

  if (process.env.LIBRETRANSLATE_URL?.trim() || process.env.LIBRETRANSLATE_API_KEY?.trim()) {
    try {
      return await translateWithLibre(input);
    } catch {
      /* Libre öncelikli ama başarısızsa MyMemory dene */
    }
  }

  try {
    return await translateWithMyMemory(input);
  } catch (myMemoryError) {
    try {
      return await translateWithLibre(input);
    } catch {
      throw myMemoryError;
    }
  }
}

async function translateLongParagraph(paragraph: string): Promise<string> {
  const chunks = chunkText(paragraph);
  if (chunks.length <= 1) return translateSegment(paragraph);

  const parts: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    parts.push(await translateSegment(chunks[i]!));
    if (i < chunks.length - 1) await sleep(350);
  }
  return parts.join(" ");
}

/** Paragraf ve satır sonlarını koruyarak çevirir (blog düzeni bozulmasın). */
async function translatePreservingLayout(text: string): Promise<string> {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const paragraphs = normalized.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return "";

  const translated: string[] = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i]!;
    if (p.length <= CHUNK_MAX_CHARS) {
      translated.push(await translateSegment(p));
    } else {
      translated.push(await translateLongParagraph(p));
    }
    if (i < paragraphs.length - 1) await sleep(350);
  }
  return translated.join("\n\n");
}

export async function translateTurkishToEnglish(text: string): Promise<string> {
  const input = text.replace(/\r\n/g, "\n").trim();
  if (!input) return "";

  if (input.includes("\n\n") || input.length > CHUNK_MAX_CHARS) {
    return translatePreservingLayout(input);
  }

  return translateSegment(input);
}

export async function translateGuideFieldsToEnglish(fields: {
  title: string;
  excerpt: string;
  body: string;
}): Promise<{ title: string; excerpt: string; body: string }> {
  const title = await translateTurkishToEnglish(fields.title);
  const excerpt = await translateTurkishToEnglish(fields.excerpt);
  const body = await translateTurkishToEnglish(fields.body);
  return { title, excerpt, body };
}
