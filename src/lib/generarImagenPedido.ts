import { negocio } from "@/data/config";
import type { Diseno } from "@/lib/catalogo";

export interface LineaPedido {
  diseno: Diseno;
  cantidad: number;
}

const ANCHO = 1080;
const PAD = 48;
const GAP = 28;
const ENCABEZADO = 170;
const ETIQUETA = 64;
const PIE = 90;

const INDIGO = "#4338ca";
const INDIGO_OSCURO = "#312e81";
const LAVANDA = "#eef2ff";

const cargar = (src: string) =>
  new Promise<HTMLImageElement>((ok, error) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => ok(img);
    img.onerror = error;
    img.src = src;
  });

function rectRedondeado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Dibuja una imagen con la 1ª escena de cada diseño del pedido y devuelve un JPEG. */
export async function generarImagenPedido(lineas: LineaPedido[]): Promise<Blob> {
  await document.fonts?.ready;
  const imagenes = await Promise.all(lineas.map((l) => cargar(l.diseno.portada)));

  const columnas = lineas.length === 1 ? 1 : lineas.length <= 4 ? 2 : 3;
  const filas = Math.ceil(lineas.length / columnas);
  const celda = (ANCHO - PAD * 2 - GAP * (columnas - 1)) / columnas;
  const alto = ENCABEZADO + PAD + filas * (celda + ETIQUETA) + (filas - 1) * GAP + PIE;

  const canvas = document.createElement("canvas");
  canvas.width = ANCHO;
  canvas.height = alto;
  const ctx = canvas.getContext("2d")!;

  // Fondo
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ANCHO, alto);

  // Encabezado
  const grad = ctx.createLinearGradient(0, 0, ANCHO, ENCABEZADO);
  grad.addColorStop(0, INDIGO_OSCURO);
  grad.addColorStop(1, INDIGO);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ANCHO, ENCABEZADO);

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.font = "600 52px Poppins, sans-serif";
  ctx.fillText(negocio.nombre, PAD, ENCABEZADO / 2 - 18);
  ctx.fillStyle = "#c7d2fe";
  ctx.font = "400 30px Poppins, sans-serif";
  ctx.fillText("Mi pedido de pines", PAD, ENCABEZADO / 2 + 32);

  // Diseños
  lineas.forEach((linea, i) => {
    const col = i % columnas;
    const fila = Math.floor(i / columnas);
    const x = PAD + col * (celda + GAP);
    const y = ENCABEZADO + PAD + fila * (celda + ETIQUETA + GAP);

    ctx.save();
    rectRedondeado(ctx, x, y, celda, celda, 28);
    ctx.clip();
    ctx.drawImage(imagenes[i], x, y, celda, celda);
    ctx.restore();

    // Insignia de cantidad
    const texto = `×${linea.cantidad}`;
    ctx.font = "600 30px Poppins, sans-serif";
    const w = ctx.measureText(texto).width + 32;
    rectRedondeado(ctx, x + celda - w - 14, y + 14, w, 48, 24);
    ctx.fillStyle = INDIGO;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(texto, x + celda - w / 2 - 14, y + 39);

    // Nombre
    ctx.fillStyle = "#1e1b4b";
    ctx.font = `600 ${columnas === 3 ? 28 : 34}px Poppins, sans-serif`;
    ctx.fillText(linea.diseno.nombre, x + celda / 2, y + celda + ETIQUETA / 2 + 2, celda);
    ctx.textAlign = "left";
  });

  // Pie
  const total = lineas.reduce((s, l) => s + l.cantidad, 0);
  ctx.fillStyle = LAVANDA;
  ctx.fillRect(0, alto - PIE, ANCHO, PIE);
  ctx.fillStyle = INDIGO;
  ctx.font = "600 32px Poppins, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${total} ${total === 1 ? "pin" : "pines"}`, ANCHO / 2, alto - PIE / 2);

  return new Promise((ok, error) =>
    canvas.toBlob((b) => (b ? ok(b) : error(new Error("No se pudo generar la imagen"))), "image/jpeg", 0.9),
  );
}

export function textoPedido(lineas: LineaPedido[]) {
  const lista = lineas.map((l) => `• ${l.diseno.nombre} (${l.diseno.subtitulo}) ×${l.cantidad}`).join("\n");
  const total = lineas.reduce((s, l) => s + l.cantidad, 0);
  return `¡Hola ${negocio.nombre}! Quiero estos pines:\n${lista}\nTotal: ${total}`;
}

export const enlaceWhatsApp = (texto: string) =>
  `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(texto)}`;
