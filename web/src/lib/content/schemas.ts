/**
 * Esquemas del contenido (secciones, lecciones, ejercicios, datasets y catálogo de libros).
 *
 * Se comparten entre `content.config.ts` (validación en el build de Astro) y los tests
 * de contenido, que validan los archivos directamente desde disco.
 */
import { z } from 'astro/zod';

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Carpetas y archivos ordenables: `01-primeros-pasos`. */
const orderedSlug = /^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z.string().regex(kebab, 'Debe ser kebab-case (ej. "mi-slug")');
export const orderedSlugSchema = z.string().regex(orderedSlug, 'Debe iniciar con dos dígitos (ej. "01-mi-slug")');

const httpsUrl = z.url({ protocol: /^https$/ });

// ---------------------------------------------------------------------------
// Catálogo de libros
// ---------------------------------------------------------------------------

export const LICENSES = [
  'CC-BY',
  'CC-BY-SA',
  'CC-BY-NC',
  'CC-BY-NC-SA',
  'CC-BY-ND',
  'CC-BY-NC-ND',
  'GFDL',
  'gratuita-sin-licencia-abierta',
  'sin-verificar',
] as const;
export type License = (typeof LICENSES)[number];

/**
 * Licencias que permiten adaptar el contenido en un proyecto sin fines de lucro.
 * Cualquier otra (incluida `sin-verificar`) se trata como "solo enlazar y citar".
 */
const ADAPTABLE_LICENSES: ReadonlySet<License> = new Set(['CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'CC-BY-NC-SA', 'GFDL']);

export function canAdapt(license: License): boolean {
  return ADAPTABLE_LICENSES.has(license);
}

export const bookSchema = z.object({
  id: slugSchema,
  title: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  topic: slugSchema,
  /** Página del libro en librosgratis.dev (nunca el PDF directo: evita hotlinking). */
  catalogUrl: httpsUrl,
  /** Fuente original del autor, si existe. */
  sourceUrl: httpsUrl.optional(),
  license: z.enum(LICENSES),
  year: z.number().int().min(1950).max(2100).optional(),
  /** Fecha de la última verificación del enlace y la licencia (AAAA-MM-DD). */
  lastChecked: z.iso.date(),
});
export type Book = z.infer<typeof bookSchema>;

export const catalogSchema = z.array(bookSchema);

// ---------------------------------------------------------------------------
// Secciones (tracks)
// ---------------------------------------------------------------------------

export const moduleSchema = z.object({
  id: orderedSlugSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

export const trackSchema = z
  .object({
    title: z.string().min(1),
    tagline: z.string().min(1),
    description: z.string().min(1),
    /** Orden en el que se muestran las secciones en el inicio. */
    order: z.number().int().nonnegative(),
    officialDocs: z.object({ label: z.string().min(1), url: httpsUrl }),
    /** Secciones recomendadas antes de esta (ids de sección). Solo sugerencia. */
    prerequisites: z.array(slugSchema).default([]),
    modules: z.array(moduleSchema).min(1),
  })
  .refine((t) => new Set(t.modules.map((m) => m.id)).size === t.modules.length, {
    message: 'Hay módulos con id duplicado',
    path: ['modules'],
  });
export type Track = z.infer<typeof trackSchema>;

// ---------------------------------------------------------------------------
// Lecciones (frontmatter de los .md)
// ---------------------------------------------------------------------------

export const sourceSchema = z.object({
  title: z.string().min(1),
  url: httpsUrl,
});

export const furtherReadingSchema = z.object({
  /** Id del libro en `catalog/books.json`. */
  book: slugSchema,
  chapter: z.string().min(1).optional(),
});

export const lessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(1),
  estimatedMinutes: z.number().int().positive().max(180),
  /** Documentación oficial en la que se basa la lección (fuente de verdad). */
  sources: z.array(sourceSchema).min(1),
  /** Libros del catálogo recomendados como lectura complementaria. */
  furtherReading: z.array(furtherReadingSchema).default([]),
  /** Lecciones sugeridas antes de esta (`seccion/modulo/leccion`). Nunca bloquean. */
  prerequisites: z.array(z.string().min(1)).default([]),
});
export type LessonFrontmatter = z.infer<typeof lessonSchema>;

// ---------------------------------------------------------------------------
// Ejercicios
// ---------------------------------------------------------------------------

const difficultySchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

const baseExercise = {
  id: slugSchema,
  title: z.string().min(1),
  difficulty: difficultySchema,
  /** Enunciado. Admite `código en línea` con comillas invertidas. */
  prompt: z.string().min(1),
};

const codeExercise = {
  ...baseExercise,
  starterCode: z.string().default(''),
  solution: z.string().min(1),
  hints: z.array(z.string().min(1)).default([]),
};

export const pythonExerciseSchema = z.object({
  ...codeExercise,
  type: z.literal('python'),
  /**
   * Código Python con `assert` que valida el ejercicio. Tiene acceso a las variables
   * y funciones del estudiante, a `salida` (texto impreso), a `codigo` (su código fuente)
   * y a `capturar_salida(f, ...)`.
   */
  tests: z.string().min(1),
  /** Líneas que devolverá `input()`, en orden. */
  stdin: z.array(z.string()).default([]),
});

export const sqlExerciseSchema = z.object({
  ...codeExercise,
  type: z.literal('sql'),
  /** Id del dataset (`content/<seccion>/_datasets/<id>.yaml`). */
  dataset: slugSchema,
  /** Consulta a comparar tras ejecutar el código (para INSERT/UPDATE/DELETE/CREATE). */
  checkQuery: z.string().min(1).optional(),
  /** Si el orden de las filas importa (ejercicios de ORDER BY). */
  ordered: z.boolean().default(false),
});

export const quizExerciseSchema = z
  .object({
    ...baseExercise,
    type: z.literal('quiz'),
    options: z.array(z.string().min(1)).min(2).max(6),
    /** Índice (base 0) de la opción correcta. */
    answer: z.number().int().nonnegative(),
    explanation: z.string().min(1),
  })
  .refine((q) => q.answer < q.options.length, {
    message: 'La respuesta debe ser un índice válido de `options`',
    path: ['answer'],
  });

export const manualExerciseSchema = z.object({
  ...baseExercise,
  type: z.literal('manual'),
  /** Criterios que el estudiante revisa antes de marcar el ejercicio como completado. */
  checklist: z.array(z.string().min(1)).min(1),
});

export const exerciseSchema = z.discriminatedUnion('type', [
  pythonExerciseSchema,
  sqlExerciseSchema,
  quizExerciseSchema,
  manualExerciseSchema,
]);
export type Exercise = z.infer<typeof exerciseSchema>;
export type PythonExercise = z.infer<typeof pythonExerciseSchema>;
export type SqlExercise = z.infer<typeof sqlExerciseSchema>;
export type QuizExercise = z.infer<typeof quizExerciseSchema>;
export type ManualExercise = z.infer<typeof manualExerciseSchema>;

export const exerciseFileSchema = z
  .object({ exercises: z.array(exerciseSchema).min(1) })
  .refine((f) => new Set(f.exercises.map((e) => e.id)).size === f.exercises.length, {
    message: 'Hay ejercicios con id duplicado en el archivo',
    path: ['exercises'],
  });

// ---------------------------------------------------------------------------
// Datasets SQL
// ---------------------------------------------------------------------------

export const datasetSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  /** Script que crea y llena las tablas. Se ejecuta en una base de datos nueva. */
  sql: z.string().min(1),
});
export type Dataset = z.infer<typeof datasetSchema>;
