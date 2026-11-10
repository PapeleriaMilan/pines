import { cn } from "@/lib/utils";

interface Props {
  tags: string[];
  activo: string | null;
  onCambio: (tag: string | null) => void;
}

export const TagChips = ({ tags, activo, onCambio }: Props) => {
  const chip = (etiqueta: string, valor: string | null) => {
    const sel = activo === valor;
    return (
      <button
        key={etiqueta}
        type="button"
        aria-pressed={sel}
        onClick={() => onCambio(sel && valor ? null : valor)}
        className={cn(
          "h-9 shrink-0 rounded-full border px-4 text-sm capitalize transition-all duration-200 active:scale-95",
          sel
            ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
            : "bg-surface hover:bg-accent hover:text-accent-foreground",
        )}
      >
        {etiqueta}
      </button>
    );
  };

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 md:mx-0 md:flex-wrap md:px-0">
      {chip("Todos", null)}
      {tags.map((t) => chip(t, t))}
    </div>
  );
};
