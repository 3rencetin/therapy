import { parseArticleBody } from "@/lib/articles/parse-article-body";
import { cn } from "@/lib/utils";

export function ArticleBody({ body, className }: { body: string; className?: string }) {
  const blocks = parseArticleBody(body);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "article-prose rounded-[1.25rem] border border-border/50 bg-card/60 px-5 py-7 shadow-[0_8px_32px_-12px_rgba(13,59,102,0.08)] sm:px-8 sm:py-9",
        className,
      )}
    >
      <div className="mx-auto max-w-[42rem] space-y-6">
        {blocks.map((block, i) => {
          if (block.kind === "h2") {
            return (
              <h2
                key={i}
                className="border-t border-border/40 pt-7 font-display text-[clamp(1.25rem,2.5vw,1.5rem)] leading-tight tracking-[-0.025em] text-foreground first:border-t-0 first:pt-0"
              >
                {block.text}
              </h2>
            );
          }
          if (block.kind === "h3") {
            return (
              <h3
                key={i}
                className="font-display text-[1.08rem] leading-snug tracking-[-0.02em] text-foreground"
              >
                {block.text}
              </h3>
            );
          }
          if (block.kind === "ul") {
            return (
              <ul
                key={i}
                className="list-disc space-y-2.5 pl-5 text-[0.98rem] leading-[1.75] text-foreground/88 marker:text-[#007AFF]"
              >
                {block.items.map((item, j) => (
                  <li key={`${i}-${j}`} className="text-pretty pl-1">
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-pretty text-[1.02rem] leading-[1.9] text-foreground/88">
              {block.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
