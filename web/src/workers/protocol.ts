import type { RunRequest, RunResult } from '../lib/runners/types';

/** Mensajes entre la página y los workers de ejecución. */
export interface WorkerRequestMessage<T extends RunRequest = RunRequest> {
  id: number;
  request: T;
}

export type WorkerResponseMessage =
  /** El entorno terminó de cargar: a partir de aquí corre el tiempo límite de ejecución. */
  | { type: 'ready' }
  | { type: 'init-error'; error: string }
  | { type: 'result'; id: number; ok: true; result: RunResult }
  | { type: 'result'; id: number; ok: false; error: string };

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * Atiende peticiones dentro de un worker. Avisa cuando `ready` se resuelve y reporta los
 * errores internos como mensajes, sin romper el worker.
 */
export function serveRequests<T extends RunRequest>(
  ready: Promise<unknown>,
  handle: (request: T) => Promise<RunResult> | RunResult,
): void {
  const scope = self as unknown as DedicatedWorkerGlobalScope;
  const post = (message: WorkerResponseMessage) => scope.postMessage(message);

  ready.then(
    () => post({ type: 'ready' }),
    (error: unknown) => post({ type: 'init-error', error: errorMessage(error) }),
  );

  scope.addEventListener('message', async (event: MessageEvent<WorkerRequestMessage<T>>) => {
    const { id, request } = event.data;
    try {
      await ready;
      post({ type: 'result', id, ok: true, result: await handle(request) });
    } catch (error) {
      post({ type: 'result', id, ok: false, error: errorMessage(error) });
    }
  });
}
