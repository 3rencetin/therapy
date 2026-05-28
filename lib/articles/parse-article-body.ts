export type ArticleBlock =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

function lineToBlock(line: string): ArticleBlock | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (/^##\s+/.test(trimmed)) {
    return { kind: "h2", text: trimmed.replace(/^##\s+/, "").trim() };
  }
  if (/^###\s+/.test(trimmed)) {
    return { kind: "h3", text: trimmed.replace(/^###\s+/, "").trim() };
  }

  const bullet = trimmed.match(/^[-*•]\s+(.+)$/) ?? trimmed.match(/^\d+[.)]\s+(.+)$/);
  if (bullet) return { kind: "ul", items: [bullet[1]!.trim()] };

  if (trimmed.length <= 90 && trimmed.endsWith(":") && !trimmed.includes(".")) {
    return { kind: "h3", text: trimmed.replace(/:$/, "").trim() };
  }

  return { kind: "p", text: trimmed };
}

function parseLines(lines: string[]): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ kind: "ul", items: [...listItems] });
      listItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^##\s+/.test(line)) {
      flushList();
      blocks.push({ kind: "h2", text: line.replace(/^##\s+/, "").trim() });
      continue;
    }
    if (/^###\s+/.test(line)) {
      flushList();
      blocks.push({ kind: "h3", text: line.replace(/^###\s+/, "").trim() });
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/) ?? line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet) {
      listItems.push(bullet[1]!.trim());
      continue;
    }

    if (line.length <= 90 && line.endsWith(":") && !line.includes(".")) {
      flushList();
      blocks.push({ kind: "h3", text: line.replace(/:$/, "").trim() });
      continue;
    }

    flushList();
    blocks.push({ kind: "p", text: line });
  }

  flushList();
  return blocks;
}

/** Makale gövdesini paragraf, başlık ve liste bloklarına ayırır. */
export function parseArticleBody(body: string): ArticleBlock[] {
  const normalized = body.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const hasParagraphBreaks = /\n\n+/.test(normalized);
  const lines = normalized.split("\n").map((l) => l.trim());

  if (!hasParagraphBreaks && lines.length > 1) {
    return parseLines(lines);
  }

  const sections = normalized.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  const blocks: ArticleBlock[] = [];

  for (const section of sections) {
    const sectionLines = section.split("\n").map((l) => l.trim()).filter(Boolean);
    if (sectionLines.length <= 1) {
      const block = lineToBlock(section);
      if (block) {
        if (block.kind === "ul") {
          const last = blocks[blocks.length - 1];
          if (last?.kind === "ul") last.items.push(...block.items);
          else blocks.push(block);
        } else {
          blocks.push(block);
        }
      }
      continue;
    }
    blocks.push(...parseLines(sectionLines));
  }

  return mergeAdjacentLists(blocks);
}

function mergeAdjacentLists(blocks: ArticleBlock[]): ArticleBlock[] {
  const merged: ArticleBlock[] = [];
  for (const block of blocks) {
    const last = merged[merged.length - 1];
    if (block.kind === "ul" && last?.kind === "ul") {
      last.items.push(...block.items);
    } else {
      merged.push(block);
    }
  }
  return merged;
}
