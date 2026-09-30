import { useState } from 'react';
import type { ManualExercise as Manual } from '../../lib/content/schemas';
import { statusOf } from '../../lib/progress/model';
import { getProgressStore, useProgress } from '../../lib/progress/react';
import ExerciseHeader from './ExerciseHeader';
import InlineCode from './InlineCode';

/** Ejercicio abierto (p. ej. mini-proyecto): el estudiante revisa una lista y lo marca. */
export default function ManualExercise({ itemId, exercise }: { itemId: string; exercise: Manual }) {
  const status = statusOf(useProgress(), itemId);
  const done = status === 'completed';
  const [checks, setChecks] = useState<boolean[]>(() => exercise.checklist.map(() => false));
  const ready = done || checks.every(Boolean);

  function toggle(): void {
    const store = getProgressStore();
    if (done) store.markIncomplete(itemId);
    else store.markCompleted(itemId);
  }

  return (
    <article className="space-y-4" aria-labelledby={`${itemId}-title`}>
      <ExerciseHeader
        id={`${itemId}-title`}
        title={exercise.title}
        difficulty={exercise.difficulty}
        status={status}
        kind="Proyecto"
      />
      <p className="text-slate-700 dark:text-slate-300">
        <InlineCode text={exercise.prompt} />
      </p>
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium">Antes de marcarlo como completado, verifica que:</legend>
        {exercise.checklist.map((item, i) => (
          <label key={i} className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={done || checks[i]}
              disabled={done}
              onChange={(e) => setChecks((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
              className="mt-1 accent-brand-600"
            />
            <span>
              <InlineCode text={item} />
            </span>
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        onClick={toggle}
        disabled={!ready}
        aria-pressed={done}
        className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {done ? 'Marcar como pendiente' : 'Marcar como completado'}
      </button>
    </article>
  );
}
