import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { ClipboardList, Loader2, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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

const NOMBRE_ARCHIVO = "pedido-papeleria-milan";

/**
 * wa.me solo acepta texto, no adjuntos. Por eso:
 * - Celular: menú nativo de compartir con la imagen y el texto del pedido.
 * - Computadora: se descarga la imagen y un diálogo invita a enviarla por el
 *   chat del negocio.
 */
const tactil = window.matchMedia("(pointer: coarse)");

const usarMenuCompartir = () =>
  tactil.matches &&
  !!navigator.canShare?.({
    files: [new File([""], "x.jpg", { type: "image/jpeg" })],
  });

/** Se reevalúa en vivo (p. ej. al activar el modo responsivo del navegador). */
const suscribirTactil = (cb: () => void) => {
  tactil.addEventListener("change", cb);
  window.addEventListener("resize", cb);
  return () => {
    tactil.removeEventListener("change", cb);
    window.removeEventListener("resize", cb);
  };
};

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const CartDrawer = () => {
  const { items, total, abierto, setAbierto, sumar, quitar, vaciar } =
    useCart();
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);
  const esCelular = useSyncExternalStore(suscribirTactil, usarMenuCompartir);
  const [dialogoEnvio, setDialogoEnvio] = useState(false);
  const [imagen, setImagen] = useState<{ blob: Blob; url: string } | null>(
    null,
  );

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

  const chatNegocio = enlaceWhatsApp(textoPedido());

  // Celular: menú nativo (el cliente elige WhatsApp y el chat del negocio).
  const compartirPedido = async () => {
    if (!imagenActual) return;
    const archivo = new File([imagenActual.blob], `${NOMBRE_ARCHIVO}.jpg`, {
      type: imagenActual.blob.type,
    });
    try {
      await navigator.share({ files: [archivo], text: textoPedido() });
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        window.open(chatNegocio, "_blank", "noopener");
    }
  };

  // Computadora: descarga la imagen y muestra cómo enviarla.
  const descargarPedido = () => {
    if (!imagenActual) return;
    descargar(imagenActual.blob, `${NOMBRE_ARCHIVO}.jpg`);
    setAbierto(false);
    setDialogoEnvio(true);
  };

  return (
    <>
      <DialogPrimitive.Root
        open={abierto}
        onOpenChange={(v) => {
          setAbierto(v);
          if (!v) setConfirmarVaciar(false);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-sky-950/40 backdrop-blur-[2px] dark:bg-black/60" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className={[
              // Animación: cae desde arriba (donde está el ícono del carrito).
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top md:data-[state=open]:slide-in-from-top-6 md:data-[state=closed]:slide-out-to-top-6 md:data-[state=open]:fade-in-0 md:data-[state=closed]:fade-out-0 duration-250 ease-out",
              // Móvil: hoja superior a todo el ancho.
              "bg-background fixed inset-x-0 top-0 z-50 flex max-h-[90dvh] flex-col rounded-b-3xl pt-[env(safe-area-inset-top)] shadow-2xl outline-none",
              // Desktop: panel en la esquina superior derecha.
              "h-full md:top-3 md:right-3 md:left-auto md:max-h-[calc(100dvh-1.5rem)] md:w-[420px] md:rounded-3xl md:border md:pt-0",
            ].join(" ")}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <DialogPrimitive.Title className="text-secondary flex items-center gap-2 text-lg font-semibold">
                Carrito
                {total > 0 && (
                  <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs">
                    {total}
                  </span>
                )}
              </DialogPrimitive.Title>
              <div className="flex items-center gap-1">
                <AnimatePresence mode="popLayout" initial={false}>
                  {total > 0 &&
                    (confirmarVaciar ? (
                      <motion.div
                        key="confirmar"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1"
                      >
                        <span className="text-muted-foreground mr-1 text-xs">
                          ¿Vaciar?
                        </span>
                        <Button
                          size="sm"
                          className="bg-destructive hover:bg-destructive/90 text-white shadow-none"
                          onClick={() => {
                            vaciar();
                            setConfirmarVaciar(false);
                          }}
                        >
                          Sí
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmarVaciar(false)}
                        >
                          No
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="vaciar"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setConfirmarVaciar(true)}
                        >
                          Vaciar
                        </Button>
                      </motion.div>
                    ))}
                </AnimatePresence>
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
                <p className="text-muted-foreground text-sm">
                  Tu carrito está vacío
                </p>
                <DialogPrimitive.Close asChild>
                  <Button asChild>
                    <Link to="/">Ver diseños</Link>
                  </Button>
                </DialogPrimitive.Close>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
                  <ul className="grid gap-2 pb-4">
                    <AnimatePresence initial={false}>
                      {lineas.map(({ diseno, cantidad }) => (
                        <motion.li
                          key={diseno.slug}
                          layout
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{
                            opacity: 0,
                            x: -16,
                            transition: { duration: 0.12 },
                          }}
                          transition={{ duration: 0.18 }}
                          className="bg-card flex items-center gap-2 rounded-2xl border p-2"
                        >
                          {/* Imagen + nombre llevan a la página del diseño. */}
                          <DialogPrimitive.Close asChild>
                            <Link
                              to={`/diseno/${diseno.slug}`}
                              className="group hover:bg-accent/60 -m-1 flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition-colors"
                            >
                              <img
                                src={diseno.portada}
                                alt=""
                                className="size-20 shrink-0 rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                              <div className="min-w-0">
                                <p className="group-hover:text-primary truncate text-sm font-semibold transition-colors">
                                  {diseno.nombre}
                                </p>
                                <p className="text-muted-foreground font-inter truncate text-xs">
                                  {diseno.subtitulo}
                                </p>
                              </div>
                            </Link>
                          </DialogPrimitive.Close>
                          <Cantidad
                            valor={cantidad}
                            onCambio={(d) => sumar(diseno.slug, d)}
                          />
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
                </div>

                <div className="grid gap-2 border-t px-5 pt-3 pb-4">
                  <Button
                    variant={esCelular ? "whatsapp" : "default"}
                    size="lg"
                    disabled={!imagenActual}
                    onClick={esCelular ? compartirPedido : descargarPedido}
                  >
                    {!imagenActual ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : esCelular ? (
                      <WhatsAppIcon className="size-5" />
                    ) : (
                      <ClipboardList className="size-5" />
                    )}
                    {esCelular ? "Enviar por WhatsApp" : "Descargar pedido"}
                  </Button>
                </div>
              </>
            )}
            <div className="bg-border mx-auto mb-2.5 h-1.5 w-10 shrink-0 rounded-full md:hidden" />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Solo PC: tras descargar, invitar a enviar la imagen. */}
      <Dialog open={dialogoEnvio} onOpenChange={setDialogoEnvio}>
        <DialogContent className="max-w-sm gap-5 rounded-3xl text-center">
          <div className="bg-accent text-primary mx-auto grid size-14 place-items-center rounded-full">
            <ClipboardList className="size-6" />
          </div>
          <div className="grid gap-1.5">
            <DialogTitle className="text-secondary text-xl">
              Envíanos tu pedido
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                <p>Se descargó una imagen con tu pedido.</p>
                <p>Envíala a nuestro Whatsapp.</p>
              </div>
            </DialogDescription>
          </div>
          <Button asChild variant="whatsapp" size="lg">
            <a
              href={chatNegocio}
              target="_blank"
              rel="noreferrer"
              onClick={() => setDialogoEnvio(false)}
            >
              <WhatsAppIcon className="size-5" /> Abrir WhatsApp
            </a>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
