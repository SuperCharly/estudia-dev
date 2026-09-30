import { describe, expect, it } from 'vitest';
import {
  EMPTY_SNAPSHOT,
  exerciseItemId,
  lessonReadItemId,
  markCompleted,
  markIncomplete,
  markStarted,
  mergeSnapshots,
  statusOf,
  summarize,
  type ProgressSnapshot,
} from './model';

describe('identificadores', () => {
  it('distingue lecciones y ejercicios', () => {
    expect(lessonReadItemId('python/01-a/01-b')).toBe('lesson:python/01-a/01-b');
    expect(exerciseItemId('python/01-a/01-b', 'hola')).toBe('exercise:python/01-a/01-b#hola');
  });
});

describe('transiciones', () => {
  it('inicia un ítem nuevo', () => {
    const next = markStarted(EMPTY_SNAPSHOT, 'a', 10);
    expect(next).toEqual({ a: { status: 'in_progress', updatedAt: 10 } });
  });

  it('no degrada un ítem completado al iniciarlo de nuevo', () => {
    const done = markCompleted(EMPTY_SNAPSHOT, 'a', 10);
    expect(markStarted(done, 'a', 20)).toBe(done);
  });

  it('devuelve la misma referencia si no hay cambios', () => {
    const done = markCompleted(EMPTY_SNAPSHOT, 'a', 10);
    expect(markCompleted(done, 'a', 20)).toBe(done);
    expect(markIncomplete(EMPTY_SNAPSHOT, 'a', 20)).toBe(EMPTY_SNAPSHOT);
  });

  it('permite desmarcar un ítem completado', () => {
    const done = markCompleted(EMPTY_SNAPSHOT, 'a', 10);
    expect(markIncomplete(done, 'a', 20).a).toEqual({ status: 'in_progress', updatedAt: 20 });
  });

  it('no muta el snapshot original', () => {
    const original: ProgressSnapshot = {};
    markCompleted(original, 'a', 1);
    expect(original).toEqual({});
  });
});

describe('summarize', () => {
  const snapshot: ProgressSnapshot = {
    a: { status: 'completed', updatedAt: 1 },
    b: { status: 'in_progress', updatedAt: 1 },
  };

  it('calcula total, completados y porcentaje', () => {
    expect(summarize(['a', 'b', 'c'], snapshot)).toEqual({
      total: 3,
      completed: 1,
      percent: 33,
      status: 'in_progress',
    });
  });

  it('marca completado solo cuando todos los ítems lo están', () => {
    expect(summarize(['a'], snapshot).status).toBe('completed');
    expect(summarize(['a', 'c'], snapshot).status).toBe('in_progress');
  });

  it('no inicia si ningún ítem se ha tocado', () => {
    expect(summarize(['c', 'd'], snapshot)).toMatchObject({ percent: 0, status: 'not_started' });
  });

  it('una lista vacía es 0 % y no iniciada', () => {
    expect(summarize([], snapshot)).toEqual({ total: 0, completed: 0, percent: 0, status: 'not_started' });
  });

  it('statusOf devuelve not_started para ítems desconocidos', () => {
    expect(statusOf(snapshot, 'zzz')).toBe('not_started');
  });
});

describe('mergeSnapshots', () => {
  it('gana el cambio más reciente', () => {
    const local: ProgressSnapshot = { a: { status: 'completed', updatedAt: 5 } };
    const remote: ProgressSnapshot = { a: { status: 'in_progress', updatedAt: 9 } };
    expect(mergeSnapshots(local, remote).a?.status).toBe('in_progress');
  });

  it('en empate gana el estado más avanzado, sin importar el orden', () => {
    const x: ProgressSnapshot = { a: { status: 'completed', updatedAt: 5 } };
    const y: ProgressSnapshot = { a: { status: 'in_progress', updatedAt: 5 } };
    expect(mergeSnapshots(x, y)).toEqual(mergeSnapshots(y, x));
    expect(mergeSnapshots(y, x).a?.status).toBe('completed');
  });

  it('une ítems presentes solo en uno de los lados', () => {
    const merged = mergeSnapshots(
      { a: { status: 'completed', updatedAt: 1 } },
      { b: { status: 'in_progress', updatedAt: 2 } },
    );
    expect(Object.keys(merged).sort()).toEqual(['a', 'b']);
  });
});
