import { summarize } from '../../lib/progress/model';
import { useProgress } from '../../lib/progress/react';
import ProgressBar from '../progress/ProgressBar';

/** Progreso de la lección actual (lectura + ejercicios). */
export default function LessonProgress({ itemIds }: { itemIds: string[] }) {
  const summary = summarize(itemIds, useProgress());
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>Progreso de la lección</span>
        <span>
          {summary.completed}/{summary.total}
        </span>
      </div>
      <ProgressBar percent={summary.percent} label="Progreso de la lección" size="sm" />
    </div>
  );
}
