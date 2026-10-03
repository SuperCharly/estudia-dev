import { expect, expectAccessible, test } from './fixtures';

test.describe('navegación', () => {
  test('el inicio muestra las rutas y es accesible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Aprende a programar');
    await expect(page.getByRole('heading', { name: 'Python', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SQL', level: 3 })).toBeVisible();
    await expectAccessible(page);
  });

  test('se llega a una lección desde el inicio', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Python', exact: true }).first().click();
    await expect(page).toHaveURL(/\/python\/$/);
    await expect(page.getByRole('heading', { name: 'Primeros pasos' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Errores y módulos' })).toBeVisible();
    // Todos los módulos de la ruta tienen contenido.
    await expect(page.getByText('Próximamente')).toHaveCount(0);
    await expectAccessible(page);

    await page.getByRole('link', { name: /Empezar: Hola, Python/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, Python' })).toBeVisible();
  });

  test('la lección es accesible y enlaza a sus fuentes y a la siguiente lección', async ({ page }) => {
    await page.goto('/sql/01-consultas-basicas/01-select/');
    await expect(page.getByRole('heading', { name: 'Fuentes oficiales' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Apuntes básicos de SQL' })).toHaveAttribute(
      'href',
      'https://librosgratis.dev/leer/sql-apuntes-basicos/',
    );
    await expect(page.getByRole('link', { name: /Siguiente.*Filtrar filas con WHERE/ })).toBeVisible();
    await expectAccessible(page);
  });

  test('el tema oscuro se conserva al navegar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.goto('/python/');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expectAccessible(page);
  });

  test('las rutas inexistentes muestran la página 404', async ({ page }) => {
    await page.goto('/no-existe/');
    await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
  });
});
