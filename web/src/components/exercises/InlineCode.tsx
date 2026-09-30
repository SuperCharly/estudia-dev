/**
 * Muestra un texto en el que los fragmentos entre `comillas invertidas` se ven como código.
 * Se construyen elementos de React (sin HTML crudo), así que el texto nunca se interpreta
 * como marcado.
 */
export default function InlineCode({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
          <code
            key={i}
            className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800 dark:bg-slate-800 dark:text-slate-100"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}
