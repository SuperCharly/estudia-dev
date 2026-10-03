---
name: revision-seguridad
description: Revisión completa de seguridad y calidad de EstudiaDev antes de subir, fusionar o desplegar. Ejecuta la verificación local (auditoría de dependencias, lint, pruebas, build y pruebas en navegador), revisa el estado en GitHub (CI, CodeQL, alertas, Dependabot), busca secretos y lee los cambios en busca de fallos de seguridad, bugs e inconsistencias; entrega un informe con veredicto. Úsala siempre que el usuario pida revisar, verificar, auditar o depurar el proyecto, pregunte si es seguro subir, publicar o desplegar, quiera saber por qué falla la CI o CodeQL, o diga cosas como "revisa que todo esté bien", "¿hay vulnerabilidades?" o "pasa la verificación", aunque no mencione la palabra seguridad.
---

# Revisión de seguridad y calidad de EstudiaDev

EstudiaDev es un sitio estático (Astro + React) que ejecuta el código de los estudiantes en
su propio navegador. Es un producto público, así que la seguridad se cuida desde el primer
día. Esta skill reúne en una sola pasada todas las comprobaciones, las que hace una
herramienta y las que requieren leer el código con criterio.

Hay dos clases de comprobaciones y conviene no confundirlas:

- **Automáticas**: un comando da un resultado claro (pasa o falla). Detectan lo que ya
  sabemos buscar.
- **De criterio**: leer los cambios y pensar qué puede salir mal. Detectan lo que ninguna
  herramienta busca: una prueba que aprueba respuestas incorrectas, un control de seguridad
  debilitado sin querer, un texto que contradice a otro.

Que todo lo automático pase no significa que el cambio sea correcto. La revisión de criterio
es la parte que justifica esta skill; no la omitas porque los comandos salieron en verde.

## Alcance

Si el usuario no indica otra cosa, revisa los cambios pendientes de publicar: lo que hay en
el árbol de trabajo y los commits locales que no están en `origin/main`. Si no hay ninguno,
revisa el último commit de `main` y el estado general del repositorio.

Si pide una revisión "completa" o "a fondo", revisa además todas las zonas sensibles de la
lista de abajo, hayan cambiado o no.

## Paso 1. Situación de partida

```bash
git status --short
git fetch -q && git log --oneline origin/main..HEAD
git diff --stat origin/main
```

Anota la rama, si hay cambios sin confirmar y qué archivos cambian. Eso decide dónde mirar
en el paso 4.

## Paso 2. Verificación local

Desde `web/`:

```bash
npm run verify
```

Ejecuta, en este orden: auditoría de dependencias, lint, formato, pruebas unitarias y de
contenido, verificación de tipos y build, y pruebas en navegador. Tarda unos minutos; no lo
des por bueno sin leer el final de la salida.

Cuando algo falle, localiza la causa antes de proponer nada. Pistas para este proyecto:

- **`audit:deps` falla** → lee el mensaje. O hay un aviso nuevo alto o crítico, o una
  excepción de `web/audit-exceptions.json` ha vencido o ya no hace falta. Mira el paso 3.
- **Prueba de contenido falla** → casi siempre es un ejercicio: la solución no pasa sus
  pruebas, el código inicial las pasa, o un error típico (`mistakes`) no es rechazado. Lo
  último suele destapar un fallo real del evaluador o unas pruebas demasiado flojas, no un
  problema del test. Investiga cuál de las dos cosas es.
- **Pruebas en navegador fallan** → necesitan el build reciente y, la primera vez,
  `npx playwright install chromium`. Las trazas quedan en `web/test-results/`.
- **Formato** → `npm run format` lo arregla; es el único fallo que puedes corregir sin
  preguntar.

## Paso 3. Dependencias

Lee `web/audit-exceptions.json`. Para cada excepción:

- Si `reviewBy` cae en los próximos 14 días, avísalo: la CI empezará a fallar en esa fecha.
- Comprueba si ya existe una versión corregida (`npm view <paquete> versions --json` y la
  página del aviso en GitHub). Si existe, propone actualizar y quitar la excepción.
- Vuelve a leer el motivo y comprueba que sigue siendo cierto. Por ejemplo, una excepción
  justificada en que "el sitio no tiene imágenes remotas" deja de valer el día que se añade
  una.

Una excepción nueva es una decisión del usuario, no tuya. Si un aviso no tiene parche,
explica el impacto real en este proyecto y deja que elija.

## Paso 4. Revisión de los cambios

Lee el diff completo (`git diff origin/main`), no solo la lista de archivos. Para cada
archivo cambiado pregúntate qué puede salir mal y, si toca una de estas zonas, comprueba lo
indicado.

| Zona | Archivos | Qué comprobar |
| --- | --- | --- |
| Cabeceras y CSP | `web/public/_headers`, `web/astro.config.*` | No aparece `unsafe-inline` ni `unsafe-eval` sin justificación; siguen HSTS, `frame-ancestors 'none'`, `nosniff`; no se cargan recursos de otros dominios (ni CDN) |
| Ejecución de código | `web/src/workers/`, `web/src/lib/runners/` | El código del estudiante solo corre dentro del worker; sigue habiendo tiempo límite; el worker no recibe datos que no necesita |
| Salida en pantalla | `web/src/components/` | Lo que produce el código del estudiante se muestra como texto. Busca `dangerouslySetInnerHTML`, `set:html` e `innerHTML`: no deberían aparecer |
| Datos del navegador | `web/src/lib/progress/` | Todo lo leído de `localStorage` se valida con Zod antes de usarse |
| Evaluadores | `web/src/lib/runners/**/grader.ts`, `harness.py` | Un cambio no debe hacer que se apruebe una respuesta incorrecta ni revelar los datos de verificación ocultos o las soluciones al navegador |
| Contenido | `content/**` | Cada ejercicio de código tiene `mistakes`; los de SQL con datos usan un dataset con `verificationSql`; las fuentes son documentación oficial con `https`; no hay texto copiado de libros que no se puedan adaptar |
| Catálogo | `catalog/books.json` | La licencia indicada está comprobada en la fuente original; `sin-verificar` si no lo está |
| CI y dependencias | `.github/**`, `web/package.json`, `web/audit-exceptions.json` | No se ha quitado ni relajado una comprobación; los permisos de los workflows siguen siendo mínimos; una dependencia nueva es necesaria y está mantenida |

Además de la seguridad, busca fallos corrientes: casos límite sin cubrir, mensajes de error
que confunden al estudiante, pruebas que no prueban lo que dicen, código o textos que
contradicen a otra parte del proyecto (por ejemplo, el README frente a lo que hace el
código), y cambios sin su prueba correspondiente.

Si el cambio es grande o toca los evaluadores, complementa con las skills `/security-review`
y `/code-review`, que hacen una lectura más profunda del diff.

## Paso 5. Secretos y datos personales

El repositorio es público: lo que se sube queda visible y en el historial para siempre.

```bash
git ls-files | grep -iE '\.env|secret|credential|\.pem$|\.key$'
git diff origin/main | grep -nE '^\+.*(api[_-]?key|secret|token|password|passwd|BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{20,})'
```

Revisa a mano lo que aparezca: muchas coincidencias serán inocentes (la palabra "token" en
un texto). Un secreto real ya confirmado en un commit hay que **revocarlo**, no solo
borrarlo; dilo así. Cuando llegue la fase de Supabase, la clave `service_role` nunca debe
estar en el repositorio ni llegar al navegador.

## Paso 6. Estado en GitHub

Estas comprobaciones solo existen en GitHub; localmente no se ven.

```bash
gh run list --branch main --limit 6
gh api repos/{owner}/{repo}/code-scanning/alerts -q '.[] | select(.state=="open") | "#\(.number) \(.rule.security_severity_level // .rule.severity) \(.rule.id) \(.most_recent_instance.location.path):\(.most_recent_instance.location.start_line)"'
gh api repos/{owner}/{repo}/dependabot/alerts -q '.[] | select(.state=="open") | "#\(.number) \(.security_advisory.severity) \(.dependency.package.name)"'
gh pr list
```

- **CI o CodeQL en rojo** → `gh run view <id> --log-failed` y explica la causa.
- **Alerta de CodeQL abierta** → lee el código señalado y decide si es un problema real o un
  falso positivo, razonándolo. Descartar una alerta en GitHub es decisión del usuario.
- **PR de Dependabot** → para cada uno: qué cambia, si su CI pasa una vez rebasado y si las
  notas de la versión traen cambios incompatibles que nos afecten. Los saltos mayores de
  `typescript` y `@types/node` están ignorados a propósito (ver `.github/dependabot.yml`).
- Si un comando responde que una función está desactivada o que falta un permiso, no lo
  trates como "sin alertas": anótalo en el informe como algo que no se pudo comprobar.

## Paso 7. Informe

Escribe en español, sin jerga innecesaria. Usa esta estructura:

```markdown
## Veredicto
Una o dos frases: si es seguro subir o desplegar, y qué lo impide si no lo es.

## Resultados
| Comprobación | Resultado |
| --- | --- |
| Verificación local | pasa / falla en <paso> |
| Dependencias | ... |
| Revisión de los cambios | N hallazgos |
| Secretos | ... |
| GitHub (CI, CodeQL, alertas, PR) | ... |

## Hallazgos
Ordenados de más a menos grave. Para cada uno:
- **[Grave | Medio | Leve] Título** — `archivo:línea`
  Qué ocurre, por qué importa en este proyecto y qué propones.

## No comprobado
Lo que no se pudo verificar y por qué.
```

Gravedad: **Grave** si expone a los usuarios, publica un secreto o hace que se aprueben
respuestas incorrectas; **Medio** si es un fallo real con alcance limitado o debilita una
defensa; **Leve** si es una inconsistencia o una mejora.

Sé fiel a lo que viste. Si una comprobación no se ejecutó, dilo; no la des por pasada. Si
todo está bien, dilo en una frase y no rellenes el informe con hallazgos menores.

## Qué arreglar y qué preguntar

Corrige sin preguntar solo el formato. Para todo lo demás, presenta el hallazgo con tu
propuesta y espera la decisión: el usuario prefiere decidir paso a paso.

Hay cosas que nunca se hacen para "poner la CI en verde" sin que el usuario lo apruebe de
forma expresa, porque quitan justo la protección que avisó del problema:

- desactivar, saltar o relajar una prueba o una comprobación;
- añadir una excepción a la auditoría o descartar una alerta;
- usar `npm audit fix --force`, que puede instalar versiones antiguas e incompatibles;
- subir o fusionar cambios.

Al aplicar un arreglo aprobado, sigue el flujo del proyecto: rama propia, `npm run verify`,
fusión a `main` y subida.
