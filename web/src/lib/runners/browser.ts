/** Runners del navegador: un worker por lenguaje, compartido por todos los ejercicios de la página. */
import { WorkerRunner } from './client';
import type { PythonRequest, SqlRequest } from './types';

let python: WorkerRunner<PythonRequest> | undefined;
let sql: WorkerRunner<SqlRequest> | undefined;

// Pyodide y PGlite se descargan una sola vez (~10 MB); en conexiones lentas puede tardar.
const LOAD_TIMEOUT_MS = 120_000;

export function getPythonRunner(): WorkerRunner<PythonRequest> {
  python ??= new WorkerRunner(
    () => new Worker(new URL('../../workers/python.worker.ts', import.meta.url), { type: 'module' }),
    { timeoutMs: 8_000, loadTimeoutMs: LOAD_TIMEOUT_MS },
  );
  return python;
}

export function getSqlRunner(): WorkerRunner<SqlRequest> {
  sql ??= new WorkerRunner(
    () => new Worker(new URL('../../workers/sql.worker.ts', import.meta.url), { type: 'module' }),
    // Incluye margen por si hay que reiniciar Postgres tras un COMMIT del estudiante.
    { timeoutMs: 15_000, loadTimeoutMs: LOAD_TIMEOUT_MS },
  );
  return sql;
}
