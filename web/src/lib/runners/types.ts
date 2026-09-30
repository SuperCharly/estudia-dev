/** Resultado de ejecutar o comprobar un ejercicio, común a todos los lenguajes. */
export type RunStatus = 'ok' | 'error' | 'pass' | 'fail';

export interface ResultTable {
  columns: string[];
  rows: string[][];
}

export interface RunResult {
  status: RunStatus;
  /** Mensaje para el estudiante (vacío si la ejecución fue normal). */
  message: string;
  /** Texto impreso (Python). */
  stdout?: string;
  /** Resultado de la última consulta (SQL). */
  table?: ResultTable;
}

export type RunMode = 'run' | 'grade';

export interface PythonRequest {
  language: 'python';
  mode: RunMode;
  code: string;
  tests: string;
  stdin: string[];
}

export interface SqlRequest {
  language: 'sql';
  mode: RunMode;
  code: string;
  solution: string;
  datasetSql: string;
  checkQuery?: string;
  ordered: boolean;
}

export type RunRequest = PythonRequest | SqlRequest;
