/** Fondo con malla de puntos y orbes difuminados (solo md+, como el portafolio). */
export const Fondo = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    <div className="absolute inset-0 bg-[radial-gradient(var(--dots)_1px,transparent_1px)] mask-[linear-gradient(to_bottom,white_10%,transparent_70%)] bg-size-[20px_20px]" />
    <div className="hidden md:block">
      <div className="animate-orbe-1 absolute -top-32 left-1/3 h-96 w-96 transform-gpu rounded-full bg-sky-300 opacity-25 blur-[128px] will-change-transform dark:bg-sky-500 dark:opacity-[0.1]" />
      <div className="animate-orbe-2 absolute -bottom-32 -left-20 h-96 w-96 transform-gpu rounded-full bg-cyan-200 opacity-40 blur-[128px] will-change-transform dark:bg-sky-700 dark:opacity-15" />
    </div>
  </div>
);
