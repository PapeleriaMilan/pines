import { Monitor, Moon, Sun } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";
import { useTheme, type Tema } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const opciones: { valor: Tema; etiqueta: string; Icono: typeof Sun }[] = [
  { valor: "light", etiqueta: "Claro", Icono: Sun },
  { valor: "dark", etiqueta: "Oscuro", Icono: Moon },
  { valor: "system", etiqueta: "Sistema", Icono: Monitor },
];

export const ThemeToggle = () => {
  const { tema, setTema } = useTheme();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Cambiar tema">
          <Sun className="size-5 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-5 scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2 z-50 min-w-36 rounded-2xl border p-1 shadow-lg duration-150"
        >
          {opciones.map(({ valor, etiqueta, Icono }) => (
            <DropdownMenu.Item
              key={valor}
              onSelect={() => setTema(valor)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                tema === valor && "text-primary font-medium",
              )}
            >
              <Icono className="size-4" />
              {etiqueta}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
