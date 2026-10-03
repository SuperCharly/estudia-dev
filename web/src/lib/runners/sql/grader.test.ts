import { afterAll, describe, expect, it } from 'vitest';
import type { SqlRequest } from '../types';
import { compareTables, HIDDEN_DATA_MESSAGE, normalizeCell, runSql, SqlSandbox } from './grader';
import { createPgliteDatabase } from './pglite';

const sandbox = new SqlSandbox(createPgliteDatabase);
afterAll(() => sandbox.close());

const DATASET = `
  CREATE TABLE productos (id INT PRIMARY KEY, nombre TEXT NOT NULL, precio NUMERIC(10,2), alta DATE);
  INSERT INTO productos VALUES
    (1, 'Lápiz', 5.50, '2024-01-10'),
    (2, 'Cuaderno', 35.00, '2024-02-01'),
    (3, 'Mochila', 450.00, NULL);
`;

const request = (overrides: Partial<SqlRequest>): SqlRequest => ({
  language: 'sql',
  mode: 'grade',
  code: '',
  solution: 'SELECT nombre FROM productos',
  datasetSql: DATASET,
  ordered: false,
  ...overrides,
});

describe('normalizeCell', () => {
  it.each([
    [null, 'NULL'],
    [3, '3'],
    [10n, '10'],
    ['35.00', '35'],
    ['5.50', '5.5'],
    [0.1 + 0.2, '0.3'],
    [true, 'true'],
    ['texto', 'texto'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeCell(input)).toBe(expected);
  });
});

describe('compareTables', () => {
  const t = (rows: string[][], columns = ['a']) => ({ columns, rows });

  it('ignora el orden cuando no se exige', () => {
    expect(compareTables(t([['1'], ['2']]), t([['2'], ['1']]), false)).toBeNull();
  });

  it('detecta un orden incorrecto cuando se exige', () => {
    expect(compareTables(t([['1'], ['2']]), t([['2'], ['1']]), true)).toContain('ORDER BY');
  });

  it('explica diferencias de columnas y filas', () => {
    expect(compareTables(t([['1']], ['a', 'b']), t([['1']]), false)).toContain('columna');
    expect(compareTables(t([['1']]), t([['1'], ['2']]), false)).toContain('fila');
  });
});

describe('runSql (PGlite)', () => {
  it('ejecuta una consulta y devuelve la tabla', async () => {
    const result = await runSql(
      request({ mode: 'run', code: 'SELECT nombre, precio, alta FROM productos WHERE id = 1' }),
      sandbox,
    );
    expect(result.status).toBe('ok');
    expect(result.table).toEqual({ columns: ['nombre', 'precio', 'alta'], rows: [['Lápiz', '5.5', '2024-01-10']] });
  });

  it('aprueba una consulta equivalente a la solución (aunque use alias distintos)', async () => {
    const result = await runSql(request({ code: 'SELECT p.nombre AS producto FROM productos p;' }), sandbox);
    expect(result.status).toBe('pass');
  });

  it('reprueba si faltan filas', async () => {
    const result = await runSql(request({ code: 'SELECT nombre FROM productos WHERE precio < 100' }), sandbox);
    expect(result).toMatchObject({ status: 'fail' });
    expect(result.message).toContain('2 fila(s)');
  });

  it('reporta errores de SQL de forma legible', async () => {
    const result = await runSql(request({ code: 'SELEC nombre FROM productos' }), sandbox);
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/^Error de SQL: .*syntax error/i);
  });

  it('usa checkQuery para validar modificaciones de datos', async () => {
    const result = await runSql(
      request({
        code: "UPDATE productos SET precio = 6 WHERE nombre = 'Lápiz'",
        solution: 'UPDATE productos SET precio = 6 WHERE id = 1',
        checkQuery: 'SELECT id, precio FROM productos ORDER BY id',
      }),
      sandbox,
    );
    expect(result.status).toBe('pass');
  });

  it('cada ejecución parte de datos limpios (un DELETE del estudiante no afecta a la solución)', async () => {
    const result = await runSql(request({ code: 'DELETE FROM productos; SELECT nombre FROM productos' }), sandbox);
    expect(result).toMatchObject({ status: 'fail' });
    expect(result.message).toContain('0 fila(s)');
  });

  it('avisa si el código no devuelve ninguna tabla', async () => {
    const result = await runSql(request({ code: "UPDATE productos SET nombre = 'x'" }), sandbox);
    expect(result).toMatchObject({ status: 'fail' });
    expect(result.message).toContain('SELECT');
  });

  it('se recupera si el estudiante confirma la transacción con COMMIT', async () => {
    const polluted = await runSql(
      request({ mode: 'run', code: 'COMMIT; CREATE TABLE basura (x INT); CREATE SCHEMA otro;' }),
      sandbox,
    );
    expect(polluted.status).toBe('ok');

    const next = await runSql(request({ code: 'SELECT nombre FROM productos' }), sandbox);
    expect(next.status).toBe('pass');
  });

  describe('datos de verificación ocultos', () => {
    // Mismo esquema, otros datos: aquí el promedio de precios es 100.
    const VERIFICATION = `
      CREATE TABLE productos (id INT PRIMARY KEY, nombre TEXT NOT NULL, precio NUMERIC(10,2), alta DATE);
      INSERT INTO productos VALUES (1, 'Goma', 50, NULL), (2, 'Regla', 150, NULL);
    `;
    const solution = 'SELECT nombre FROM productos WHERE precio > (SELECT AVG(precio) FROM productos)';

    it('aprueba una consulta correcta en ambos conjuntos de datos', async () => {
      const result = await runSql(request({ code: solution, solution, verificationSql: VERIFICATION }), sandbox);
      expect(result.status).toBe('pass');
    });

    it('rechaza una consulta con el valor escrito a mano, sin revelar los datos ocultos', async () => {
      // Con los datos visibles el promedio es 163.5, así que "> 163.5" coincide… solo ahí.
      const result = await runSql(
        request({ code: 'SELECT nombre FROM productos WHERE precio > 163.5', solution, verificationSql: VERIFICATION }),
        sandbox,
      );
      expect(result).toMatchObject({ status: 'fail', message: HIDDEN_DATA_MESSAGE });
      expect(result.table?.rows).toEqual([['Mochila']]); // Se muestra solo el resultado con los datos visibles.
    });

    it('no usa los datos ocultos al solo ejecutar', async () => {
      const result = await runSql(
        request({ mode: 'run', code: 'SELECT COUNT(*) FROM productos', verificationSql: VERIFICATION }),
        sandbox,
      );
      expect(result.table?.rows).toEqual([['3']]);
    });
  });

  it('una vez iniciada, cada ejecución es rápida', async () => {
    await sandbox.warmUp();
    const start = performance.now();
    await runSql(request({ code: 'SELECT nombre FROM productos' }), sandbox);
    expect(performance.now() - start).toBeLessThan(500);
  });
});
