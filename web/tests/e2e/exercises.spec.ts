import { expect, expectAccessible, openExercise, test, typeCode, waitForHydration } from './fixtures';

const PYTHON_LESSON = '/python/01-primeros-pasos/01-hola-python/';
const SQL_LESSON = '/sql/01-consultas-basicas/02-filtrar-con-where/';

test.describe('ejercicios de Python', () => {
  test('resolver un ejercicio lo marca como completado y persiste al recargar', async ({ page }) => {
    await page.goto(PYTHON_LESSON);
    const card = await openExercise(page, 'Tu primer saludo');

    await typeCode(page, 'Tu primer saludo', 'print("Hola mundo")');
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText(/Se esperaba 'Hola, mundo'/)).toBeVisible();
    await expect(card.getByText('En progreso').first()).toBeAttached();

    await typeCode(page, 'Tu primer saludo', 'print("Hola, mundo")');
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText('¡Todas las pruebas pasaron!')).toBeVisible();
    await expect(card.getByText('Completado').first()).toBeAttached();

    const progress = page.getByRole('progressbar', { name: 'Progreso de la lección' });
    await expect(progress).toHaveAttribute('value', '20'); // 1 de 5 actividades

    await page.reload();
    await expect(progress).toHaveAttribute('value', '20');
    // El borrador del código también se conserva.
    const reloaded = await openExercise(page, 'Tu primer saludo');
    await expect(reloaded.locator('.cm-content')).toContainText('print("Hola, mundo")');
  });

  test('un bucle infinito se detiene y el editor sigue funcionando', async ({ page }) => {
    await page.goto(PYTHON_LESSON);
    const card = await openExercise(page, 'Tu primer saludo');

    await typeCode(page, 'Tu primer saludo', 'while True:\n    pass');
    await card.getByRole('button', { name: 'Ejecutar' }).click();
    await expect(card.getByText(/tardó demasiado/)).toBeVisible({ timeout: 60_000 });

    await typeCode(page, 'Tu primer saludo', 'print("sigo vivo")');
    await card.getByRole('button', { name: 'Ejecutar' }).click();
    await expect(card.getByText('sigo vivo')).toBeVisible();
  });

  test('los errores muestran el tipo y la línea', async ({ page }) => {
    await page.goto(PYTHON_LESSON);
    const card = await openExercise(page, 'Tu primer saludo');
    await typeCode(page, 'Tu primer saludo', 'x = 1\nprint(y)');
    await card.getByRole('button', { name: 'Ejecutar' }).click();
    await expect(card.getByText(/NameError.*línea 2/)).toBeVisible();
  });

  test('las pistas se revelan una a una y la solución tras un intento', async ({ page }) => {
    await page.goto(PYTHON_LESSON);
    const card = await openExercise(page, 'Tu primer saludo');
    const solution = card.getByRole('button', { name: 'Ver solución' });

    await expect(solution).toBeDisabled();
    await card.getByRole('button', { name: 'Pista (0/3)' }).click();
    await expect(card.getByText('Usa la función')).toBeVisible();
    await expect(card.getByRole('button', { name: 'Pista (1/3)' })).toBeVisible();

    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(solution).toBeEnabled();
    await solution.click();
    await expect(card.getByText('Solución de referencia')).toBeVisible();
  });

  test('restablecer vuelve al código inicial y borra el borrador', async ({ page }) => {
    await page.goto('/python/01-primeros-pasos/02-variables-y-tipos/');
    const card = await openExercise(page, 'Actualiza un contador');
    const editor = card.locator('.cm-content');

    await typeCode(page, 'Actualiza un contador', 'visitas = 0');
    await card.getByRole('button', { name: 'Restablecer código' }).click();
    await expect(editor).toContainText('visitas = 100');
    await expect(editor).toContainText('# Actualiza visitas y muéstrala');

    await page.reload();
    await expect((await openExercise(page, 'Actualiza un contador')).locator('.cm-content')).toContainText(
      'visitas = 100',
    );
  });

  test('las entradas de input() se simulan', async ({ page }) => {
    await page.goto('/python/01-primeros-pasos/04-entrada-y-conversion/');
    const card = await openExercise(page, 'Suma de dos números');
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText(/Se esperaba 42 y se mostró '834'/)).toBeVisible();
  });
});

test.describe('ejercicios de SQL', () => {
  test('una consulta correcta se aprueba y muestra la tabla', async ({ page }) => {
    await page.goto(SQL_LESSON);
    const card = await openExercise(page, 'Clientes sin ciudad');

    await card.getByRole('button', { name: 'Ejecutar' }).click();
    await expect(card.getByText('La consulta no devolvió filas.')).toBeVisible();

    await typeCode(page, 'Clientes sin ciudad', 'SELECT nombre FROM clientes WHERE ciudad IS NULL;');
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText('¡Correcto!')).toBeVisible();
    await expect(card.getByRole('cell', { name: 'Sofía Díaz' })).toBeVisible();
    await expect(card.getByText('Completado').first()).toBeAttached();
    // El editor, el resultado y la tabla también deben ser accesibles.
    await expectAccessible(page);
  });

  test('explica por qué una consulta es incorrecta', async ({ page }) => {
    await page.goto(SQL_LESSON);
    const card = await openExercise(page, 'Productos económicos');
    await typeCode(page, 'Productos económicos', 'SELECT nombre, precio FROM productos WHERE precio <= 12;');
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText(/devuelve 2 fila\(s\) y se esperaban 5/)).toBeVisible();
  });

  test('los errores de SQL se muestran de forma legible', async ({ page }) => {
    await page.goto(SQL_LESSON);
    const card = await openExercise(page, 'Productos económicos');
    await typeCode(page, 'Productos económicos', 'SELECT nombre FROM producto;');
    await card.getByRole('button', { name: 'Ejecutar' }).click();
    await expect(card.getByText(/Error de SQL: .*producto/)).toBeVisible();
  });
});

test.describe('progreso', () => {
  test('marcar la lectura y responder un quiz se refleja en la sección', async ({ page }) => {
    await page.goto(PYTHON_LESSON);
    const markAsRead = page.getByRole('button', { name: 'Marcar lectura como completada' });
    await waitForHydration(page, markAsRead);
    await markAsRead.click();
    await expect(page.getByRole('button', { name: 'Lectura completada' })).toHaveAttribute('aria-pressed', 'true');

    const quiz = await openExercise(page, 'Comentarios');
    await quiz.getByRole('radio', { name: 'B', exact: true }).check();
    await quiz.getByRole('button', { name: 'Comprobar respuesta' }).click();
    await expect(quiz.getByText('No es correcto')).toBeVisible();
    await quiz.getByRole('radio', { name: 'A', exact: true }).check();
    await quiz.getByRole('button', { name: 'Comprobar respuesta' }).click();
    await expect(quiz.getByText('¡Correcto!')).toBeVisible();

    await page.goto('/python/');
    await expect(page.getByRole('heading', { name: /Tu progreso: \d+%/ })).not.toHaveText('Tu progreso: 0%');
    await expect(page.getByRole('link', { name: /Continuar: Hola, Python/ })).toBeVisible();
  });
});
