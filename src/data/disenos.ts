/**
 * Metadatos de cada diseño.
 * Para agregar uno nuevo: copia su carpeta en `src/assets/disenos/<slug>/`
 * (escenas nombradas `<slug>-1.webp`, `<slug>-2.webp`, …) y añade una línea aquí.
 */
export interface DisenoMeta {
  slug: string;
  nombre: string;
  subtitulo: string;
  tags: string[];
}

export const disenosMeta: DisenoMeta[] = [
  {
    slug: "memes-4-desing-3",
    nombre: "Diseño 3",
    subtitulo: "Memes temporada 4",
    tags: ["memes", "música"],
  },
  {
    slug: "memes-4-desing-5",
    nombre: "Diseño 5",
    subtitulo: "Memes temporada 4",
    tags: ["memes", "ilustración"],
  },
];
