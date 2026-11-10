import { disenosMeta, type DisenoMeta } from "@/data/disenos";

export interface Diseno extends DisenoMeta {
  escenas: string[];
  portada: string;
}

const archivos = import.meta.glob<string>("/src/assets/disenos/*/*.webp", {
  eager: true,
  import: "default",
});

const escenasPorSlug = new Map<string, { n: number; url: string }[]>();
for (const [ruta, url] of Object.entries(archivos)) {
  const [, slug, archivo] = ruta.match(/disenos\/([^/]+)\/([^/]+)$/) ?? [];
  if (!slug) continue;
  const n = Number(archivo.match(/-(\d+)\.webp$/)?.[1] ?? 0);
  const lista = escenasPorSlug.get(slug) ?? [];
  lista.push({ n, url });
  escenasPorSlug.set(slug, lista);
}

export const disenos: Diseno[] = disenosMeta.flatMap((meta) => {
  const escenas = (escenasPorSlug.get(meta.slug) ?? [])
    .sort((a, b) => a.n - b.n)
    .map((e) => e.url);
  if (escenas.length === 0) return [];
  return [{ ...meta, escenas, portada: escenas[0] }];
});

export const disenosPorSlug = new Map(disenos.map((d) => [d.slug, d]));

export const todosLosTags = [...new Set(disenos.flatMap((d) => d.tags))].sort(
  (a, b) => a.localeCompare(b, "es"),
);

export const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

export function filtrarDisenos(q: string, tag: string | null) {
  const terminos = normalizar(q).split(/\s+/).filter(Boolean);
  return disenos.filter((d) => {
    if (tag && !d.tags.includes(tag)) return false;
    if (terminos.length === 0) return true;
    const texto = normalizar([d.nombre, d.subtitulo, ...d.tags].join(" "));
    return terminos.every((t) => texto.includes(t));
  });
}
