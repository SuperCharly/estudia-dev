/// <reference lib="webworker" />
/**
 * Ejecuta Python (Pyodide) fuera del hilo principal: el código del estudiante no puede
 * tocar el DOM, las cookies ni bloquear la página. Si se cuelga (bucle infinito), el hilo
 * principal termina este worker y crea otro.
 */
import { loadPyodide } from 'pyodide';
import { createPythonRunner } from '../lib/runners/python/grader';
import type { PythonRequest } from '../lib/runners/types';
import { serveRequests } from './protocol';

// Los archivos de Pyodide se sirven desde el propio sitio (copiados por scripts/copy-pyodide.mjs).
const runner = loadPyodide({ indexURL: '/pyodide/' }).then(createPythonRunner);

serveRequests<PythonRequest>(runner, async (request) => (await runner)(request));
