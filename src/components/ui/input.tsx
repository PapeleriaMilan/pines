import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-muted-foreground h-11 w-full min-w-0 rounded-full border bg-white/70 px-4 text-base shadow-xs backdrop-blur-md transition-[color,box-shadow] outline-none md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
