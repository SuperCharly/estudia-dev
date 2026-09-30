/**
 * Carga el contenido directamente desde disco (sin Astro) para validarlo en los tests.
 * Replica las reglas de `src/content.config.ts`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import {
  catalogSchema,
  datasetSchema,
  exerciseFileSchema,
  lessonSchema,
  trackSchema,
  type Book,
  type Dataset,
  type Exercise,
  type LessonFrontmatter,
  type Track,
} from '../../src/lib/content/schemas';

export const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const CONTENT_DIR = join(REPO_ROOT, 'content');

interface Entry<T> {
  id: string;
  file: string;
  data: T;
}

export interface LoadedContent {
  tracks: Entry<Track>[];
  lessons: (Entry<LessonFrontmatter> & { body: string })[];
  exercises: Map<string, Exercise[]>;
  datasets: Map<string, Dataset>;
  books: Book[];
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const toId = (file: string, extension: string) =>
  relative(CONTENT_DIR, file).split(sep).join('/').slice(0, -extension.length);

export function parseFrontmatter(text: string): { data: unknown; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) throw new Error('El archivo no tiene frontmatter YAML (--- ... ---).');
  return { data: parseYaml(match[1]!), body: match[2]! };
}

function parseWith<T>(schema: { parse: (v: unknown) => T }, value: unknown, file: string): T {
  try {
    return schema.parse(value);
  } catch (error) {
    throw new Error(`${relative(REPO_ROOT, file)}: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
}

export function loadContent(): LoadedContent {
  const files = walk(CONTENT_DIR);
  const read = (file: string) => readFileSync(file, 'utf8');
  const content: LoadedContent = { tracks: [], lessons: [], exercises: new Map(), datasets: new Map(), books: [] };

  for (const file of files) {
    const rel = relative(CONTENT_DIR, file).split(sep).join('/');
    if (/^[^/]+\/_track\.yaml$/.test(rel)) {
      content.tracks.push({ id: rel.split('/')[0]!, file, data: parseWith(trackSchema, parseYaml(read(file)), file) });
    } else if (/^[^/]+\/_datasets\/[^/]+\.yaml$/.test(rel)) {
      const id = rel
        .split('/')
        .at(-1)!
        .replace(/\.yaml$/, '');
      content.datasets.set(id, parseWith(datasetSchema, parseYaml(read(file)), file));
    } else if (/^[^/]+\/\d{2}-[^/]+\/\d{2}-[^/]+\.exercises\.yaml$/.test(rel)) {
      const parsed = parseWith(exerciseFileSchema, parseYaml(read(file)), file);
      content.exercises.set(toId(file, '.exercises.yaml'), parsed.exercises);
    } else if (/^[^/]+\/\d{2}-[^/]+\/\d{2}-[^/]+\.md$/.test(rel)) {
      const { data, body } = parseFrontmatter(read(file));
      content.lessons.push({ id: toId(file, '.md'), file, data: parseWith(lessonSchema, data, file), body });
    } else {
      throw new Error(`Archivo inesperado en content/: ${rel}. Revisa el nombre y la ubicación.`);
    }
  }

  const catalogFile = join(REPO_ROOT, 'catalog', 'books.json');
  content.books = parseWith(catalogSchema, JSON.parse(read(catalogFile)), catalogFile);
  return content;
}
