# web

Sitio de EstudiaDev (Astro 7 + React 19 + Tailwind 4). Consulta el
[README principal](../README.md) para los comandos, la estructura del contenido y las
prácticas de seguridad.

## Mapa del código

| Ruta                    | Qué contiene                                                            |
| ----------------------- | ----------------------------------------------------------------------- |
| `src/content.config.ts` | Colecciones de contenido (leen `../content` y `../catalog`)             |
| `src/lib/content/`      | Esquemas Zod y construcción del mapa de cada sección                    |
| `src/lib/progress/`     | Modelo de progreso, almacén local (`ProgressStore`) y borradores        |
| `src/lib/runners/`      | Evaluadores de Python (Pyodide) y SQL (PGlite) y cliente de workers     |
| `src/workers/`          | Web Workers que ejecutan el código de los estudiantes                   |
| `src/components/`       | Islas de React (progreso, ejercicios, editor) y componentes Astro       |
| `src/pages/`            | Inicio, sección (`/[track]/`) y lección (`/[track]/[module]/[lesson]/`) |
| `tests/content/`        | Validación de todo el contenido (las soluciones pasan sus pruebas)      |
| `tests/e2e/`            | Pruebas en navegador (flujos, CSP, accesibilidad)                       |
| `public/_headers`       | Cabeceras de seguridad para Cloudflare Pages                            |
