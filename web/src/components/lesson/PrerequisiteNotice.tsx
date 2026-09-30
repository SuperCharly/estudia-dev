import { summarize } from '../../lib/progress/model';
import { useProgress } from '../../lib/progress/react';

interface Prerequisite {
  title: string;
  href: string;
  itemIds: string[];
}

/**
 * Sugiere completar lecciones previas. Nunca bloquea: quien ya sabe el tema puede seguir.
 */
export default function PrerequisiteNotice({ prerequisites }: { prerequisites: Prerequisite[] }) {
  const snapshot = useProgress();
  const pending = prerequisites.filter((p) => summarize(p.itemIds, snapshot).status !== 'completed');
  if (pending.length === 0) return null;

  return (
    <aside
      aria-label="Lecciones recomendadas antes"
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
    >
      <p>
        <strong>Te recomendamos completar antes:</strong>{' '}
        {pending.map((p, i) => (
          <span key={p.href}>
            {i > 0 && ', '}
            <a href={p.href} className="font-medium underline">
              {p.title}
            </a>
          </span>
        ))}
        . Si ya dominas el tema, puedes continuar sin problema.
      </p>
    </aside>
  );
}
