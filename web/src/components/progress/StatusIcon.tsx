import type { ProgressStatus } from '../../lib/progress/model';

const LABELS: Record<ProgressStatus, string> = {
  not_started: 'Sin empezar',
  in_progress: 'En progreso',
  completed: 'Completado',
};

/** Icono de estado con texto alternativo para lectores de pantalla. */
export default function StatusIcon({ status, className = 'size-5' }: { status: ProgressStatus; className?: string }) {
  return (
    <span className={`inline-grid shrink-0 place-items-center ${className}`} title={LABELS[status]}>
      <span className="sr-only">{LABELS[status]}</span>
      {status === 'completed' ? (
        <svg viewBox="0 0 20 20" className="size-full text-emerald-600 dark:text-emerald-400" aria-hidden="true">
          <circle cx="10" cy="10" r="9" fill="currentColor" />
          <path
            d="m6 10.5 2.5 2.5L14 7.5"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : status === 'in_progress' ? (
        <svg viewBox="0 0 20 20" className="size-full text-amber-500" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M10 2a8 8 0 0 1 0 16Z" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="size-full text-slate-300 dark:text-slate-600" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
    </span>
  );
}
