import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  escenas: string[];
  indice: number | null;
  titulo: string;
  onCambio: (i: number | null) => void;
}

/** Visor de escenas a pantalla completa con flechas, teclado y swipe. */
export const Visor = ({ escenas, indice, titulo, onCambio }: Props) => {
  const abierto = indice !== null;
  const i = indice ?? 0;
  const ir = (d: number) => onCambio((i + d + escenas.length) % escenas.length);

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCambio(null)}>
      <DialogContent
        className="max-w-[calc(100%-1.5rem)] gap-3 overflow-hidden rounded-3xl border-none p-3 sm:max-w-xl"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") ir(1);
          if (e.key === "ArrowLeft") ir(-1);
        }}
      >
        <DialogTitle className="sr-only">
          {titulo} · escena {i + 1}
        </DialogTitle>
        <div className="bg-muted relative aspect-square overflow-hidden rounded-2xl">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={i}
              src={escenas[i]}
              alt={`${titulo}, escena ${i + 1}`}
              className="absolute inset-0 size-full touch-pan-y object-cover select-none"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) ir(1);
                else if (info.offset.x > 50) ir(-1);
              }}
              draggable={false}
            />
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="Anterior" onClick={() => ir(-1)}>
            <ChevronLeft className="size-5" />
          </Button>
          <div className="flex gap-1.5">
            {escenas.map((_, n) => (
              <button
                key={n}
                aria-label={`Escena ${n + 1}`}
                onClick={() => onCambio(n)}
                className={`h-1.5 rounded-full transition-all duration-200 ${n === i ? "bg-primary w-5" : "bg-border w-1.5"}`}
              />
            ))}
          </div>
          <Button variant="ghost" size="icon" aria-label="Siguiente" onClick={() => ir(1)}>
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
