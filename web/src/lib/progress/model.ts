/**
 * Modelo de progreso: independiente de dónde se guarde (localStorage hoy, Supabase después).
 *
 * Un "ítem" es cualquier cosa que el estudiante puede completar: la lectura de una
 * lección o un ejercicio. Las lecciones, módulos y secciones calculan su progreso a
 * partir de sus ítems.
 */
import { z } from 'astro/zod';

export const PROGRESS_STATUSES = ['in_progress', 'completed'] as const;
export type ProgressStatus = 'not_started' | (typeof PROGRESS_STATUSES)[number];

export const itemProgressSchema = z.object({
  status: z.enum(PROGRESS_STATUSES),
  /** Epoch en milisegundos del último cambio. Se usa para fusionar progresos. */
  updatedAt: z.number().int().nonnegative(),
});
export type ItemProgress = z.infer<typeof itemProgressSchema>;

/** Solo se guardan los ítems iniciados; los ausentes están en `not_started`. */
export const progressSnapshotSchema = z.record(z.string().min(1).max(200), itemProgressSchema);
export type ProgressSnapshot = Readonly<Record<string, ItemProgress>>;

export const EMPTY_SNAPSHOT: ProgressSnapshot = Object.freeze({});

// ---------------------------------------------------------------------------
// Identificadores de ítems
// ---------------------------------------------------------------------------

/** `lesson:python/01-primeros-pasos/01-hola-python` */
export function lessonReadItemId(lessonId: string): string {
  return `lesson:${lessonId}`;
}

/** `exercise:python/01-primeros-pasos/01-hola-python#imprimir-saludo` */
export function exerciseItemId(lessonId: string, exerciseId: string): string {
  return `exercise:${lessonId}#${exerciseId}`;
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

export function statusOf(snapshot: ProgressSnapshot, itemId: string): ProgressStatus {
  return snapshot[itemId]?.status ?? 'not_started';
}

export interface ProgressSummary {
  total: number;
  completed: number;
  /** Porcentaje entero 0–100. */
  percent: number;
  status: ProgressStatus;
}

export function summarize(itemIds: readonly string[], snapshot: ProgressSnapshot): ProgressSummary {
  const total = itemIds.length;
  let completed = 0;
  let started = 0;
  for (const id of itemIds) {
    const status = statusOf(snapshot, id);
    if (status === 'completed') completed++;
    if (status !== 'not_started') started++;
  }
  const percent = total === 0 ? 0 : Math.floor((completed / total) * 100);
  let status: ProgressStatus = 'not_started';
  if (total > 0 && completed === total) status = 'completed';
  else if (started > 0) status = 'in_progress';
  return { total, completed, percent, status };
}

// ---------------------------------------------------------------------------
// Transiciones (puras: devuelven un snapshot nuevo o el mismo si no hay cambio)
// ---------------------------------------------------------------------------

/** Marca un ítem como iniciado. No degrada un ítem ya completado. */
export function markStarted(snapshot: ProgressSnapshot, itemId: string, now: number): ProgressSnapshot {
  if (snapshot[itemId]) return snapshot;
  return { ...snapshot, [itemId]: { status: 'in_progress', updatedAt: now } };
}

export function markCompleted(snapshot: ProgressSnapshot, itemId: string, now: number): ProgressSnapshot {
  if (snapshot[itemId]?.status === 'completed') return snapshot;
  return { ...snapshot, [itemId]: { status: 'completed', updatedAt: now } };
}

/** Desmarca un ítem completado manualmente (p. ej. "marcar como no leída"). */
export function markIncomplete(snapshot: ProgressSnapshot, itemId: string, now: number): ProgressSnapshot {
  if (snapshot[itemId]?.status !== 'completed') return snapshot;
  return { ...snapshot, [itemId]: { status: 'in_progress', updatedAt: now } };
}

// ---------------------------------------------------------------------------
// Fusión (progreso local + progreso de la cuenta)
// ---------------------------------------------------------------------------

const STATUS_RANK: Record<ProgressStatus, number> = { not_started: 0, in_progress: 1, completed: 2 };

/**
 * Fusiona dos snapshots ítem por ítem: gana el cambio más reciente; en empate, el
 * estado más avanzado. Es conmutativa, de modo que el orden de sincronización no importa.
 */
export function mergeSnapshots(a: ProgressSnapshot, b: ProgressSnapshot): ProgressSnapshot {
  const merged: Record<string, ItemProgress> = { ...a };
  for (const [id, incoming] of Object.entries(b)) {
    const current = merged[id];
    if (
      !current ||
      incoming.updatedAt > current.updatedAt ||
      (incoming.updatedAt === current.updatedAt && STATUS_RANK[incoming.status] > STATUS_RANK[current.status])
    ) {
      merged[id] = incoming;
    }
  }
  return merged;
}
