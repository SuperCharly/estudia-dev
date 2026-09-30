/** Borradores del código de cada ejercicio, para no perder el trabajo al recargar. */

const PREFIX = 'estudia-dev:draft:v1:';
/** Límite de tamaño de un borrador: evita llenar el almacenamiento con código enorme. */
const MAX_DRAFT_LENGTH = 50_000;

export function loadDraft(itemId: string): string | null {
  try {
    return localStorage.getItem(PREFIX + itemId);
  } catch {
    return null;
  }
}

export function saveDraft(itemId: string, code: string): void {
  if (code.length > MAX_DRAFT_LENGTH) return;
  try {
    localStorage.setItem(PREFIX + itemId, code);
  } catch {
    // Almacenamiento lleno o bloqueado: el borrador simplemente no se guarda.
  }
}

export function clearDraft(itemId: string): void {
  try {
    localStorage.removeItem(PREFIX + itemId);
  } catch {
    // Nada que limpiar.
  }
}
