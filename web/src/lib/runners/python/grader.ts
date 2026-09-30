import type { PyodideAPI } from 'pyodide';
import type { PythonRequest, RunResult, RunStatus } from '../types';
import harness from './harness.py?raw';

interface HarnessResult {
  status: RunStatus;
  stdout: string;
  message: string;
}

type RunExercise = ((
  code: string,
  tests: string,
  stdin: unknown,
  mode: string,
) => {
  toJs(options: { dict_converter: typeof Object.fromEntries }): HarnessResult;
  destroy(): void;
}) & { destroy(): void };

/**
 * Prepara Pyodide con el arnés y devuelve una función que ejecuta peticiones.
 * Es independiente del Worker para poder probarse en Node con la misma lógica.
 */
export function createPythonRunner(pyodide: PyodideAPI): (request: PythonRequest) => RunResult {
  pyodide.runPython(harness);
  const runExercise = pyodide.globals.get('run_exercise') as RunExercise;

  return (request) => {
    const stdin = pyodide.toPy(request.stdin);
    try {
      const proxy = runExercise(request.code, request.tests, stdin, request.mode);
      try {
        const result = proxy.toJs({ dict_converter: Object.fromEntries });
        return { status: result.status, message: result.message, stdout: result.stdout };
      } finally {
        proxy.destroy();
      }
    } finally {
      (stdin as { destroy?: () => void }).destroy?.();
    }
  };
}
