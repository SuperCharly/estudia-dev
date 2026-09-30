/// <reference lib="webworker" />
/**
 * Ejecuta SQL (PostgreSQL vía PGlite) fuera del hilo principal. Ver python.worker.ts.
 */
import { runSql, SqlSandbox } from '../lib/runners/sql/grader';
import { createPgliteDatabase } from '../lib/runners/sql/pglite';
import type { SqlRequest } from '../lib/runners/types';
import { serveRequests } from './protocol';

const sandbox = new SqlSandbox(createPgliteDatabase);

// Iniciar Postgres tarda unos segundos: se hace en cuanto se crea el worker.
serveRequests<SqlRequest>(sandbox.warmUp(), (request) => runSql(request, sandbox));
