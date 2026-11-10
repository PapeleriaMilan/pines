import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { Download, ImageIcon, Share2, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Cantidad } from "@/components/shared/Cantidad";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { useCart } from "@/hooks/useCart";
import { disenosPorSlug } from "@/lib/catalogo";
import {
  enlaceWhatsApp,
  generarImagenPedido,
  textoPedido,
  type LineaPedido,
} from "@/lib/generarImagenPedido";

const NOMBRE_ARCHIVO = "pedido-papeleria-milan.jpg";

export const CartDrawer = () => {
  const { items, total, abierto, setAbierto, sumar, quitar, vaciar } = useCart();
  const [imagen, setImagen] = useState<{ blob: Blob; url: string } | null>(null);

  const lineas = useMemo<LineaPedido[]>(
    () =>
      items.flatMap((i) => {
        const diseno = disenosPorSlug.get(i.slug);
        return diseno ? [{ diseno, cantidad: i.cantidad }] : [];
      }),
    [items],
  );

  // Regenera la imagen del pedido cuando el carrito está abierto y cambia.
  useEffect(() => {
    if (!abierto || lineas.length === 0) return;
    let cancelado = false;
    const t = setTimeout(() => {
      generarImagenPedido(lineas)
        .then((blob) => {
          if (cancelado) return;
          const url = URL.createObjectURL(blob);
          setImagen((prev) => {
            if (prev) URL.revokeObjectURL(prev.url);
            return { blob, url };
          });
        })
        .catch(() => toast.error("No se pudo generar la imagen"));
    }, 150);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [abierto, lineas]);

  const imagenActual = lineas.length > 0 ? imagen : null;

  const compartirImagen = async () => {
    if (!imagenActual) return;
    const archivo = new File([imagenActual.blob], NOMBRE_ARCHIVO, { type: "image/jpeg" });
    if (navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], text: textoPedido(lineas) });
      } catch {
        /* el usuario canceló */
      }
      return;
    }
    const a = document.createElement("a");
    a.href = imagenActual.url;
    a.download = NOMBRE_ARCHIVO;
    a.click();
    toast.success("Imagen descargada");
  };

  const puedeCompartir =
    typeof navigator !== "undefined" &&
    !!navigator.canShare?.({ files: [new File([""], "x.jpg", { type: "image/jpeg" })] });

  return (
    <DialogPrimitive.Root open={abierto} onOpenChange={setAbierto}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-indigo-950/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom md:data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-bottom md:data-[state=closed]:slide-out-to-right bg-background fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-3xl shadow-2xl duration-250 ease-out outline-none md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[420px] md:rounded-l-3xl md:rounded-tr-none"
        >
          <div className="bg-border mx-auto mt-2.5 h-1.5 w-10 rounded-full md:hidden" />

          <div className="flex items-center justify-between px-5 pt-3 pb-2 md:pt-5">
            <DialogPrimitive.Title className="text-secondary flex items-center gap-2 text-lg font-semibold">
              Carrito
              {total > 0 && (
                <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs">
                  {total}
                </span>
              )}
            </DialogPrimitive.Title>
            <div className="flex items-center gap-1">
              {total > 0 && (
                <Button variant="destructive" size="sm" onClick={vaciar}>
                  Vaciar
                </Button>
              )}
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Cerrar">
                  <X className="size-5" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {lineas.length === 0 ? (
            <div className="grid place-items-center gap-4 px-5 py-14 text-center">
              <div className="bg-accent text-primary grid size-16 place-items-center rounded-full">
                <ShoppingBag className="size-7" />
              </div>
              <p className="text-muted-foreground text-sm">Tu carrito está vacío</p>
              <DialogPrimitive.Close asChild>
                <Button asChild>
                  <Link to="/">Ver diseños</Link>
                </Button>
              </DialogPrimitive.Close>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
                <ul className="grid gap-2">
                  <AnimatePresence initial={false}>
                    {lineas.map(({ diseno, cantidad }) => (
                      <motion.li
                        key={diseno.slug}
                        layout
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16, transition: { duration: 0.12 } }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-3 rounded-2xl border bg-white p-2"
                      >
                        <DialogPrimitive.Close asChild>
                          <Link to={`/diseno/${diseno.slug}`} className="shrink-0">
                            <img src={diseno.portada} alt="" className="size-14 rounded-xl object-cover" />
                          </Link>
                        </DialogPrimitive.Close>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{diseno.nombre}</p>
                          <p className="text-muted-foreground font-inter truncate text-xs">{diseno.subtitulo}</p>
                        </div>
                        <Cantidad valor={cantidad} onCambio={(d) => sumar(diseno.slug, d)} />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Quitar ${diseno.nombre}`}
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => quitar(diseno.slug)}
                        >
                          <Trash2 />
                        </Button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="bg-muted my-4 overflow-hidden rounded-2xl border">
                  {imagenActual ? (
                    <img src={imagenActual.url} alt="Vista previa del pedido" className="w-full" />
                  ) : (
                    <div className="text-muted-foreground grid aspect-[4/3] place-items-center">
                      <ImageIcon className="size-6 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2 border-t px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Button variant="outline" size="lg" disabled={!imagenActual} onClick={compartirImagen}>
                  {puedeCompartir ? <Share2 /> : <Download />}
                  {puedeCompartir ? "Compartir imagen" : "Descargar imagen"}
                </Button>
                <Button asChild variant="whatsapp" size="lg">
                  <a href={enlaceWhatsApp(textoPedido(lineas))} target="_blank" rel="noreferrer">
                    <WhatsAppIcon className="size-5" /> Enviar pedido
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
