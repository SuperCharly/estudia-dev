import type { WorkerRequestMessage, WorkerResponseMessage } from '../../workers/protocol';
import type { RunRequest, RunResult } from './types';

/** Subconjunto de `Worker` que usamos (facilita los tests). */
export interface WorkerLike {
  postMessage(message: unknown): void;
  terminate(): void;
  addEventListener(type: 'message', listener: (event: MessageEvent<WorkerResponseMessage>) => void): void;
  addEventListener(type: 'error', listener: (event: ErrorEvent) => void): void;
}

export class RunTimeoutError extends Error {
  override name = 'RunTimeoutError';
}

export class RunnerLoadError extends Error {
  override name = 'RunnerLoadError';
}

interface RunnerOptions {
  /** Tiempo máximo de una ejecución, contado desde que el entorno está listo. */
  timeoutMs: number;
  /** Tiempo máximo para descargar e iniciar el entorno (Pyodide/PGlite). */
  loadTimeoutMs: number;
}

interface Pending {
  id: number;
  resolve: (result: RunResult) => void;
  reject: (error: Error) => void;
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * Envía peticiones a un worker, una a la vez. Si una ejecución supera el tiempo límite
 * (p. ej. un bucle infinito) termina el worker; el siguiente se crea al necesitarse.
 */
export class WorkerRunner<T extends RunRequest> {
  private worker: WorkerLike | null = null;
  private ready = false;
  private loadTimer: ReturnType<typeof setTimeout> | undefined;
  private pending: Pending | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private nextId = 1;

  constructor(
    private readonly createWorker: () => WorkerLike,
    private readonly options: RunnerOptions,
  ) {}

  /** Crea el worker por adelantado para que el primer "Ejecutar" sea más rápido. */
  warmUp(): void {
    this.getWorker();
  }

  run(request: T): Promise<RunResult> {
    const result = this.queue.then(() => this.send(request));
    this.queue = result.catch(() => undefined);
    return result;
  }

  dispose(): void {
    clearTimeout(this.loadTimer);
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
  }

  private getWorker(): WorkerLike {
    if (this.worker) return this.worker;
    const worker = this.createWorker();
    worker.addEventListener('message', (event) => this.onMessage(event.data));
    worker.addEventListener('error', (event) => {
      this.crash(new RunnerLoadError(event.message || 'El entorno de ejecución falló.'));
    });
    this.worker = worker;
    this.loadTimer = setTimeout(() => {
      this.crash(new RunnerLoadError('El entorno de ejecución tardó demasiado en cargar.'));
    }, this.options.loadTimeoutMs);
    return worker;
  }

  private send(request: T): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending = { id, resolve, reject };
      const worker = this.getWorker();
      if (this.ready) this.startTimer(this.pending);
      const message: WorkerRequestMessage<T> = { id, request };
      worker.postMessage(message);
    });
  }

  private startTimer(pending: Pending): void {
    pending.timer = setTimeout(() => {
      this.crash(new RunTimeoutError('La ejecución tardó demasiado y se detuvo.'));
    }, this.options.timeoutMs);
  }

  private onMessage(message: WorkerResponseMessage): void {
    if (message.type === 'ready') {
      clearTimeout(this.loadTimer);
      this.ready = true;
      if (this.pending) this.startTimer(this.pending);
      return;
    }
    if (message.type === 'init-error') {
      this.crash(new RunnerLoadError(message.error));
      return;
    }
    const pending = this.pending;
    if (!pending || pending.id !== message.id) return;
    clearTimeout(pending.timer);
    this.pending = null;
    if (message.ok) pending.resolve(message.result);
    else pending.reject(new Error(message.error));
  }

  /** Descarta el worker actual y rechaza la petición en curso. */
  private crash(error: Error): void {
    this.dispose();
    const pending = this.pending;
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending = null;
    pending.reject(error);
  }
}
