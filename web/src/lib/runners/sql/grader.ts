import type { ResultTable, RunResult, SqlRequest } from '../types';

type ExecResult = { fields: { name: string }[]; rows: unknown[] };

/** Lo mínimo que necesitamos de una base de datos (PGlite en el navegador y en tests). */
export interface SqlDatabase {
  exec(sql: string, options?: { rowMode: 'array' }): Promise<ExecResult[]>;
  close(): Promise<void>;
}

export type CreateDatabase = () => Promise<SqlDatabase>;

/** Límite de filas que se envían a la UI (la comparación usa todas). */
export const MAX_DISPLAY_ROWS = 200;

/** Error en el código del estudiante (a diferencia de un error del dataset o del sistema). */
class UserSqlError extends Error {}

/**
 * La consulta de comprobación falló tras ejecutar el código (p. ej. el estudiante no creó la
 * tabla que se le pedía). Con el código del estudiante es una respuesta incorrecta; con la
 * solución oficial es un error del contenido.
 */
class CheckQueryError extends Error {}

/** Objetos que el estudiante haya dejado fuera de la transacción (p. ej. tras un COMMIT). */
const LEFTOVERS_QUERY = `
  SELECT
    (SELECT count(*) FROM pg_namespace
       WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'public') AND nspname NOT LIKE 'pg\\_%')
  + (SELECT count(*) FROM pg_class WHERE relnamespace = 'public'::regnamespace)
  + (SELECT count(*) FROM pg_proc WHERE pronamespace = 'public'::regnamespace)
  + (SELECT count(*) FROM pg_type WHERE typnamespace = 'public'::regnamespace)
  AS leftovers`;

/**
 * Ejecuta scripts sobre una base de datos que siempre vuelve a quedar vacía.
 *
 * Crear una instancia de PGlite cuesta segundos, así que se reutiliza una sola y cada
 * ejecución ocurre dentro de una transacción que se revierte (en Postgres también el DDL
 * es transaccional). Si el estudiante confirma la transacción por su cuenta (COMMIT) y
 * deja objetos, la instancia se descarta y la siguiente ejecución usa una nueva.
 */
export class SqlSandbox {
  private db: Promise<SqlDatabase> | null = null;

  constructor(private readonly createDatabase: CreateDatabase) {}

  /** Prepara la base de datos por adelantado (para que el primer clic sea rápido). */
  warmUp(): Promise<unknown> {
    return this.database();
  }

  async execute(datasetSql: string, code: string, checkQuery?: string): Promise<ResultTable | null> {
    const db = await this.database();
    await db.exec('BEGIN');
    try {
      await db.exec(datasetSql);
      let results: ExecResult[];
      try {
        results = await db.exec(code, { rowMode: 'array' });
      } catch (error) {
        throw new UserSqlError(error instanceof Error ? error.message : String(error));
      }
      let final: ExecResult | undefined;
      if (checkQuery) {
        try {
          final = (await db.exec(checkQuery, { rowMode: 'array' })).at(-1);
        } catch (error) {
          throw new CheckQueryError(error instanceof Error ? error.message : String(error));
        }
      } else {
        final = results.findLast((r) => r.fields.length > 0);
      }
      if (!final) return null;
      return {
        columns: final.fields.map((f) => f.name),
        rows: final.rows.map((row) => (row as unknown[]).map(normalizeCell)),
      };
    } finally {
      await this.restore(db);
    }
  }

  async close(): Promise<void> {
    await this.recycle();
  }

  private database(): Promise<SqlDatabase> {
    this.db ??= this.createDatabase();
    return this.db;
  }

  private async restore(db: SqlDatabase): Promise<void> {
    try {
      await db.exec('ROLLBACK');
      await db.exec('DISCARD ALL');
      const [check] = await db.exec(LEFTOVERS_QUERY, { rowMode: 'array' });
      const leftovers = Number((check?.rows[0] as unknown[] | undefined)?.[0] ?? 0);
      if (leftovers > 0) await this.recycle();
    } catch {
      await this.recycle();
    }
  }

  private async recycle(): Promise<void> {
    const current = this.db;
    this.db = null;
    try {
      await (await current)?.close();
    } catch {
      // La instancia ya estaba inutilizable; basta con descartarla.
    }
  }
}

/** Convierte un valor de Postgres en texto comparable y legible. */
export function normalizeCell(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') {
    // El texto 'NULL' no es un NULL: se muestra entre comillas para que no se confundan.
    if (value === 'NULL') return "'NULL'";
    // NUMERIC llega como texto: "12.50" y "12.5" deben ser iguales.
    return /^-?\d+(\.\d+)?$/.test(value) ? formatNumber(Number(value)) : value;
  }
  return JSON.stringify(value);
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 1e6) / 1e6);
}

function forDisplay(table: ResultTable | null): ResultTable | undefined {
  if (!table) return undefined;
  return { columns: table.columns, rows: table.rows.slice(0, MAX_DISPLAY_ROWS) };
}

/** Compara dos resultados y devuelve `null` si coinciden o una pista si no. */
export function compareTables(actual: ResultTable, expected: ResultTable, ordered: boolean): string | null {
  if (actual.columns.length !== expected.columns.length) {
    return `Tu consulta devuelve ${actual.columns.length} columna(s) y se esperaban ${expected.columns.length}.`;
  }
  if (actual.rows.length !== expected.rows.length) {
    return `Tu consulta devuelve ${actual.rows.length} fila(s) y se esperaban ${expected.rows.length}.`;
  }
  const key = (row: string[]) => JSON.stringify(row);
  const a = actual.rows.map(key);
  const e = expected.rows.map(key);
  if (!ordered) {
    a.sort();
    e.sort();
  }
  if (a.every((row, i) => row === e[i])) return null;

  if (ordered) {
    const sortedExpected = e.toSorted();
    if (a.toSorted().every((row, i) => row === sortedExpected[i])) {
      return 'Las filas son correctas, pero el orden no. Revisa tu ORDER BY.';
    }
  }
  return 'Las filas no coinciden con lo esperado. Revisa las columnas, los filtros y los valores.';
}

export async function runSql(request: SqlRequest, sandbox: SqlSandbox): Promise<RunResult> {
  let actual: ResultTable | null;
  try {
    actual = await sandbox.execute(request.datasetSql, request.code, request.checkQuery);
  } catch (error) {
    if (error instanceof UserSqlError) return { status: 'error', message: `Error de SQL: ${error.message}` };
    if (error instanceof CheckQueryError) {
      return {
        status: request.mode === 'run' ? 'ok' : 'fail',
        message: `Tu código se ejecutó, pero el resultado no se pudo revisar: ${error.message}`,
      };
    }
    throw error;
  }

  if (request.mode === 'run') {
    return {
      status: 'ok',
      message: actual ? '' : 'El código se ejecutó correctamente (no devolvió filas).',
      table: forDisplay(actual),
    };
  }

  const expected = await sandbox.execute(request.datasetSql, request.solution, request.checkQuery);
  if (!expected) throw new Error('La solución del ejercicio no devuelve ningún resultado.');
  if (!actual) {
    return {
      status: 'fail',
      message: 'Tu código no devolvió ninguna tabla. ¿Olvidaste escribir un SELECT?',
    };
  }

  const problem = compareTables(actual, expected, request.ordered);
  if (problem) {
    // Con checkQuery la tabla no es la consulta del estudiante, sino el estado tras su código.
    const message = request.checkQuery ? CHECK_MISMATCH_MESSAGE : problem;
    return { status: 'fail', message, table: forDisplay(actual) };
  }

  if (request.verificationSql) {
    const hidden = await verifyWithHiddenData(request, request.verificationSql, sandbox);
    if (hidden) return { status: 'fail', message: hidden, table: forDisplay(actual) };
  }
  return {
    status: 'pass',
    message: '¡Correcto! Tu consulta devuelve el resultado esperado.',
    table: forDisplay(actual),
  };
}

export const CHECK_MISMATCH_MESSAGE =
  'El resultado todavía no es el esperado. La tabla de abajo muestra cómo quedó todo después de tu código: ' +
  'compárala con lo que pide el enunciado.';

export const HIDDEN_DATA_MESSAGE =
  'Tu consulta funciona con estos datos, pero no con otros datos de prueba que tienen la misma estructura. ' +
  'Revisa que no dependa de valores particulares: calcula y filtra según lo que pide el enunciado.';

/** Compara usuario y solución con los datos ocultos. Devuelve un mensaje si no coinciden. */
async function verifyWithHiddenData(
  request: SqlRequest,
  verificationSql: string,
  sandbox: SqlSandbox,
): Promise<string | null> {
  const expected = await sandbox.execute(verificationSql, request.solution, request.checkQuery);
  if (!expected)
    throw new Error('La solución del ejercicio no devuelve ningún resultado con los datos de verificación.');
  let actual: ResultTable | null;
  try {
    actual = await sandbox.execute(verificationSql, request.code, request.checkQuery);
  } catch (error) {
    if (error instanceof UserSqlError || error instanceof CheckQueryError) return HIDDEN_DATA_MESSAGE;
    throw error;
  }
  // No se revelan los datos ocultos: solo se indica que el resultado no coincide.
  return actual && compareTables(actual, expected, request.ordered) === null ? null : HIDDEN_DATA_MESSAGE;
}
