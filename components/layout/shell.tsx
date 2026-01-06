import * as React from "react";
import { cn } from "@/lib/utils";

export function Shell({
  children,
  className,
  title,
  description,
  maxWidth = "6xl",
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  maxWidth?: "3xl" | "6xl";
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full p-6",
        maxWidth === "3xl" ? "max-w-3xl" : "max-w-6xl",
        className
      )}
    >
      {title || description ? (
        <div className="mb-4">
          {title ? <h1 className="text-xl font-semibold">{title}</h1> : null}
          {description ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {children}
    </main>
  );
}
