import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card con borde luminoso giratorio (mismo efecto que el portafolio).
 * El brillo aparece en hover (desktop) y al enfocar con teclado.
 */
function GlowCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden rounded-[22px] bg-border/60 p-px",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute top-1/2 left-1/2 aspect-square min-h-[max(300%,600px)] min-w-[max(300%,600px)] -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_85%,#818cf8_96%,transparent_100%)] opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100" />
      <div className="bg-card text-card-foreground relative z-10 flex w-full flex-1 flex-col rounded-[21px]">
        {children}
      </div>
    </div>
  );
}

export { GlowCard };
