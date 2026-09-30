import { PGlite } from '@electric-sql/pglite';
import type { SqlDatabase } from './grader';

// OIDs de Postgres para fechas: se reciben como texto ("2024-03-15") en lugar de `Date`,
// que dependería de la zona horaria del navegador.
const DATE_OID = 1082;
const TIMESTAMP_OID = 1114;
const TIMESTAMPTZ_OID = 1184;
const asText = (value: string) => value;

/** Base de datos Postgres nueva, en memoria, para una sola ejecución. */
export async function createPgliteDatabase(): Promise<SqlDatabase> {
  const db = await PGlite.create({
    parsers: { [DATE_OID]: asText, [TIMESTAMP_OID]: asText, [TIMESTAMPTZ_OID]: asText },
  });
  return db;
}
