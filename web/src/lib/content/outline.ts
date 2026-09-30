/**
 * Construye el "mapa" de una sección (módulos → lecciones → ítems de progreso) a partir
 * del contenido ya validado. Es puro y lanza errores descriptivos ante inconsistencias,
 * de modo que un contenido roto hace fallar el build en lugar de publicarse.
 */
import { exerciseItemId, lessonReadItemId } from '../progress/model';
import type { Exercise, LessonFrontmatter, Track } from './schemas';

export interface LessonOutline {
  id: string;
  trackId: string;
  moduleId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  href: string;
  /** Lectura de la lección + cada ejercicio. */
  itemIds: string[];
  exerciseCount: number;
}

export interface ModuleOutline {
  id: string;
  title: string;
  description: string;
  lessons: LessonOutline[];
  itemIds: string[];
}

export interface TrackOutline {
  id: string;
  title: string;
  tagline: string;
  href: string;
  modules: ModuleOutline[];
  itemIds: string[];
  lessonCount: number;
  exerciseCount: number;
}

interface Entry<T> {
  id: string;
  data: T;
}

export class ContentIntegrityError extends Error {
  override name = 'ContentIntegrityError';
}

/** `python/01-primeros-pasos/01-hola-python` → sus partes. */
export function parseLessonId(id: string): { trackId: string; moduleId: string; slug: string } {
  const parts = id.split('/');
  if (parts.length !== 3 || parts.some((p) => p.length === 0)) {
    throw new ContentIntegrityError(`Id de lección inválido "${id}": se esperaba "seccion/modulo/leccion".`);
  }
  const [trackId, moduleId, slug] = parts as [string, string, string];
  return { trackId, moduleId, slug };
}

export function lessonHref(lessonId: string): string {
  return `/${lessonId}/`;
}

export function lessonItemIds(lessonId: string, exercises: readonly Exercise[]): string[] {
  return [lessonReadItemId(lessonId), ...exercises.map((e) => exerciseItemId(lessonId, e.id))];
}

export function buildTrackOutline(
  track: Entry<Track>,
  lessons: readonly Entry<LessonFrontmatter>[],
  exercisesByLesson: ReadonlyMap<string, readonly Exercise[]>,
  allLessonIds: ReadonlySet<string>,
): TrackOutline {
  const moduleIds = new Set(track.data.modules.map((m) => m.id));
  const byModule = new Map<string, Entry<LessonFrontmatter>[]>();

  for (const lesson of lessons) {
    const { trackId, moduleId } = parseLessonId(lesson.id);
    if (trackId !== track.id) continue;
    if (!moduleIds.has(moduleId)) {
      throw new ContentIntegrityError(
        `La lección "${lesson.id}" está en el módulo "${moduleId}", que no aparece en content/${track.id}/_track.yaml.`,
      );
    }
    for (const prerequisite of lesson.data.prerequisites) {
      if (!allLessonIds.has(prerequisite)) {
        throw new ContentIntegrityError(
          `La lección "${lesson.id}" tiene como prerrequisito "${prerequisite}", que no existe.`,
        );
      }
    }
    const list = byModule.get(moduleId) ?? [];
    list.push(lesson);
    byModule.set(moduleId, list);
  }

  for (const lessonId of exercisesByLesson.keys()) {
    if (parseLessonId(lessonId).trackId === track.id && !lessons.some((l) => l.id === lessonId)) {
      throw new ContentIntegrityError(`Hay ejercicios para "${lessonId}" pero no existe su archivo .md.`);
    }
  }

  const modules: ModuleOutline[] = track.data.modules.map((mod) => {
    const moduleLessons = (byModule.get(mod.id) ?? [])
      .toSorted((a, b) => a.id.localeCompare(b.id))
      .map((lesson): LessonOutline => {
        const exercises = exercisesByLesson.get(lesson.id) ?? [];
        return {
          id: lesson.id,
          trackId: track.id,
          moduleId: mod.id,
          title: lesson.data.title,
          description: lesson.data.description,
          estimatedMinutes: lesson.data.estimatedMinutes,
          href: lessonHref(lesson.id),
          itemIds: lessonItemIds(lesson.id, exercises),
          exerciseCount: exercises.length,
        };
      });
    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      lessons: moduleLessons,
      itemIds: moduleLessons.flatMap((l) => l.itemIds),
    };
  });

  const allLessons = modules.flatMap((m) => m.lessons);
  return {
    id: track.id,
    title: track.data.title,
    tagline: track.data.tagline,
    href: `/${track.id}/`,
    modules,
    itemIds: modules.flatMap((m) => m.itemIds),
    lessonCount: allLessons.length,
    exerciseCount: allLessons.reduce((sum, l) => sum + l.exerciseCount, 0),
  };
}

/** Lecciones anterior y siguiente dentro de la sección (cruzando módulos). */
export function findNeighbors(
  outline: TrackOutline,
  lessonId: string,
): { previous?: LessonOutline; next?: LessonOutline } {
  const lessons = outline.modules.flatMap((m) => m.lessons);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) return {};
  return { previous: lessons[index - 1], next: lessons[index + 1] };
}
