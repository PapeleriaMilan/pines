import { Link } from "react-router";
import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { negocio } from "@/data/config";

export const Header = () => {
  const { total, setAbierto } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-full text-sm font-bold shadow-md shadow-primary/30">
            M
          </span>
          <span className="text-secondary font-semibold tracking-tight">
            {negocio.nombre}
          </span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Abrir carrito (${total})`}
          onClick={() => setAbierto(true)}
        >
          <ShoppingBag className="size-5" />
          <AnimatePresence>
            {total > 0 && (
              <motion.span
                key={total}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 22 }}
                className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-semibold"
              >
                {total}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </header>
  );
};
