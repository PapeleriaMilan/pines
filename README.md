# Pines · Papelería Milán

Catálogo estático de pines (Vite + React). Los diseños los registra y exporta
SIPM (herramienta «Imágenes de pines para publicar»); aquí no se edita código
para agregarlos.

## Agregar o actualizar diseños

1. En SIPM genera las imágenes, elige la temática, pulsa **Guardar en catálogo** y luego **Descargar ZIP**.
2. Descomprime el ZIP **dentro de `src/`** y acepta reemplazar archivos:
   - `src/assets/disenos/<Temática>-<número>/<Temática>-<número>-N.webp`: escenas de
     cada diseño (por ejemplo `Memes-22/Memes-22-1.webp`). El diseño se muestra
     como «Memes #22».
   - `src/data/catalogo.json`: catálogo completo (temáticas, números, etiquetas).
3. `git add`, commit y push; el despliegue publica el cambio.

Para cambiar solo etiquetas, temáticas o dar de baja un diseño, descarga
`catalogo.json` desde la pestaña **Catálogo** de SIPM y reemplaza
`src/data/catalogo.json`. Un diseño dado de baja deja de salir en el sitio
(puedes borrar su carpeta de `src/assets/disenos/` para ahorrar espacio).

## Desarrollo

```bash
npm install
npm run dev     # servidor local
npm run lint
npm run build
```
