import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { CartProvider } from "@/hooks/useCart";
import { Header } from "@/components/shared/Header";
import { Fondo } from "@/components/shared/Fondo";
import { CartDrawer } from "@/components/carrito/CartDrawer";
import Inicio from "@/pages/Inicio";
import NoEncontrado from "@/pages/NoEncontrado";

const Diseno = lazy(() => import("@/pages/Diseno"));

function ScrollArriba() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <Fondo />
        <ScrollArriba />
        <Header />
        <main className="mx-auto max-w-6xl px-4 pt-6 pb-16">
          <Suspense fallback={<div className="h-[60vh]" />}>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/diseno/:slug" element={<Diseno />} />
              <Route path="*" element={<NoEncontrado />} />
            </Routes>
          </Suspense>
        </main>
        <CartDrawer />
        <Toaster
          position="top-center"
          toastOptions={{ className: "!rounded-full !font-poppins" }}
        />
      </CartProvider>
    </MotionConfig>
  );
}
