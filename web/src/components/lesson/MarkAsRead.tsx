import { statusOf } from '../../lib/progress/model';
import { getProgressStore, useProgress } from '../../lib/progress/react';

/** Marca (o desmarca) la lectura de la lección como completada. */
export default function MarkAsRead({ itemId }: { itemId: string }) {
  const done = statusOf(useProgress(), itemId) === 'completed';

  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={() => {
        const store = getProgressStore();
        if (done) store.markIncomplete(itemId);
        else store.markCompleted(itemId);
      }}
      className={[
        'inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 font-medium transition-colors',
        done
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
      ].join(' ')}
    >
      <span aria-hidden="true">{done ? '✓' : '○'}</span>
      {done ? 'Lectura completada' : 'Marcar lectura como completada'}
    </button>
  );
}
