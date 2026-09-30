import type { ResultTable as Table } from '../../lib/runners/types';
import { MAX_DISPLAY_ROWS } from '../../lib/runners/sql/grader';

/** Tabla con el resultado de una consulta SQL. */
export default function ResultTable({ table }: { table: Table }) {
  if (table.rows.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">La consulta no devolvió filas.</p>;
  }
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Resultado de la consulta"
      className="max-h-80 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700"
    >
      <table className="w-full text-left font-mono text-sm">
        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
          <tr>
            {table.columns.map((column, i) => (
              <th key={i} scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-1.5 whitespace-nowrap ${cell === 'NULL' ? 'text-slate-400 italic' : ''}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.rows.length === MAX_DISPLAY_ROWS && (
        <p className="p-2 text-xs text-slate-500">Se muestran solo las primeras {MAX_DISPLAY_ROWS} filas.</p>
      )}
    </div>
  );
}
