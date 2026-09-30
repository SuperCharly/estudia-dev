/**
 * Valida todo el contenido publicado: estructura, referencias cruzadas y, sobre todo, que
 * cada ejercicio sea resoluble (la solución oficial pasa sus pruebas) y no trivial (el
 * código inicial no las pasa). Protege contra guías generadas o editadas con errores.
 */
import { loadPyodide } from 'pyodide';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildTrackOutline } from '../../src/lib/content/outline';
import { createPythonRunner } from '../../src/lib/runners/python/grader';
import { runSql, SqlSandbox } from '../../src/lib/runners/sql/grader';
import { createPgliteDatabase } from '../../src/lib/runners/sql/pglite';
import type { PythonRequest, RunResult } from '../../src/lib/runners/types';
import { loadContent } from './load-content';

const content = loadContent();
const lessonIds = new Set(content.lessons.map((l) => l.id));
const bookIds = new Set(content.books.map((b) => b.id));

const allExercises = [...content.exercises].flatMap(([lessonId, exercises]) =>
  exercises.map((exercise) => ({ lessonId, exercise })),
);
const pythonExercises = allExercises.flatMap(({ lessonId, exercise }) =>
  exercise.type === 'python' ? [{ name: `${lessonId}#${exercise.id}`, exercise }] : [],
);
const sqlExercises = allExercises.flatMap(({ lessonId, exercise }) =>
  exercise.type === 'sql' ? [{ name: `${lessonId}#${exercise.id}`, exercise }] : [],
);

describe('estructura del contenido', () => {
  it('hay al menos una sección con lecciones', () => {
    expect(content.tracks.length).toBeGreaterThan(0);
    expect(content.lessons.length).toBeGreaterThan(0);
  });

  it.each(content.tracks.map((t) => [t.id, t] as const))('la sección %s es coherente', (_id, track) => {
    const outline = buildTrackOutline(track, content.lessons, content.exercises, lessonIds);
    expect(outline.lessonCount).toBeGreaterThan(0);
  });

  it('no hay dos secciones con el mismo orden', () => {
    const orders = content.tracks.map((t) => t.data.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('las secciones sugeridas como prerrequisito existen', () => {
    const trackIds = new Set(content.tracks.map((t) => t.id));
    for (const track of content.tracks) {
      for (const prerequisite of track.data.prerequisites) expect(trackIds).toContain(prerequisite);
    }
  });

  it.each(content.lessons.map((l) => [l.id, l] as const))('la lección %s tiene ejercicios', (id) => {
    expect(content.exercises.get(id)?.length ?? 0).toBeGreaterThan(0);
  });

  it.each(content.lessons.map((l) => [l.id, l] as const))(
    'la lección %s solo recomienda libros del catálogo',
    (_id, lesson) => {
      for (const { book } of lesson.data.furtherReading) expect(bookIds).toContain(book);
    },
  );

  it('los ejercicios SQL usan datasets existentes', () => {
    for (const { name, exercise } of sqlExercises) {
      expect(content.datasets.has(exercise.dataset), `${name} usa el dataset "${exercise.dataset}"`).toBe(true);
    }
  });

  it('los textos de los ejercicios solo usan `código en línea` (no Markdown que no se renderiza)', () => {
    for (const { lessonId, exercise } of allExercises) {
      const texts = [exercise.prompt, ...('hints' in exercise ? exercise.hints : [])];
      if (exercise.type === 'quiz') texts.push(exercise.explanation, ...exercise.options);
      for (const text of texts) {
        // Lo que va entre comillas invertidas es código (p. ej. `2 ** 3`) y es válido.
        const prose = text.replace(/`[^`]*`/g, '');
        expect(prose, `${lessonId}#${exercise.id}: "${text}"`).not.toMatch(/\*\*|__|\[[^\]]+\]\(/);
      }
    }
  });

  it('los ids de libros del catálogo son únicos', () => {
    expect(bookIds.size).toBe(content.books.length);
  });
});

describe.skipIf(pythonExercises.length === 0)('ejercicios de Python', () => {
  let run: (request: PythonRequest) => RunResult;

  beforeAll(async () => {
    run = createPythonRunner(await loadPyodide());
  });

  it.each(pythonExercises)('$name: la solución pasa; el código inicial y los errores típicos no', ({ exercise }) => {
    const base = { language: 'python', mode: 'grade', tests: exercise.tests, stdin: exercise.stdin } as const;

    const solution = run({ ...base, code: exercise.solution });
    expect(solution.message).toBe('¡Todas las pruebas pasaron!');
    expect(solution.status).toBe('pass');

    const starter = run({ ...base, code: exercise.starterCode });
    expect(starter.status).not.toBe('pass');

    exercise.mistakes.forEach((mistake, i) => {
      const result = run({ ...base, code: mistake });
      expect(result.status, `El error típico #${i + 1} debería ser rechazado`).not.toBe('pass');
    });
  });
});

describe.skipIf(sqlExercises.length === 0)('ejercicios de SQL', () => {
  const sandbox = new SqlSandbox(createPgliteDatabase);
  afterAll(() => sandbox.close());

  it.each(sqlExercises)('$name: la solución pasa; el código inicial y los errores típicos no', async ({ exercise }) => {
    const dataset = content.datasets.get(exercise.dataset)!;
    const base = {
      language: 'sql',
      mode: 'grade',
      solution: exercise.solution,
      datasetSql: dataset.sql,
      checkQuery: exercise.checkQuery,
      ordered: exercise.ordered,
    } as const;

    const solution = await runSql({ ...base, code: exercise.solution }, sandbox);
    expect(solution.status).toBe('pass');
    expect(solution.table?.rows.length ?? 0).toBeGreaterThan(0);

    const starter = await runSql({ ...base, code: exercise.starterCode }, sandbox);
    expect(starter.status).not.toBe('pass');

    for (const [i, mistake] of exercise.mistakes.entries()) {
      const result = await runSql({ ...base, code: mistake }, sandbox);
      expect(result.status, `El error típico #${i + 1} debería ser rechazado`).not.toBe('pass');
    }
  });
});
