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

const anim = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.15 },
};

export default function Diseno() {
  const { slug = "" } = useParams();
  const diseno = disenosPorSlug.get(slug);
  const { cantidadDe, sumar, setAbierto } = useCart();
  const [visor, setVisor] = useState<number | null>(null);

  if (!diseno) return <NoEncontrado />;
  const cantidad = cantidadDe(diseno.slug);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-4">
        <Button asChild variant="ghost" size="icon" className="-ml-2 shrink-0">
          <Link to="/" aria-label="Volver al catálogo">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-secondary text-xl font-semibold md:text-2xl">
            {diseno.nombre}
          </h1>
          <p className="text-muted-foreground font-inter text-sm">
            {diseno.subtitulo}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {diseno.tags.map((t) => (
              <Badge key={t} asChild variant="outline" className="capitalize">
                <Link to={`/?tag=${encodeURIComponent(t)}`}>{t}</Link>
              </Badge>
            ))}
          </div>
        </div>

        {/* Acción: debajo del título en móvil, a la derecha en desktop. */}
        <div className="w-full md:w-auto md:self-center">
          <AnimatePresence mode="wait" initial={false}>
            {cantidad === 0 ? (
              <motion.div key="add" {...anim}>
                <Button
                  size="lg"
                  className="w-full md:w-auto"
                  onClick={() => {
                    sumar(diseno.slug);
                    toast.success(`${diseno.nombre} añadido`, {
                      duration: 1500,
                    });
                  }}
                >
                  <ShoppingBag /> Añadir al carrito
                </Button>
              </motion.div>
            ) : (
              <motion.div key="qty" {...anim} className="flex items-center gap-3">
                <Cantidad
                  valor={cantidad}
                  onCambio={(d) => sumar(diseno.slug, d)}
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={() => setAbierto(true)}
                >
                  Ver carrito
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
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
              className="group shine bg-muted ring-border hover:shadow-primary/10 block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl ring-1 transition-shadow hover:shadow-lg"
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

      <Visor
        escenas={diseno.escenas}
        indice={visor}
        titulo={diseno.nombre}
        onCambio={setVisor}
      />
    </div>
  );
}
