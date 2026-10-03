# EstudiaDev (nombre provisional)

Plataforma **gratuita y sin fines de lucro** de rutas de estudio de programación en español.
Cada sección (Python, SQL, …) tiene guías basadas en la **documentación oficial actual**,
ejercicios de dificultad progresiva que se **ejecutan en el navegador** y seguimiento del
progreso. Los libros gratuitos de [librosgratis.dev](https://librosgratis.dev) se
recomiendan como lectura complementaria (se enlazan, nunca se copian).

## Estructura

```
estudia-dev/
├── catalog/books.json      Catálogo de libros: metadatos, licencia y fecha de verificación
├── content/                Guías y ejercicios (editables sin tocar código)
│   └── <seccion>/
│       ├── _track.yaml                   Sección: módulos, orden, documentación oficial
│       ├── _datasets/*.yaml              Datasets SQL reutilizables
│       └── <NN-modulo>/
│           ├── <NN-leccion>.md           Guía (frontmatter validado)
│           └── <NN-leccion>.exercises.yaml
├── web/                    Sitio (Astro + React + Tailwind)
└── .github/                CI: lint, tests, build, E2E, CodeQL, enlaces, Dependabot
```

## Requisitos

- Node.js 22.12 o superior (probado con Node 24)
- Git

## Comandos (desde `web/`)

| Comando                | Qué hace                                                            |
| ---------------------- | ------------------------------------------------------------------- |
| `npm install`          | Instala dependencias                                                |
| `npm run dev`          | Servidor de desarrollo en http://localhost:4321                     |
| `npm test`             | Tests unitarios y validación de todo el contenido                   |
| `npm run build`        | Verifica tipos y genera el sitio estático en `web/dist/`            |
| `npm run test:e2e`     | Pruebas en navegador sobre el build (CSP, accesibilidad, ejercicios) |
| `npm run lint`         | ESLint                                                              |
| `npm run format`       | Prettier                                                            |
| `npm run audit:deps`   | Auditoría de dependencias con excepciones documentadas              |
| `npm run verify`       | Auditoría de dependencias y todo lo anterior, en el orden de la CI  |

La primera vez que ejecutes las pruebas E2E instala el navegador: `npx playwright install chromium`.

## Cómo agregar contenido

1. Crea `content/<seccion>/<NN-modulo>/<NN-leccion>.md` con el frontmatter (título,
   objetivos, `sources` con la documentación oficial, `furtherReading` con ids de
   `catalog/books.json`). Mira las lecciones existentes como plantilla.
2. Crea `<NN-leccion>.exercises.yaml` con sus ejercicios (`python`, `sql`, `quiz` o
   `manual`), en dificultad creciente (1 → 3).
3. Ejecuta `npm test`. El test de contenido comprueba que:
   - todo cumple el esquema y las referencias existen (módulos, prerrequisitos, libros,
     datasets);
   - **la solución oficial de cada ejercicio pasa sus propias pruebas**;
   - **el código inicial no las pasa** (el ejercicio no es trivial);
   - **los errores típicos** listados en `mistakes` son rechazados (las pruebas son lo
     bastante estrictas).
4. En ejercicios de Python con `input()`, prueba varios casos con `ejecutar_con([...])`
   para que no se puedan resolver imprimiendo la respuesta esperada.
5. En ejercicios de SQL que modifican datos (`INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`),
   define `checkQuery`: se ejecuta después del código y su resultado es lo que se compara
   con el de la solución. Para comprobar las restricciones de una tabla nueva, haz que
   `checkQuery` intente inserciones válidas e inválidas (ver
   `content/sql/04-modificar-datos/04-create-table.exercises.yaml`).

### Reglas de contenido

- La fuente de verdad es la documentación oficial vigente; los libros son complementarios.
- Redacta con tus propias palabras. No copies texto de libros: enlázalos y cítalos.
  Un libro solo puede adaptarse si su licencia en `catalog/books.json` lo permite
  (`canAdapt`); `sin-verificar` equivale a "solo enlazar".
- Todo borrador generado con IA pasa por revisión humana (PR) antes de publicarse.

## Seguridad

- **Sin servidor que atacar**: el sitio es estático. El código de los estudiantes se
  ejecuta en su propio navegador, dentro de un Web Worker aislado (Pyodide para Python,
  PGlite para PostgreSQL), con tiempo límite ante bucles infinitos.
- **CSP estricta** con hashes generados por Astro (sin `unsafe-inline`) y cabeceras de
  seguridad en `web/public/_headers` (HSTS, `frame-ancestors 'none'`, `nosniff`, etc.).
- **Sin dependencias de CDN**: Pyodide se sirve desde el propio sitio.
- Todo lo leído de `localStorage` se valida con Zod; si está corrupto se ignora.
- El contenido se escribe en Markdown puro (no MDX), así que no puede ejecutar código
  durante el build.
- CI con CodeQL, Dependabot y auditoría de dependencias (`npm run audit:deps`): falla ante
  cualquier aviso alto o crítico. Las excepciones se documentan en `web/audit-exceptions.json`
  con su motivo y una fecha de revisión; al vencer, o cuando el aviso desaparece, la CI
  vuelve a fallar hasta que se revise.

**Limitación conocida:** la corrección ocurre en el navegador, así que alguien podría
falsear su propio progreso. Es aceptable para una plataforma de aprendizaje; si en el
futuro hay certificados, se evaluará en un servidor con sandbox.

## Despliegue (Cloudflare Pages)

- Directorio raíz: `web` · Comando de build: `npm run build` · Salida: `dist`
- Variable de entorno: `NODE_VERSION=24`

## Hoja de ruta

- [x] Fase 1 (MVP): plataforma, progreso local y módulo 1 de Python y de SQL
- [x] Módulo 2 de Python (control de flujo) y de SQL (agregación)
- [x] Módulo 3 de Python (estructuras de datos) y de SQL (relaciones entre tablas)
- [x] Módulo 4 de Python (funciones) y de SQL (modificar datos y crear tablas)
- [x] Módulo 5 de Python (errores y módulos) y de SQL (mini-proyecto: biblioteca)
- [ ] Fase 0: script de catálogo (respetando robots.txt) y verificación de licencias
- [ ] Fase 2: cuentas con Supabase (RLS) y sincronización del progreso
- [ ] Fase 3: pipeline de borradores con IA + revisión humana
- [ ] Fase 4: más secciones (JavaScript, Java…), quizzes y repaso espaciado

## Licencias

- Código: [MIT](LICENSE)
- Contenido de `content/`: [CC BY-SA 4.0](LICENSE-CONTENT.md)
- Los libros enlazados conservan la licencia de sus autores.
