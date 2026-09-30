import { useId, useState, type SubmitEvent } from 'react';
import type { QuizExercise as Quiz } from '../../lib/content/schemas';
import { statusOf } from '../../lib/progress/model';
import { getProgressStore, useProgress } from '../../lib/progress/react';
import ExerciseHeader from './ExerciseHeader';
import InlineCode from './InlineCode';

export default function QuizExercise({ itemId, exercise }: { itemId: string; exercise: Quiz }) {
  const status = statusOf(useProgress(), itemId);
  const name = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<number | null>(null);

  const correct = checked !== null && checked === exercise.answer;
  const solved = correct || status === 'completed';

  function check(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (selected === null) return;
    setChecked(selected);
    const store = getProgressStore();
    if (selected === exercise.answer) store.markCompleted(itemId);
    else store.markStarted(itemId);
  }

  return (
    <article className="space-y-4" aria-labelledby={`${itemId}-title`}>
      <ExerciseHeader
        id={`${itemId}-title`}
        title={exercise.title}
        difficulty={exercise.difficulty}
        status={status}
        kind="Pregunta"
      />
      <form onSubmit={check} className="space-y-3">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-slate-700 dark:text-slate-300">
            <InlineCode text={exercise.prompt} />
          </legend>
          {exercise.options.map((option, i) => (
            <label
              key={i}
              className={[
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
                checked === i
                  ? correct
                    ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50'
                    : 'border-rose-400 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/50'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
              ].join(' ')}
            >
              <input
                type="radio"
                name={name}
                value={i}
                checked={selected === i}
                onChange={() => setSelected(i)}
                className="accent-brand-600"
              />
              <span className="font-mono text-sm">
                <InlineCode text={option} />
              </span>
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          disabled={selected === null}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          Comprobar respuesta
        </button>
      </form>
      <div aria-live="polite">
        {checked !== null && !correct && (
          <p className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100">
            No es correcto. Vuelve a intentarlo.
          </p>
        )}
        {solved && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100">
            <p className="font-medium">{correct ? '¡Correcto!' : 'Ya respondiste correctamente esta pregunta.'}</p>
            <p className="mt-1">
              <InlineCode text={exercise.explanation} />
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
