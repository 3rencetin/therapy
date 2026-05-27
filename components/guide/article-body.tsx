import { cn } from "@/lib/utils";

export function ArticleBody({ body, className }: { body: string; className?: string }) {
  const blocks = body.split(/\n\n+/).filter((b) => b.trim());

  return (
    <div className={cn("space-y-5 text-[0.98rem] leading-[1.85] text-foreground/90", className)}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="font-display text-[1.35rem] tracking-[-0.02em] text-foreground pt-2">
              {trimmed.slice(3).trim()}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="font-display text-[1.1rem] tracking-[-0.02em] text-foreground pt-1">
              {trimmed.slice(4).trim()}
            </h3>
          );
        }
        return (
          <p key={i} className="text-pretty">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
