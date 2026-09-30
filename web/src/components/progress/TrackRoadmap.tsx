import type { TrackOutline } from '../../lib/content/outline';
import { summarize } from '../../lib/progress/model';
import { useProgress } from '../../lib/progress/react';
import ProgressBar from './ProgressBar';
import StatusIcon from './StatusIcon';

/** Mapa de la sección: progreso global, "continuar" y módulos con sus lecciones. */
export default function TrackRoadmap({ outline }: { outline: TrackOutline }) {
  const snapshot = useProgress();
  const total = summarize(outline.itemIds, snapshot);
  const lessons = outline.modules.flatMap((m) => m.lessons);
  const nextLesson = lessons.find((l) => summarize(l.itemIds, snapshot).status !== 'completed');

  return (
    <div className="space-y-10">
      <section
        aria-labelledby="tu-progreso"
        className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-2">
            <h2 id="tu-progreso" className="font-semibold text-slate-900 dark:text-white">
              Tu progreso: {total.percent}%
            </h2>
            <ProgressBar percent={total.percent} label={`Progreso de ${outline.title}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {total.completed} de {total.total} actividades completadas
            </p>
          </div>
          {nextLesson ? (
            <a
              href={nextLesson.href}
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              {total.status === 'not_started' ? 'Empezar' : 'Continuar'}: {nextLesson.title}
            </a>
          ) : (
            lessons.length > 0 && (
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                ¡Completaste todas las lecciones disponibles! 🎉
              </p>
            )
          )}
        </div>
      </section>

      <ol className="space-y-6">
        {outline.modules.map((mod, index) => {
          const moduleSummary = summarize(mod.itemIds, snapshot);
          const headingId = `modulo-${mod.id}`;
          return (
            <li key={mod.id}>
              <section
                aria-labelledby={headingId}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Módulo {index + 1}</p>
                    <h2 id={headingId} className="text-xl font-bold text-slate-900 dark:text-white">
                      {mod.title}
                    </h2>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">{mod.description}</p>
                  </div>
                  {mod.lessons.length === 0 ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Próximamente
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">{moduleSummary.percent}%</span>
                  )}
                </div>

                {mod.lessons.length > 0 && (
                  <>
                    <div className="mt-4">
                      <ProgressBar
                        percent={moduleSummary.percent}
                        label={`Progreso del módulo ${mod.title}`}
                        size="sm"
                      />
                    </div>
                    <ol className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <a
                            href={lesson.href}
                            className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-900"
                          >
                            <StatusIcon status={summarize(lesson.itemIds, snapshot).status} />
                            <span className="flex-1 font-medium text-slate-800 dark:text-slate-100">
                              {lesson.title}
                            </span>
                            <span className="hidden text-sm text-slate-500 sm:inline dark:text-slate-400">
                              {lesson.estimatedMinutes} min · {lesson.exerciseCount} ejercicios
                            </span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </section>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
