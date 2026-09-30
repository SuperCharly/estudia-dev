import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, type Locator, type Page } from '@playwright/test';

/**
 * Fixture que falla el test si la página registra errores de JavaScript o violaciones de
 * la CSP: ambas señalan que algo no funcionará en producción.
 */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
      page.on('console', (message) => {
        const text = message.text();
        // El 404 del propio documento es esperado al probar la página 404; cualquier otro recurso no.
        if (text.startsWith('Failed to load resource') && message.location().url === page.url()) return;
        if (message.type() === 'error' || /Content Security Policy/i.test(text)) errors.push(`console: ${text}`);
      });
      await use(errors);
      expect(errors, 'La página no debe tener errores ni violaciones de CSP').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Audita la accesibilidad (WCAG 2.1 AA) de la página actual. */
export async function expectAccessible(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
  expect(summary).toEqual([]);
}

/** Reemplaza el contenido del editor CodeMirror de un ejercicio. */
export async function typeCode(page: Page, exerciseTitle: string, code: string): Promise<void> {
  const card = await openExercise(page, exerciseTitle);
  const editor = card.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Delete');
  // insertText no dispara el autocierre de paréntesis ni la autoindentación.
  await page.keyboard.insertText(code);
}

/** Tarjeta de un ejercicio (un <article> cuyo nombre accesible es su título). */
export function exercise(page: Page, title: string) {
  return page.getByRole('article', { name: title, exact: true });
}

/** Desplaza hasta el ejercicio y espera a que sea interactivo. */
export async function openExercise(page: Page, title: string) {
  const card = exercise(page, title);
  await card.scrollIntoViewIfNeeded();
  await waitForHydration(page, card);
  return card;
}

/** Espera a que la isla de Astro que contiene `target` esté hidratada (interactiva). */
export async function waitForHydration(page: Page, target: Locator): Promise<void> {
  // Astro quita el atributo `ssr` de la isla cuando termina de hidratarla.
  const island = page.locator('astro-island').filter({ has: target }).last();
  await expect(island).not.toHaveAttribute('ssr');
}
