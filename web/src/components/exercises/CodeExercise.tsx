import { useEffect, useRef, useState } from 'react';
import type { Dataset, PythonExercise, SqlExercise } from '../../lib/content/schemas';
import { clearDraft, loadDraft, saveDraft } from '../../lib/progress/drafts';
import { statusOf } from '../../lib/progress/model';
import { getProgressStore, useProgress } from '../../lib/progress/react';
import { RunnerLoadError, RunTimeoutError } from '../../lib/runners/client';
import { getPythonRunner, getSqlRunner } from '../../lib/runners/browser';
import type { RunMode, RunResult } from '../../lib/runners/types';
import ExerciseHeader from './ExerciseHeader';
import CodeEditor from './CodeEditor';
import InlineCode from './InlineCode';
import ResultTable from './ResultTable';

interface Props {
  itemId: string;
  exercise: PythonExercise | SqlExercise;
  dataset?: Dataset;
}

type Phase = 'idle' | 'busy';

const RESULT_STYLES: Record<RunResult['status'], string> = {
  pass: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100',
  fail: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100',
  error: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100',
  ok: 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
};

function describeRunnerError(error: unknown): RunResult {
  if (error instanceof RunTimeoutError) {
    return {
      status: 'error',
      message: 'Tu código tardó demasiado y se detuvo. ¿Hay algún bucle que nunca termina?',
    };
  }
  if (error instanceof RunnerLoadError) {
    return {
      status: 'error',
      message: 'No se pudo cargar el entorno de ejecución. Revisa tu conexión y vuelve a intentarlo.',
    };
  }
  return { status: 'error', message: 'Ocurrió un error inesperado al ejecutar tu código. Inténtalo de nuevo.' };
}

export default function CodeExercise({ itemId, exercise, dataset }: Props) {
  const status = statusOf(useProgress(), itemId);
  // Contenido con el que se monta el editor. El código no forma parte del HTML del servidor
  // (el editor se monta en el cliente), así que leer el borrador aquí no afecta la hidratación.
  const [editorSeed, setEditorSeed] = useState(() => ({
    key: 0,
    code: typeof window === 'undefined' ? exercise.starterCode : (loadDraft(itemId) ?? exercise.starterCode),
  }));
  // El texto actual vive en una ref que se actualiza en cada cambio del editor: así "Comprobar"
  // siempre evalúa lo último que se escribió, aunque React no haya vuelto a renderizar.
  const code = useRef(editorSeed.code);
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<RunResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  // Descarga el entorno de ejecución en cuanto el ejercicio es visible.
  useEffect(() => {
    (exercise.type === 'python' ? getPythonRunner() : getSqlRunner()).warmUp();
  }, [exercise.type]);

  function updateCode(next: string): void {
    code.current = next;
    saveDraft(itemId, next);
  }

  function reset(): void {
    code.current = exercise.starterCode;
    clearDraft(itemId);
    // Una `key` nueva vuelve a montar el editor con el código inicial.
    setEditorSeed((seed) => ({ key: seed.key + 1, code: exercise.starterCode }));
    setResult(null);
  }

  async function execute(mode: RunMode): Promise<void> {
    if (phase === 'busy') return;
    setPhase('busy');
    setResult(null);
    const store = getProgressStore();
    store.markStarted(itemId);
    try {
      const outcome =
        exercise.type === 'python'
          ? await getPythonRunner().run({
              language: 'python',
              mode,
              code: code.current,
              tests: exercise.tests,
              stdin: exercise.stdin,
            })
          : await getSqlRunner().run({
              language: 'sql',
              mode,
              code: code.current,
              solution: exercise.solution,
              datasetSql: dataset?.sql ?? '',
              verificationSql: dataset?.verificationSql,
              checkQuery: exercise.checkQuery,
              ordered: exercise.ordered,
            });
      setResult(outcome);
      if (mode === 'grade') {
        setAttempts((n) => n + 1);
        if (outcome.status === 'pass') store.markCompleted(itemId);
      }
    } catch (error) {
      setResult(describeRunnerError(error));
    } finally {
      setPhase('idle');
    }
  }

  const busy = phase === 'busy';
  const canSeeSolution = attempts > 0 || hintsShown === exercise.hints.length || status === 'completed';

  return (
    <article className="space-y-4" aria-labelledby={`${itemId}-title`}>
      <ExerciseHeader
        id={`${itemId}-title`}
        title={exercise.title}
        difficulty={exercise.difficulty}
        status={status}
        kind={exercise.type === 'python' ? 'Python' : 'SQL'}
      />
      <p className="text-slate-700 dark:text-slate-300">
        <InlineCode text={exercise.prompt} />
      </p>

      {dataset && (
        <details className="rounded-lg border border-slate-200 text-sm dark:border-slate-700">
          <summary className="cursor-pointer px-3 py-2 font-medium">Ver tablas del ejercicio ({dataset.title})</summary>
          <div className="space-y-2 border-t border-slate-200 p-3 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400">
              <InlineCode text={dataset.description} />
            </p>
            {dataset.verificationSql && (
              <p className="text-slate-600 dark:text-slate-400">
                Al comprobar, tu consulta también se ejecuta con otros datos de prueba que tienen las mismas tablas. Así
                se verifica que resuelva el problema en general, no solo con estos datos.
              </p>
            )}
            <pre
              tabIndex={0}
              className="max-h-72 overflow-auto rounded bg-slate-900 p-3 font-mono text-xs text-slate-100"
            >
              {dataset.sql}
            </pre>
          </div>
        </details>
      )}

      <CodeEditor
        key={editorSeed.key}
        initialValue={editorSeed.code}
        language={exercise.type}
        onChange={updateCode}
        onRun={() => void execute('run')}
        label={`Editor de código: ${exercise.title}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void execute('grade')}
          disabled={busy}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          Comprobar
        </button>
        <button
          type="button"
          onClick={() => void execute('run')}
          disabled={busy}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Ejecutar <span className="hidden text-xs text-slate-500 sm:inline">(Ctrl + Enter)</span>
        </button>
        {exercise.hints.length > 0 && (
          <button
            type="button"
            onClick={() => setHintsShown((n) => Math.min(n + 1, exercise.hints.length))}
            disabled={hintsShown === exercise.hints.length}
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50 dark:text-brand-300 dark:hover:bg-brand-900/30"
          >
            Pista ({hintsShown}/{exercise.hints.length})
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowSolution((s) => !s)}
          disabled={!canSeeSolution}
          title={canSeeSolution ? undefined : 'Disponible después de tu primer intento'}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {showSolution ? 'Ocultar solución' : 'Ver solución'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="ml-auto rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Restablecer código
        </button>
      </div>

      {hintsShown > 0 && (
        <ol className="list-decimal space-y-1 rounded-lg bg-brand-50 py-3 pr-3 pl-8 text-sm text-brand-900 dark:bg-brand-900/30 dark:text-brand-100">
          {exercise.hints.slice(0, hintsShown).map((hint, i) => (
            <li key={i}>
              <InlineCode text={hint} />
            </li>
          ))}
        </ol>
      )}

      {showSolution && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Solución de referencia</p>
          <pre tabIndex={0} className="overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-sm text-slate-100">
            {exercise.solution}
          </pre>
          <p className="text-xs text-slate-500">Puede haber otras soluciones correctas.</p>
        </div>
      )}

      <div aria-live="polite" className="space-y-3">
        {busy && <p className="text-sm text-slate-600 dark:text-slate-400">Ejecutando…</p>}
        {result && (
          <div className={`space-y-3 rounded-lg border p-3 ${RESULT_STYLES[result.status]}`}>
            {result.message && <p className="font-medium">{result.message}</p>}
            {result.stdout !== undefined && (
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide uppercase opacity-70">Salida</p>
                <pre
                  tabIndex={0}
                  className="max-h-64 overflow-auto rounded bg-slate-900 p-3 font-mono text-sm whitespace-pre-wrap text-slate-100"
                >
                  {result.stdout || '(tu programa no mostró nada)'}
                </pre>
              </div>
            )}
            {result.table && <ResultTable table={result.table} />}
          </div>
        )}
      </div>
    </article>
  );
}
