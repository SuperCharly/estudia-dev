// @ts-check
import { defineHastPlugin } from 'satteri';

/**
 * Plugin HAST de Sätteri: hace enfocables con el teclado los bloques que pueden tener
 * scroll horizontal (<pre> y <table>), como exige WCAG (regla axe
 * `scrollable-region-focusable`). Así, quien navega con teclado puede desplazarlos.
 */
export const scrollableFocus = defineHastPlugin({
  name: 'scrollable-focus',
  element: {
    filter: ['pre', 'table'],
    visit(node, ctx) {
      ctx.setProperty(node, 'tabIndex', 0);
    },
  },
});
