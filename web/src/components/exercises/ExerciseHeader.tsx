import type { ProgressStatus } from '../../lib/progress/model';
import StatusIcon from '../progress/StatusIcon';

const DIFFICULTY: Record<1 | 2 | 3, { label: string; className: string }> = {
  1: { label: 'Fácil', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' },
  2: { label: 'Media', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' },
  3: { label: 'Difícil', className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200' },
};

interface Props {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  status: ProgressStatus;
  kind: string;
}

export default function ExerciseHeader({ id, title, difficulty, status, kind }: Props) {
  const level = DIFFICULTY[difficulty];
  return (
    <header className="flex flex-wrap items-center gap-2">
      <StatusIcon status={status} />
      <h3 id={id} className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${level.className}`}>{level.label}</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {kind}
      </span>
    </header>
  );
}
