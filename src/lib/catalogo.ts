import catalogoJson from "@/data/catalogo.json";

/**
 * Formato de `src/data/catalogo.json`, que exporta SIPM junto con las imágenes.
 * Las escenas de cada diseño están en `src/assets/disenos/<carpeta>/<carpeta>-N.webp`
 * (por ejemplo `Memes-22/Memes-22-1.webp`).
 */
interface CatalogoJson {
  version: number;
  generado: string;
  tematicas: {
    id: string;
    nombre: string;
    slug: string;
    subtitulo: string | null;
  }[];
  disenos: {
    codigo: number;
    carpeta: string;
    tematicaId: string;
    tags: string[];
    archivo: string;
    fecha: string;
  }[];
}

export interface Diseno {
  /** Identificador en rutas y carrito: el número del diseño como texto. */
  slug: string;
  /** Número único del diseño ("el 462"). */
  codigo: number;
  /** Nombre público: temática y número, por ejemplo "Fútbol #462". */
  nombre: string;
  tematica: string;
  /** Subtítulo de la temática; vacío si no tiene. */
  subtitulo: string;
  tags: string[];
  fecha: string;
  escenas: string[];
  portada: string;
}

const DIAS_NUEVO = 14;

const datos = catalogoJson as CatalogoJson;

const archivos = import.meta.glob<string>("/src/assets/disenos/*/*.{webp,jpg}", {
  eager: true,
  import: "default",
});

const escenasPorCarpeta = new Map<string, { n: number; url: string }[]>();
for (const [ruta, url] of Object.entries(archivos)) {
  const [, carpeta, archivo] = ruta.match(/disenos\/([^/]+)\/([^/]+)$/) ?? [];
  if (!carpeta) continue;
  const n = Number(archivo.match(/-(\d+)\.(?:webp|jpg)$/)?.[1] ?? 0);
  const lista = escenasPorCarpeta.get(carpeta) ?? [];
  lista.push({ n, url });
  escenasPorCarpeta.set(carpeta, lista);
}

const tematicasPorId = new Map(datos.tematicas.map((t) => [t.id, t]));

// Solo aparece lo que está en el catálogo (las bajas ya no vienen en el JSON)
// y tiene imágenes; el resto se ignora sin romper el sitio.
export const disenos: Diseno[] = datos.disenos
  .flatMap((meta) => {
    const escenas = (escenasPorCarpeta.get(meta.carpeta) ?? [])
      .sort((a, b) => a.n - b.n)
      .map((e) => e.url);
    const tematica = tematicasPorId.get(meta.tematicaId);
    if (escenas.length === 0 || !tematica) return [];

    return [
      {
        slug: String(meta.codigo),
        codigo: meta.codigo,
        nombre: `${tematica.nombre} #${meta.codigo}`,
        tematica: tematica.nombre,
        subtitulo: tematica.subtitulo?.trim() ?? "",
        tags: meta.tags,
        fecha: meta.fecha,
        escenas,
        portada: escenas[0],
      },
    ];
  })
  .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.codigo - a.codigo);

export const disenosPorSlug = new Map(disenos.map((d) => [d.slug, d]));

const ordenAlfabetico = (a: string, b: string) => a.localeCompare(b, "es");

export const todosLosTags = [...new Set(disenos.flatMap((d) => d.tags))].sort(
  ordenAlfabetico,
);

export const todasLasTematicas = [...new Set(disenos.map((d) => d.tematica))].sort(
  ordenAlfabetico,
);

export const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/** Diseños de los últimos días, para la insignia "Nuevo". */
export function esNuevo(diseno: Diseno, ahora = Date.now()) {
  const fecha = Date.parse(diseno.fecha);
  return Number.isFinite(fecha) && ahora - fecha < DIAS_NUEVO * 86_400_000;
}

/**
 * Filtra por texto, etiqueta y temática. Buscar `462` o `#462` encuentra el
 * diseño con ese número y lo pone primero.
 */
export function filtrarDisenos(
  q: string,
  tag: string | null,
  tematica: string | null = null,
) {
  const terminos = normalizar(q)
    .split(/\s+/)
    .map((t) => t.replace(/^#/, ""))
    .filter(Boolean);

  const resultados = disenos.filter((d) => {
    if (tag && !d.tags.includes(tag)) return false;
    if (tematica && d.tematica !== tematica) return false;
    if (terminos.length === 0) return true;
    const texto = normalizar(
      [d.nombre, d.subtitulo, d.tematica, ...d.tags, `#${d.codigo}`].join(" "),
    );
    return terminos.every((t) => texto.includes(t));
  });

  const numero = terminos.length === 1 && /^\d+$/.test(terminos[0]) ? terminos[0] : null;
  if (!numero) return resultados;
  return [...resultados].sort(
    (a, b) => Number(b.slug === numero) - Number(a.slug === numero),
  );
}
