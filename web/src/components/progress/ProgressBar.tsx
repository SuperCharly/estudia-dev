interface Props {
  percent: number;
  /** Nombre accesible de la barra (p. ej. "Progreso de Python"). */
  label: string;
  size?: 'sm' | 'md';
}

/**
 * Barra de progreso con el elemento nativo <progress>: accesible por defecto y sin estilos
 * en línea (la CSP estricta los bloquearía).
 */
export default function ProgressBar({ percent, label, size = 'md' }: Props) {
  return (
    <progress
      value={percent}
      max={100}
      aria-label={label}
      className={[
        'block w-full appearance-none overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800',
        '[&::-webkit-progress-bar]:bg-transparent',
        '[&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-brand-600 [&::-webkit-progress-value]:transition-all',
        '[&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-brand-600',
        percent === 100 ? '[&::-webkit-progress-value]:bg-emerald-600 [&::-moz-progress-bar]:bg-emerald-600' : '',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
      ].join(' ')}
    >
      {percent}%
    </progress>
  );
}
