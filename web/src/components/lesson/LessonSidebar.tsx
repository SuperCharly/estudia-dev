import type { TrackOutline } from '../../lib/content/outline';
import { summarize } from '../../lib/progress/model';
import { useProgress } from '../../lib/progress/react';
import StatusIcon from '../progress/StatusIcon';

/** Índice lateral de la sección con el estado de cada lección. */
export default function LessonSidebar({
  outline,
  currentLessonId,
}: {
  outline: TrackOutline;
  currentLessonId: string;
}) {
  const snapshot = useProgress();

  return (
    <nav aria-label={`Lecciones de ${outline.title}`} className="space-y-6 text-sm">
      {outline.modules
        .filter((mod) => mod.lessons.length > 0)
        .map((mod) => (
          <div key={mod.id}>
            <p className="mb-2 font-semibold text-slate-900 dark:text-white">{mod.title}</p>
            <ol className="space-y-1">
              {mod.lessons.map((lesson) => {
                const current = lesson.id === currentLessonId;
                return (
                  <li key={lesson.id}>
                    <a
                      href={lesson.href}
                      aria-current={current ? 'page' : undefined}
                      className={[
                        'flex items-center gap-2 rounded-md px-2 py-1.5',
                        current
                          ? 'bg-brand-50 font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-100'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                      ].join(' ')}
                    >
                      <StatusIcon status={summarize(lesson.itemIds, snapshot).status} className="size-4" />
                      {lesson.title}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
    </nav>
  );
}
