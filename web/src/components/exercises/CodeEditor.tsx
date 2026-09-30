import { python } from '@codemirror/lang-python';
import { PostgreSQL, sql } from '@codemirror/lang-sql';
import { Compartment, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
import { basicSetup, EditorView } from 'codemirror';
import { useEffect, useEffectEvent, useRef } from 'react';

interface Props {
  /** Contenido inicial. Para reemplazarlo (p. ej. "Restablecer"), vuelve a montar el editor con otra `key`. */
  initialValue: string;
  language: 'python' | 'sql';
  onChange: (value: string) => void;
  /** Ctrl/Cmd + Enter. */
  onRun: () => void;
  label: string;
}

const isDark = () => document.documentElement.classList.contains('dark');

/** Estilos base del editor (dentro del Shadow DOM no llegan las clases de Tailwind). */
const baseTheme = EditorView.theme({
  '&': { fontSize: '14px', minHeight: '8rem' },
  '.cm-scroller': {
    fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace",
    lineHeight: '1.6',
  },
  '&.cm-focused': { outline: 'none' },
});

/**
 * Editor CodeMirror 6, no controlado: CodeMirror es la única fuente de verdad del texto y
 * notifica cada cambio con `onChange`. Sincronizar un `value` desde React provocaría
 * carreras (un render atrasado podría revertir lo que se acaba de escribir).
 *
 * Se monta dentro de un Shadow DOM: ahí CodeMirror aplica sus estilos con hojas de estilo
 * construibles (`adoptedStyleSheets`) en lugar de etiquetas <style> dinámicas, que la CSP
 * estricta del sitio bloquearía.
 */
export default function CodeEditor({ initialValue, language, onChange, onRun, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  // Siempre llaman a la versión más reciente de las props, sin recrear el editor.
  const handleChange = useEffectEvent((doc: string) => onChange(doc));
  const handleRun = useEffectEvent(() => onRun());
  const getInitialValue = useEffectEvent(() => initialValue);

  useEffect(() => {
    if (!host.current) return;
    const shadow = host.current.shadowRoot ?? host.current.attachShadow({ mode: 'open' });
    const mount = document.createElement('div');
    shadow.append(mount);

    const theme = new Compartment();
    const editor = new EditorView({
      root: shadow,
      parent: mount,
      state: EditorState.create({
        doc: getInitialValue(),
        extensions: [
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                handleRun();
                return true;
              },
            },
          ]),
          basicSetup,
          baseTheme,
          language === 'python' ? python() : sql({ dialect: PostgreSQL }),
          theme.of(isDark() ? oneDark : []),
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) handleChange(update.state.doc.toString());
          }),
        ],
      }),
    });
    // Sigue el cambio de tema claro/oscuro de la página.
    const observer = new MutationObserver(() => {
      editor.dispatch({ effects: theme.reconfigure(isDark() ? oneDark : []) });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      editor.destroy();
      mount.remove();
    };
  }, [language, label]);

  return (
    <div
      ref={host}
      className="overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-brand-500 dark:border-slate-700 dark:bg-[#282c34]"
    />
  );
}
