/**
 * Punto único de configuración.
 * Para reemplazar un objeto genérico por el modelo texturado real,
 * poner la ruta del .glb en `modelUrl` (carpeta /public/models/).
 */
export type StageId = 'bottle' | 'box' | 'ice' | 'drink'

export interface StageConfig {
  id: StageId
  caption: string
  glow: string // color del resplandor de fondo
  word: string // palabra gigante del fondo
  modelUrl?: string // .glb que reemplaza al objeto genérico; si el archivo no está, queda el genérico
}

/**
 * Modelo de una etapa: src/assets/models/<id>.glb (ver README, "Modelos 3D").
 * Se detecta al compilar: si el archivo no está, la etapa no pide nada y usa el objeto generado.
 */
const MODELS = import.meta.glob<string>('../assets/models/*.glb', { eager: true, query: '?url', import: 'default' })
const model = (id: StageId): string | undefined => MODELS[`../assets/models/${id}.glb`]

export const STAGES: StageConfig[] = [
  { id: 'bottle', caption: 'Pritty Limón.', glow: '#EDE23B', word: 'PRITTY', modelUrl: model('bottle') },
  { id: 'box', caption: 'Vino Toro.', glow: '#C0322C', word: 'TORO', modelUrl: model('box') },
  { id: 'ice', caption: 'Hielo.', glow: '#CFE3EC', word: 'HIELO', modelUrl: model('ice') },
  { id: 'drink', caption: 'Pritiado.', glow: '#8A1C38', word: 'PRITIADO', modelUrl: model('drink') },
]

/** Palabras de marca del fondo: palabra gigante detrás del objeto (true = visible). */
export const SHOW_BRAND_WORDS = true

/** Enlace de la solicitud en change.org. */
export const PETITION_URL = 'https://c.org/mhSvkGmTNR'

/** Canción de cuarteto de fondo (en loop). Poner el archivo en /public/audio/. */
export const AUDIO_URL = `${import.meta.env.BASE_URL}audio/cuarteto.mp3`

/** Qué etapa del 3D acompaña a cada sección de contenido. */
export const SECTION_STAGE = [0, 1, 3] as const
/** Secciones donde el objeto se muestra de espaldas (para leer el dorso). */
export const SECTION_BACK = [true, true, false] as const

export const COLORS = {
  ink: '#12060C',
  text: '#F4EAEC',
  accent: '#EDE23B',
  brick: '#A3201F',
}
