import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  valor: string;
  onCambio: (v: string) => void;
}

export const SearchBar = ({ valor, onCambio }: Props) => (
  <div className="relative">
    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2" />
    <Input
      type="search"
      inputMode="search"
      enterKeyHint="search"
      placeholder="Buscar diseño o tag…"
      aria-label="Buscar"
      value={valor}
      onChange={(e) => onCambio(e.target.value)}
      className="pr-11 pl-10 [&::-webkit-search-cancel-button]:hidden"
    />
    {valor && (
      <button
        type="button"
        aria-label="Limpiar búsqueda"
        onClick={() => onCambio("")}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full transition-colors"
      >
        <X className="size-4" />
      </button>
    )}
  </div>
);
