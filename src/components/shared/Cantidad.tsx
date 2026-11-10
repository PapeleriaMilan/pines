import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  valor: number;
  onCambio: (delta: number) => void;
  className?: string;
}

export const Cantidad = ({ valor, onCambio, className }: Props) => (
  <div className={cn("bg-accent flex items-center rounded-full p-0.5", className)}>
    <Button variant="ghost" size="icon-sm" aria-label="Quitar uno" onClick={() => onCambio(-1)} className="hover:bg-background">
      <Minus />
    </Button>
    <span className="text-accent-foreground w-7 text-center text-sm font-semibold tabular-nums">
      {valor}
    </span>
    <Button variant="ghost" size="icon-sm" aria-label="Añadir uno" onClick={() => onCambio(1)} className="hover:bg-background">
      <Plus />
    </Button>
  </div>
);
