import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkerRequestMessage, WorkerResponseMessage } from '../../workers/protocol';
import { RunnerLoadError, RunTimeoutError, WorkerRunner, type WorkerLike } from './client';
import type { PythonRequest } from './types';

/** Worker simulado: registra los mensajes y permite responder desde el test. */
class FakeWorker implements WorkerLike {
  sent: WorkerRequestMessage[] = [];
  terminated = false;
  private messageListeners: ((event: MessageEvent<WorkerResponseMessage>) => void)[] = [];
  private errorListeners: ((event: ErrorEvent) => void)[] = [];

  postMessage(message: unknown): void {
    this.sent.push(message as WorkerRequestMessage);
  }
  terminate(): void {
    this.terminated = true;
  }
  addEventListener(type: 'message' | 'error', listener: never): void {
    if (type === 'message') this.messageListeners.push(listener);
    else this.errorListeners.push(listener);
  }
  reply(message: WorkerResponseMessage): void {
    for (const l of this.messageListeners) l({ data: message } as MessageEvent<WorkerResponseMessage>);
  }
  crash(message: string): void {
    for (const l of this.errorListeners) l({ message } as ErrorEvent);
  }
}

const request: PythonRequest = { language: 'python', mode: 'run', code: 'print(1)', tests: '', stdin: [] };
const okResult = (id: number): WorkerResponseMessage => ({
  type: 'result',
  id,
  ok: true,
  result: { status: 'ok', message: '', stdout: '1\n' },
});

let workers: FakeWorker[];
let runner: WorkerRunner<PythonRequest>;

beforeEach(() => {
  vi.useFakeTimers();
  workers = [];
  runner = new WorkerRunner(
    () => {
      const w = new FakeWorker();
      workers.push(w);
      return w;
    },
    { timeoutMs: 1_000, loadTimeoutMs: 30_000 },
  );
});

afterEach(() => {
  vi.useRealTimers();
});

describe('WorkerRunner', () => {
  it('envía la petición y resuelve con la respuesta del worker', async () => {
    const promise = runner.run(request);
    await vi.waitFor(() => expect(workers[0]?.sent).toHaveLength(1));
    workers[0]!.reply({ type: 'ready' });
    workers[0]!.reply(okResult(workers[0]!.sent[0]!.id));
    await expect(promise).resolves.toMatchObject({ status: 'ok', stdout: '1\n' });
  });

  it('no cuenta el tiempo de carga como tiempo de ejecución', async () => {
    const promise = runner.run(request);
    await vi.waitFor(() => expect(workers[0]?.sent).toHaveLength(1));
    vi.advanceTimersByTime(10_000); // Descargando Pyodide en una conexión lenta.
    workers[0]!.reply({ type: 'ready' });
    workers[0]!.reply(okResult(workers[0]!.sent[0]!.id));
    await expect(promise).resolves.toMatchObject({ status: 'ok' });
  });

  it('termina el worker ante un bucle infinito y crea otro para la siguiente ejecución', async () => {
    runner.warmUp();
    workers[0]!.reply({ type: 'ready' });

    const hung = runner.run(request);
    await vi.waitFor(() => expect(workers[0]?.sent).toHaveLength(1));
    vi.advanceTimersByTime(1_001);
    await expect(hung).rejects.toBeInstanceOf(RunTimeoutError);
    expect(workers[0]!.terminated).toBe(true);

    const next = runner.run(request);
    await vi.waitFor(() => expect(workers).toHaveLength(2));
    workers[1]!.reply({ type: 'ready' });
    workers[1]!.reply(okResult(workers[1]!.sent[0]!.id));
    await expect(next).resolves.toMatchObject({ status: 'ok' });
  });

  it('procesa las peticiones de una en una', async () => {
    runner.warmUp();
    const worker = workers[0]!;
    worker.reply({ type: 'ready' });

    const first = runner.run(request);
    const second = runner.run(request);
    await vi.waitFor(() => expect(worker.sent).toHaveLength(1));

    worker.reply(okResult(worker.sent[0]!.id));
    await first;
    await vi.waitFor(() => expect(worker.sent).toHaveLength(2));
    worker.reply(okResult(worker.sent[1]!.id));
    await expect(second).resolves.toMatchObject({ status: 'ok' });
  });

  it('rechaza si el entorno no puede cargar', async () => {
    const promise = runner.run(request);
    await vi.waitFor(() => expect(workers[0]?.sent).toHaveLength(1));
    workers[0]!.reply({ type: 'init-error', error: 'sin red' });
    await expect(promise).rejects.toBeInstanceOf(RunnerLoadError);
  });

  it('rechaza si la carga excede su tiempo límite', async () => {
    const promise = runner.run(request);
    await vi.waitFor(() => expect(workers[0]?.sent).toHaveLength(1));
    vi.advanceTimersByTime(30_001);
    await expect(promise).rejects.toThrow('tardó demasiado en cargar');
  });

  it('rechaza si el worker falla', async () => {
    const promise = runner.run(request);
    await vi.waitFor(() => expect(workers[0]?.sent).toHaveLength(1));
    workers[0]!.crash('boom');
    await expect(promise).rejects.toThrow('boom');
  });

  it('propaga los errores internos reportados por el worker', async () => {
    const promise = runner.run(request);
    await vi.waitFor(() => expect(workers[0]?.sent).toHaveLength(1));
    workers[0]!.reply({ type: 'ready' });
    workers[0]!.reply({ type: 'result', id: workers[0]!.sent[0]!.id, ok: false, error: 'dataset roto' });
    await expect(promise).rejects.toThrow('dataset roto');
  });
});
