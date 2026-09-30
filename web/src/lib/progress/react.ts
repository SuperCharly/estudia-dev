import { useSyncExternalStore } from 'react';
import { EMPTY_SNAPSHOT, type ProgressSnapshot } from './model';
import { LocalProgressStore, type ProgressStore } from './store';

let store: ProgressStore | undefined;

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    // Acceder a localStorage lanza si el navegador bloquea los datos del sitio.
    return null;
  }
}

/** Instancia única del almacén en el navegador. */
export function getProgressStore(): ProgressStore {
  store ??= new LocalProgressStore({ storage: safeLocalStorage(), eventTarget: window });
  return store;
}

const noopUnsubscribe = () => {};

/**
 * Snapshot del progreso. En el servidor (y durante la hidratación) devuelve un
 * snapshot vacío para que el HTML generado coincida; luego se actualiza en el cliente.
 */
export function useProgress(): ProgressSnapshot {
  return useSyncExternalStore(
    (listener) => (typeof window === 'undefined' ? noopUnsubscribe : getProgressStore().subscribe(listener)),
    () => getProgressStore().getSnapshot(),
    () => EMPTY_SNAPSHOT,
  );
}
