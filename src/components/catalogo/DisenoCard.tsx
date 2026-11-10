import { Link } from "react-router";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { GlowCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import type { Diseno } from "@/lib/catalogo";

interface Props {
  diseno: Diseno;
  prioridad?: boolean;
}

export const DisenoCard = ({ diseno, prioridad }: Props) => {
  const { sumar, cantidadDe } = useCart();
  const enCarrito = cantidadDe(diseno.slug) > 0;

  return (
    <GlowCard className="h-full">
      <Link
        to={`/diseno/${diseno.slug}`}
        className="flex flex-1 flex-col rounded-[21px] outline-none"
        aria-label={`${diseno.nombre}, ${diseno.subtitulo}`}
      >
        <div className="shine bg-muted m-1.5 aspect-square overflow-hidden rounded-[16px]">
          <img
            src={diseno.portada}
            alt=""
            width={554}
            height={554}
            loading={prioridad ? "eager" : "lazy"}
            fetchPriority={prioridad ? "high" : "auto"}
            decoding="async"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 px-3 pt-1.5 pb-3">
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-semibold">{diseno.nombre}</p>
            <p className="text-muted-foreground font-inter truncate text-xs">{diseno.subtitulo}</p>
          </div>
          <div className="mt-auto flex min-h-8 flex-wrap items-end gap-1 pr-9">
            {diseno.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-muted-foreground px-1.5 text-[10px] font-normal capitalize">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </Link>

      <Button
        size="icon-sm"
        variant={enCarrito ? "default" : "secondary"}
        aria-label={`Añadir ${diseno.nombre} al carrito`}
        className="absolute right-2.5 bottom-2.5 z-20"
        onClick={() => {
          sumar(diseno.slug);
          toast.success(`${diseno.nombre} añadido`, { duration: 1500 });
        }}
      >
        {enCarrito ? <Check /> : <Plus />}
      </Button>
    </GlowCard>
  );
};
