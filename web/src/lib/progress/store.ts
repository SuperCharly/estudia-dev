import {
  EMPTY_SNAPSHOT,
  markCompleted,
  markIncomplete,
  markStarted,
  progressSnapshotSchema,
  type ProgressSnapshot,
} from './model';

/**
 * Almacén de progreso. La UI solo depende de esta interfaz, de modo que la
 * implementación local puede reemplazarse (o combinarse) con una remota.
 *
 * `getSnapshot` es síncrono y devuelve siempre la misma referencia mientras no haya
 * cambios, como exige `useSyncExternalStore`.
 */
export interface ProgressStore {
  getSnapshot(): ProgressSnapshot;
  subscribe(listener: () => void): () => void;
  markStarted(itemId: string): void;
  markCompleted(itemId: string): void;
  markIncomplete(itemId: string): void;
  reset(): void;
}

/** Subconjunto de `Storage` que necesitamos (facilita los tests). */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const STORAGE_KEY = 'estudia-dev:progress:v1';

interface LocalStoreOptions {
  storage: KeyValueStorage | null;
  now?: () => number;
  /** Para sincronizar pestañas: suscribe a eventos `storage` de la ventana. */
  eventTarget?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
}

/**
 * Guarda el progreso en `localStorage`. Todo lo leído se valida: el almacenamiento del
 * navegador puede estar corrupto, ser de una versión anterior o haber sido editado.
 * Si el almacenamiento no está disponible (modo privado, bloqueado), funciona solo en
 * memoria sin romper la página.
 */
export class LocalProgressStore implements ProgressStore {
  private snapshot: ProgressSnapshot;
  private readonly listeners = new Set<() => void>();
  private readonly storage: KeyValueStorage | null;
  private readonly now: () => number;

  constructor({ storage, now = Date.now, eventTarget }: LocalStoreOptions) {
    this.storage = storage;
    this.now = now;
    this.snapshot = this.read();
    eventTarget?.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        this.snapshot = this.read();
        this.emit();
      }
    });
  }

  getSnapshot = (): ProgressSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  markStarted(itemId: string): void {
    this.update(markStarted(this.snapshot, itemId, this.now()));
  }

  markCompleted(itemId: string): void {
    this.update(markCompleted(this.snapshot, itemId, this.now()));
  }

  markIncomplete(itemId: string): void {
    this.update(markIncomplete(this.snapshot, itemId, this.now()));
  }

  reset(): void {
    try {
      this.storage?.removeItem(STORAGE_KEY);
    } catch {
      // Almacenamiento no disponible: el reinicio aplica solo en memoria.
    }
    this.snapshot = EMPTY_SNAPSHOT;
    this.emit();
  }

  private update(next: ProgressSnapshot): void {
    if (next === this.snapshot) return;
    this.snapshot = next;
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Cuota excedida o almacenamiento bloqueado: se conserva en memoria.
    }
    this.emit();
  }

  private read(): ProgressSnapshot {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return EMPTY_SNAPSHOT;
      const parsed = progressSnapshotSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : EMPTY_SNAPSHOT;
    } catch {
      return EMPTY_SNAPSHOT;
    }
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}
