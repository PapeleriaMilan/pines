/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { disenosPorSlug } from "@/lib/catalogo";

export interface ItemCarrito {
  slug: string;
  cantidad: number;
}

type Accion =
  | { tipo: "sumar"; slug: string; delta: number }
  | { tipo: "quitar"; slug: string }
  | { tipo: "vaciar" }
  | { tipo: "reemplazar"; items: ItemCarrito[] };

const CLAVE = "milan-carrito";
const MAX = 99;

function leer(): ItemCarrito[] {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
    if (!Array.isArray(crudo)) return [];
    return crudo.filter(
      (i): i is ItemCarrito =>
        typeof i?.slug === "string" &&
        disenosPorSlug.has(i.slug) &&
        Number.isInteger(i.cantidad) &&
        i.cantidad > 0,
    );
  } catch {
    return [];
  }
}

function reducer(items: ItemCarrito[], a: Accion): ItemCarrito[] {
  switch (a.tipo) {
    case "sumar": {
      const existe = items.find((i) => i.slug === a.slug);
      if (!existe) {
        return a.delta > 0
          ? [...items, { slug: a.slug, cantidad: Math.min(a.delta, MAX) }]
          : items;
      }
      const cantidad = Math.min(existe.cantidad + a.delta, MAX);
      return cantidad <= 0
        ? items.filter((i) => i.slug !== a.slug)
        : items.map((i) => (i.slug === a.slug ? { ...i, cantidad } : i));
    }
    case "quitar":
      return items.filter((i) => i.slug !== a.slug);
    case "vaciar":
      return [];
    case "reemplazar":
      return a.items;
  }
}

interface CartContextValue {
  items: ItemCarrito[];
  total: number;
  abierto: boolean;
  setAbierto: (v: boolean) => void;
  cantidadDe: (slug: string) => number;
  sumar: (slug: string, delta?: number) => void;
  quitar: (slug: string) => void;
  vaciar: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, undefined, leer);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible: el carrito vive solo en memoria */
    }
  }, [items]);

  // Sincroniza entre pestañas abiertas.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CLAVE) dispatch({ tipo: "reemplazar", items: leer() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cantidadDe = useCallback(
    (slug: string) => items.find((i) => i.slug === slug)?.cantidad ?? 0,
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      total: items.reduce((s, i) => s + i.cantidad, 0),
      abierto,
      setAbierto,
      cantidadDe,
      sumar: (slug, delta = 1) => dispatch({ tipo: "sumar", slug, delta }),
      quitar: (slug) => dispatch({ tipo: "quitar", slug }),
      vaciar: () => dispatch({ tipo: "vaciar" }),
    }),
    [items, abierto, cantidadDe],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
