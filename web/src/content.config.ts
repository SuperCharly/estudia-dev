import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { bookSchema, datasetSchema, exerciseFileSchema, lessonSchema, trackSchema } from './lib/content/schemas';

/** El contenido vive fuera de `web/` para que el pipeline y los revisores lo editen sin tocar código. */
const CONTENT_DIR = '../content';

const stripExtension = (entry: string, extension: string) => entry.slice(0, -extension.length);

/** Primer o último segmento de una ruta relativa (`python/_track.yaml` → `python`). */
function segment(entry: string, position: 'first' | 'last'): string {
  const parts = entry.split('/');
  const value = position === 'first' ? parts[0] : parts.at(-1);
  if (!value) throw new Error(`Ruta de contenido inesperada: "${entry}"`);
  return value;
}

const tracks = defineCollection({
  loader: glob({
    pattern: '*/_track.yaml',
    base: CONTENT_DIR,
    generateId: ({ entry }) => segment(entry, 'first'),
  }),
  schema: trackSchema,
});

const lessons = defineCollection({
  loader: glob({
    pattern: '*/[0-9][0-9]-*/[0-9][0-9]-*.md',
    base: CONTENT_DIR,
    generateId: ({ entry }) => stripExtension(entry, '.md'),
  }),
  schema: lessonSchema.extend({
    furtherReading: z.array(z.object({ book: reference('books'), chapter: z.string().min(1).optional() })).default([]),
  }),
});

const exercises = defineCollection({
  loader: glob({
    pattern: '*/[0-9][0-9]-*/[0-9][0-9]-*.exercises.yaml',
    base: CONTENT_DIR,
    // Mismo id que su lección: python/01-primeros-pasos/01-hola-python
    generateId: ({ entry }) => stripExtension(entry, '.exercises.yaml'),
  }),
  schema: exerciseFileSchema,
});

const datasets = defineCollection({
  loader: glob({
    pattern: '*/_datasets/*.yaml',
    base: CONTENT_DIR,
    generateId: ({ entry }) => stripExtension(segment(entry, 'last'), '.yaml'),
  }),
  schema: datasetSchema,
});

const books = defineCollection({
  loader: file('../catalog/books.json'),
  schema: bookSchema,
});

export const collections = { tracks, lessons, exercises, datasets, books };
