import { negocio } from "@/data/config";
import type { Diseno } from "@/lib/catalogo";

export interface LineaPedido {
  diseno: Diseno;
  cantidad: number;
}

const ANCHO = 1080;
const PAD = 48;
const GAP = 28;
const ENCABEZADO = 200;
const LOGO = 128;
const BANDA_TOTAL = 96;
const ETIQUETA = 64;
const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;

const SKY = "#57b8eb"; // sky-600
const SKY_OSCURO = "#349bd1"; // sky-900
const SKY_CLARO = "#f0f9ff"; // sky-50

const cargar = (src: string) =>
  new Promise<HTMLImageElement>((ok, error) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => ok(img);
    img.onerror = error;
    img.src = src;
  });

function rectRedondeado(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Dibuja la imagen del pedido: logo, total de pines y la 1ª escena de cada diseño. */
export async function generarImagenPedido(
  lineas: LineaPedido[],
  tipo: "image/jpeg" | "image/png" = "image/jpeg",
): Promise<Blob> {
  await document.fonts?.ready;
  const [logo, ...imagenes] = await Promise.all([
    cargar(LOGO_SRC).catch(() => null),
    ...lineas.map((l) => cargar(l.diseno.portada)),
  ]);
  const inicioDisenos = ENCABEZADO + BANDA_TOTAL + PAD;

  const columnas = lineas.length === 1 ? 1 : lineas.length <= 4 ? 2 : 3;
  const filas = Math.ceil(lineas.length / columnas);
  const celda = (ANCHO - PAD * 2 - GAP * (columnas - 1)) / columnas;
  const alto =
    inicioDisenos + filas * (celda + ETIQUETA) + (filas - 1) * GAP + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = ANCHO;
  canvas.height = alto;
  const ctx = canvas.getContext("2d")!;

  // Fondo
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ANCHO, alto);

  // Encabezado
  const grad = ctx.createLinearGradient(0, 0, ANCHO, ENCABEZADO);
  grad.addColorStop(0, SKY_OSCURO);
  grad.addColorStop(1, SKY);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ANCHO, ENCABEZADO);

  // Logo del negocio
  let textoX = PAD;
  if (logo) {
    const ly = (ENCABEZADO - LOGO) / 2;
    ctx.save();
    rectRedondeado(ctx, PAD, ly, LOGO, LOGO, 28);
    ctx.clip();
    ctx.drawImage(logo, PAD, ly, LOGO, LOGO);
    ctx.restore();
    rectRedondeado(ctx, PAD, ly, LOGO, LOGO, 28);
    ctx.strokeStyle = "rgb(255 255 255 / 0.5)";
    ctx.lineWidth = 4;
    ctx.stroke();
    textoX = PAD + LOGO + 36;
  }

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.font = "600 56px Poppins, sans-serif";
  ctx.fillText(negocio.nombre, textoX, ENCABEZADO / 2 - 26);
  ctx.fillStyle = "#bae6fd";
  ctx.font = "500 42px Poppins, sans-serif";
  ctx.fillText("Pedido de pines", textoX, ENCABEZADO / 2 + 34);

  // Total de pines (antes de los diseños)
  const total = lineas.reduce((s, l) => s + l.cantidad, 0);
  ctx.fillStyle = SKY_CLARO;
  ctx.fillRect(0, ENCABEZADO, ANCHO, BANDA_TOTAL);
  ctx.fillStyle = SKY;
  ctx.font = "600 38px Poppins, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${total} ${total === 1 ? "pin" : "pines"} · ${lineas.length} ${lineas.length === 1 ? "diseño" : "diseños"}`,
    ANCHO / 2,
    ENCABEZADO + BANDA_TOTAL / 2,
  );
  ctx.textAlign = "left";

  // Diseños
  lineas.forEach((linea, i) => {
    const col = i % columnas;
    const fila = Math.floor(i / columnas);
    const x = PAD + col * (celda + GAP);
    const y = inicioDisenos + fila * (celda + ETIQUETA + GAP);

    ctx.save();
    rectRedondeado(ctx, x, y, celda, celda, 28);
    ctx.clip();
    ctx.drawImage(imagenes[i]!, x, y, celda, celda);
    ctx.restore();

    // Insignia de cantidad
    const texto = `×${linea.cantidad}`;
    ctx.font = "600 30px Poppins, sans-serif";
    const w = ctx.measureText(texto).width + 32;
    rectRedondeado(ctx, x + celda - w - 14, y + 14, w, 48, 24);
    ctx.fillStyle = SKY;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(texto, x + celda - w / 2 - 14, y + 39);

    // Nombre
    ctx.fillStyle = "#082f49";
    ctx.font = `600 ${columnas === 3 ? 28 : 34}px Poppins, sans-serif`;
    ctx.fillText(
      linea.diseno.nombre,
      x + celda / 2,
      y + celda + ETIQUETA / 2 + 2,
      celda,
    );
    ctx.textAlign = "left";
  });

  return new Promise((ok, error) =>
    canvas.toBlob(
      (b) => (b ? ok(b) : error(new Error("No se pudo generar la imagen"))),
      tipo,
      0.9,
    ),
  );
}

export function textoPedido() {
  return `*¡Hola, buen día!*\n Quiero pedir unos pines`;
}

export const enlaceWhatsApp = (texto: string) =>
  `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(texto)}`;
