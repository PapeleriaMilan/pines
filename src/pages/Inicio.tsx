import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { SearchBar } from "@/components/catalogo/SearchBar";
import { TagChips } from "@/components/catalogo/TagChips";
import { DisenoCard } from "@/components/catalogo/DisenoCard";
import { filtrarDisenos, todosLosTags } from "@/lib/catalogo";

export default function Inicio() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const tag = params.get("tag");

  const actualizar = (clave: "q" | "tag", valor: string | null) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (valor) p.set(clave, valor);
        else p.delete(clave);
        return p;
      },
      { replace: true },
    );

  const resultados = useMemo(() => filtrarDisenos(q, tag), [q, tag]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <h1 className="text-secondary text-2xl font-semibold tracking-tight md:text-3xl">
          Pines <span className="text-primary">botón</span>
        </h1>
        <SearchBar valor={q} onCambio={(v) => actualizar("q", v)} />
        <TagChips tags={todosLosTags} activo={tag} onCambio={(t) => actualizar("tag", t)} />
      </section>

      <motion.ul layout className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {resultados.map((d, i) => (
            <motion.li
              key={d.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.2, delay: Math.min(i, 8) * 0.025 } }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
            >
              <DisenoCard diseno={d} prioridad={i < 4} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {resultados.length === 0 && (
        <p className="text-muted-foreground py-16 text-center text-sm">Sin resultados</p>
      )}
    </div>
  );
}
