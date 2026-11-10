import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cantidad } from "@/components/shared/Cantidad";
import { Visor } from "@/components/catalogo/Visor";
import { disenosPorSlug } from "@/lib/catalogo";
import { useCart } from "@/hooks/useCart";
import NoEncontrado from "@/pages/NoEncontrado";

export default function Diseno() {
  const { slug = "" } = useParams();
  const diseno = disenosPorSlug.get(slug);
  const { cantidadDe, sumar, setAbierto } = useCart();
  const [visor, setVisor] = useState<number | null>(null);

  if (!diseno) return <NoEncontrado />;
  const cantidad = cantidadDe(diseno.slug);

  return (
    <div className="grid gap-5 pb-20 md:pb-0">
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="-ml-2 shrink-0">
          <Link to="/" aria-label="Volver al catálogo">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-secondary text-xl font-semibold md:text-2xl">{diseno.nombre}</h1>
          <p className="text-muted-foreground font-inter text-sm">{diseno.subtitulo}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {diseno.tags.map((t) => (
              <Badge key={t} asChild variant="outline" className="capitalize">
                <Link to={`/?tag=${encodeURIComponent(t)}`}>{t}</Link>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {diseno.escenas.map((src, i) => (
          <motion.li
            key={src}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
          >
            <button
              type="button"
              onClick={() => setVisor(i)}
              aria-label={`Ver escena ${i + 1}`}
              className="group shine bg-muted block aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-black/5 transition-shadow hover:shadow-lg hover:shadow-primary/10"
            >
              <img
                src={src}
                alt=""
                width={554}
                height={554}
                loading={i < 4 ? "eager" : "lazy"}
                decoding="async"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          </motion.li>
        ))}
      </ul>

      {/* Barra de acción: fija abajo en móvil, en línea en desktop. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:static md:border-none md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3">
          <AnimatePresence mode="wait" initial={false}>
            {cantidad === 0 ? (
              <motion.div key="add" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="w-full md:w-auto">
                <Button
                  size="lg"
                  className="w-full md:w-auto"
                  onClick={() => {
                    sumar(diseno.slug);
                    toast.success(`${diseno.nombre} añadido`, { duration: 1500 });
                  }}
                >
                  <ShoppingBag /> Añadir al carrito
                </Button>
              </motion.div>
            ) : (
              <motion.div key="qty" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="flex w-full items-center gap-3 md:w-auto">
                <Cantidad valor={cantidad} onCambio={(d) => sumar(diseno.slug, d)} />
                <Button size="lg" variant="outline" className="flex-1 md:flex-none" onClick={() => setAbierto(true)}>
                  Ver carrito
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Visor escenas={diseno.escenas} indice={visor} titulo={diseno.nombre} onCambio={setVisor} />
    </div>
  );
}
