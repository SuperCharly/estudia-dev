import { describe, expect, it, vi } from 'vitest';
import { LocalProgressStore, STORAGE_KEY, type KeyValueStorage } from './store';

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

describe('LocalProgressStore', () => {
  it('persiste los cambios y los recupera en una nueva instancia', () => {
    const storage = memoryStorage();
    const store = new LocalProgressStore({ storage, now: () => 42 });
    store.markCompleted('lesson:x');

    const reopened = new LocalProgressStore({ storage });
    expect(reopened.getSnapshot()).toEqual({ 'lesson:x': { status: 'completed', updatedAt: 42 } });
  });

  it('notifica a los suscriptores solo cuando algo cambia', () => {
    const store = new LocalProgressStore({ storage: memoryStorage() });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.markCompleted('a');
    store.markCompleted('a');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.markIncomplete('a');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('mantiene la misma referencia de snapshot si no hay cambios', () => {
    const store = new LocalProgressStore({ storage: memoryStorage() });
    const before = store.getSnapshot();
    store.markIncomplete('no-existe');
    expect(store.getSnapshot()).toBe(before);
  });

  it.each([
    ['JSON inválido', '{no es json'],
    ['estructura inesperada', JSON.stringify({ a: { status: 'hackeado', updatedAt: 'ayer' } })],
    ['tipo incorrecto', JSON.stringify(['a', 'b'])],
  ])('ignora datos corruptos (%s)', (_label, raw) => {
    const store = new LocalProgressStore({ storage: memoryStorage({ [STORAGE_KEY]: raw }) });
    expect(store.getSnapshot()).toEqual({});
  });

  it('funciona en memoria si el almacenamiento falla', () => {
    const failing: KeyValueStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {
        throw new Error('SecurityError');
      },
    };
    const store = new LocalProgressStore({ storage: failing });
    store.markCompleted('a');
    expect(store.getSnapshot().a?.status).toBe('completed');
    store.reset();
    expect(store.getSnapshot()).toEqual({});
  });

  it('funciona sin almacenamiento disponible', () => {
    const store = new LocalProgressStore({ storage: null });
    store.markStarted('a');
    expect(store.getSnapshot().a?.status).toBe('in_progress');
  });

  it('se sincroniza cuando otra pestaña cambia el progreso', () => {
    const storage = memoryStorage();
    const target = new EventTarget();
    const store = new LocalProgressStore({ storage, eventTarget: target as unknown as Window });
    const listener = vi.fn();
    store.subscribe(listener);

    storage.data.set(STORAGE_KEY, JSON.stringify({ b: { status: 'completed', updatedAt: 1 } }));
    const event = Object.assign(new Event('storage'), { key: STORAGE_KEY });
    target.dispatchEvent(event);

    expect(listener).toHaveBeenCalledOnce();
    expect(store.getSnapshot().b?.status).toBe('completed');
  });

  it('reset borra el progreso guardado', () => {
    const storage = memoryStorage();
    const store = new LocalProgressStore({ storage });
    store.markCompleted('a');
    store.reset();
    expect(storage.data.has(STORAGE_KEY)).toBe(false);
    expect(store.getSnapshot()).toEqual({});
  });
});
