import { useCallback, useEffect, useSyncExternalStore } from "react";

export type Tema = "light" | "dark" | "system";

const CLAVE = "milan-tema";
const media = window.matchMedia("(prefers-color-scheme: dark)");
const oyentes = new Set<() => void>();

function leer(): Tema {
  try {
    const t = localStorage.getItem(CLAVE);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

/** Aplica la clase `dark` en <html> según la preferencia guardada. */
export function aplicarTema(tema: Tema = leer()) {
  const oscuro = tema === "dark" || (tema === "system" && media.matches);
  document.documentElement.classList.toggle("dark", oscuro);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", oscuro ? "#0a0b0d" : "#0284c7");
}

function suscribir(cb: () => void) {
  oyentes.add(cb);
  return () => oyentes.delete(cb);
}

export function useTheme() {
  const tema = useSyncExternalStore(suscribir, leer);

  // Sigue al sistema en vivo cuando el tema es "system".
  useEffect(() => {
    const onCambio = () => leer() === "system" && aplicarTema("system");
    media.addEventListener("change", onCambio);
    return () => media.removeEventListener("change", onCambio);
  }, []);

  const setTema = useCallback((t: Tema) => {
    try {
      if (t === "system") localStorage.removeItem(CLAVE);
      else localStorage.setItem(CLAVE, t);
    } catch {
      /* sin almacenamiento */
    }
    aplicarTema(t);
    oyentes.forEach((cb) => cb());
  }, []);

  return { tema, setTema };
}
