# Pritiado · Patrimonio

Sitio de campaña para pedir que el pritiado sea declarado Patrimonio Cultural Inmaterial de la Humanidad.
Vite + React 18 + TypeScript + React Three Fiber. Mobile-first. Se publica en `labs.mondistudio.com.ar/pritiado`.

Un carrusel 3D de 4 etapas (botella, brik, hielo, jarra con el pritiado); al bajar, el contenido se lee en el
dorso de la botella y de la caja, y cierra con el botón para firmar en change.org.

## Cómo correrlo

    npm install
    npm run dev        # http://localhost:5173/pritiado/
    npm run build      # chequea tipos (tsc --noEmit) y genera dist/
    npm run preview    # sirve dist/ en http://localhost:4173/pritiado/

## Dónde tocar

- `src/config/stages.ts`: **punto único de configuración**. Las 4 etapas (texto, color, palabra de fondo, modelo),
  `SHOW_BRAND_WORDS`, `PETITION_URL`, `AUDIO_URL` y los colores.
- `src/scene/Scene.tsx`: cámara, luces de estudio, pedestal, rotación y resolución (dpr).
- `src/scene/Bottle.tsx`, `Box.tsx`, `Ice.tsx`, `Jar.tsx`: los objetos generados en código.
- `src/scene/textures.ts`: etiquetas y caras del brik (dibujadas en canvas, genéricas, sin marcas).
- `src/scene/profile.ts`: silueta de la botella medida sobre la foto de referencia.
- `src/ui/` y `src/styles.css`: la interfaz.

## Link de change.org

`PETITION_URL` en `src/config/stages.ts`. Hoy es un placeholder (`https://www.change.org/`): reemplazarlo por el
link real de la solicitud cuando exista. Lo usa el botón "Firmar la solicitud" (se abre en otra pestaña).

## Música

- Archivo: `public/audio/cuarteto.mp3` (ruta en `AUDIO_URL`). Suena en loop a volumen 0.6.
- "Entrar con sonido" la arranca; "Entrar sin sonido" entra en silencio; el ecualizador de arriba a la izquierda
  silencia y reanuda.
- El mp3 publicado es una copia del original (`../cuarteto.mp3`, sin tocar) recortada en el segundo 193,4 con un
  fundido de salida de 300 ms, porque el original terminaba con 12,7 s de silencio que cortaban el loop:

      ffmpeg -i cuarteto.mp3 -t 193.4 -af "afade=t=out:st=193.1:d=0.3" -c:a libmp3lame -b:a 128k public/audio/cuarteto.mp3

  Para cambiar el tema: mp3 de 128 kbps, idealmente de menos de 4 MB y sin silencio al final.

## Modelos 3D (.glb)

Cada etapa busca un .glb en `public/models/`. Si el archivo está, reemplaza al objeto generado en código; si no está
o falla al cargar, queda el objeto generado. No hay que tocar código: alcanza con poner el archivo.

| Etapa | Archivo esperado            | Ocupa la altura de                            |
|-------|-----------------------------|-----------------------------------------------|
| 1     | `public/models/bottle.glb`  | la botella (0,5 L)                            |
| 2     | `public/models/box.glb`     | el brik de 1 L                                |
| 3     | `public/models/ice.glb`     | el grupo de cubitos                           |
| 4     | `public/models/drink.glb`   | la jarra (botella de 2 L cortada) con el trago |

- **Escala**: libre (metros, centímetros, lo que sea). Al cargar, el modelo se escala de forma uniforme para tener la
  misma altura que el objeto generado de su etapa, se apoya en la misma base (sobre el pedestal) y se centra en X/Z.
- **Orientación**: la convención de glTF. **+Y hacia arriba** y el **frente mirando a +Z** (hacia la cámara). El dorso
  (−Z) es el que se ve en las secciones "Dorso de la botella" y "Dorso de la caja".
- **Origen**: no importa, se recentra.
- Materiales PBR estándar (metallic/roughness). Si viene comprimido con Draco, el decodificador se baja de la CDN de
  Google la primera vez.
- Para usar otro nombre de archivo, cambiar `modelUrl` de esa etapa en `src/config/stages.ts`.

## Rendimiento

La botella, el hielo y la jarra usan `transmission`, lo que suma un segundo render de la escena a tamaño completo.
Por eso el dpr se limita a 1,5 en pantallas de menos de 600 px de lado (2 en escritorio) y `PerformanceMonitor`
lo baja a 1 si el FPS no alcanza. No se quitó ningún efecto.

## Capturas

`shots.cjs` saca las capturas de todas las etapas y secciones contra `npm run preview` (necesita `playwright`
instalado aparte). Sin GPU usa SwiftShader (`--use-gl=angle --use-angle=swiftshader`).

    node shots.cjs 390 844 m      # celular
    node shots.cjs 1440 900 d     # escritorio

## Deploy

La base de Vite es `/pritiado/` (`vite.config.ts`). `npm run build` genera `dist/`; subir su contenido a la carpeta
`/pritiado/` del servidor (`labs.mondistudio.com.ar/pritiado/`). Para publicar en otra ruta, cambiar `base`.

`vite.preview.config.ts` arma una vista previa de un solo HTML autocontenido (`dist-preview/`) para revisar en el
celular: `npx vite build -c vite.preview.config.ts`.

## Texto legal

Obligatorio y presente en el pie de la sección de firma: "El consumo excesivo de alcohol es perjudicial para la
salud. Prohibida su venta a menores de 18 años."
