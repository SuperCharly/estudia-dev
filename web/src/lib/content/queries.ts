/** Acceso al contenido desde las páginas (solo en el servidor / build). */
import { getCollection, type CollectionEntry } from 'astro:content';
import { buildTrackOutline, type TrackOutline } from './outline';
import type { Exercise } from './schemas';

export async function getSortedTracks(): Promise<CollectionEntry<'tracks'>[]> {
  return (await getCollection('tracks')).toSorted((a, b) => a.data.order - b.data.order);
}

export async function getExercisesByLesson(): Promise<Map<string, Exercise[]>> {
  const files = await getCollection('exercises');
  return new Map(files.map((file) => [file.id, file.data.exercises]));
}

export async function getTrackOutlines(): Promise<TrackOutline[]> {
  const [tracks, lessons, exercisesByLesson] = await Promise.all([
    getSortedTracks(),
    getCollection('lessons'),
    getExercisesByLesson(),
  ]);
  const allLessonIds = new Set(lessons.map((l) => l.id));
  // El esquema de Astro sustituye `book` por una referencia; el outline no la necesita.
  const plainLessons = lessons.map((l) => ({ id: l.id, data: { ...l.data, furtherReading: [] } }));
  return tracks.map((track) => buildTrackOutline(track, plainLessons, exercisesByLesson, allLessonIds));
}

export async function getTrackOutline(trackId: string): Promise<TrackOutline> {
  const outline = (await getTrackOutlines()).find((t) => t.id === trackId);
  if (!outline) throw new Error(`No existe la sección "${trackId}".`);
  return outline;
}
