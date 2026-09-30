import { summarize } from '../../lib/progress/model';
import { useProgress } from '../../lib/progress/react';
import ProgressBar from './ProgressBar';

interface Props {
  title: string;
  tagline: string;
  href: string;
  itemIds: string[];
  lessonCount: number;
  exerciseCount: number;
}

/** Tarjeta de una sección en el inicio, con el progreso del estudiante. */
export default function TrackCard({ title, tagline, href, itemIds, lessonCount, exerciseCount }: Props) {
  const summary = summarize(itemIds, useProgress());
  const action =
    summary.status === 'completed' ? 'Repasar' : summary.status === 'in_progress' ? 'Continuar' : 'Empezar';

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        <a href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
          {title}
        </a>
      </h3>
      <p className="mt-2 flex-1 text-slate-600 dark:text-slate-400">{tagline}</p>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {lessonCount} lecciones · {exerciseCount} ejercicios
      </p>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-brand-700 group-hover:underline dark:text-brand-300">{action} →</span>
          <span className="text-slate-500 dark:text-slate-400">{summary.percent}%</span>
        </div>
        <ProgressBar percent={summary.percent} label={`Progreso de ${title}`} size="sm" />
      </div>
    </article>
  );
}
