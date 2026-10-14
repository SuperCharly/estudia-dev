---
name: qa-codex
description: Pide a Codex CLI (OpenAI, con la suscripción ChatGPT Plus del usuario) que haga de QA y revise los cambios de EstudiaDev en modo solo lectura; Claude programa y corrige, Codex revisa. Úsala al terminar un cambio de código o contenido y antes de fusionarlo a `main`, o cuando el usuario diga "pásalo a QA", "que lo revise Codex" o "/qa-codex".
---

# QA con Codex

En EstudiaDev los roles se reparten entre dos agentes con suscripciones distintas:

- **Claude (tú)**: programa, ejecuta las comprobaciones automáticas y corrige.
- **Codex**: revisa con criterio, en solo lectura, y entrega un veredicto.

Así cada suscripción paga su parte y la revisión la hace un modelo distinto del que escribió
el código, que ve errores que el autor pasa por alto. Las instrucciones que recibe Codex
están en `prompt-qa.md`, junto a este archivo.

## Paso 1. Comprobaciones automáticas (tú)

Desde `web/`, ejecuta `npm run verify` y lee el final de la salida. Si falla, arréglalo
antes de pasar a QA: no gastes la cuota de Codex en algo que un comando ya detecta.

## Paso 2. Revisión de Codex

Desde la raíz del repositorio, con la herramienta Bash (Git Bash conserva los acentos al
pasar el texto a Codex; PowerShell 5.1 no):

```bash
out=$(mktemp)
{
  cat .claude/skills/qa-codex/prompt-qa.md
  printf '\n## Contexto del cambio\n\n'
  printf 'Tarea: %s\n\n' "<qué pidió el usuario, en una o dos frases>"
  printf 'Resultado de npm run verify: %s\n' "<pasa / falla en ...>"
} | codex exec -c 'default_permissions="qa"' --ephemeral -o "$out" - > "$out.log" 2>&1
echo "salida: $?"; cat "$out"
```

- El perfil `qa` es obligatorio. Está definido en `~/.codex/config.toml` (configuración de
  la PC del usuario, no del repositorio): solo lectura, sin red, sin búsqueda web y con las
  carpetas personales y las credenciales bloqueadas. No uses `--sandbox`, que podría
  sustituirlo, ni jamás `--dangerously-bypass-approvals-and-sandbox`.
- Si `salida` no es 0 o el reporte está vacío, lee `$out.log` para ver la causa.
- La revisión tarda unos minutos; dale un `timeout` amplio (600000).
- Si el comando falla porque Codex no tiene sesión iniciada, pide al usuario que escriba
  `! codex login`. Si responde que se agotó el límite de uso, díselo al usuario y no
  sigas sin QA.

## Paso 3. Evaluar el reporte

No aceptes los hallazgos a ciegas: comprueba cada uno en el código. Codex puede
equivocarse igual que tú.

- **Hallazgo real en el código que acabas de escribir** → corrígelo; es parte de tu tarea.
- **Falso positivo** → descártalo y anota por qué.
- **Fuera del alcance de la tarea, o una decisión de diseño** → no lo toques; preséntalo al
  usuario para que decida.

Las reglas de la skill `/revision-seguridad` siguen valiendo: nunca desactives, saltes ni
relajes una prueba o comprobación para conseguir un APROBADO.

## Paso 4. Repetir

Tras corregir, vuelve al paso 1. Haz como máximo **3 rondas**. Si después de la tercera
Codex sigue rechazando, detente y presenta al usuario lo pendiente.

## Paso 5. Informe para el usuario

```markdown
## QA de Codex: APROBADO | RECHAZADO (ronda N)

| Hallazgo de Codex | Gravedad | Qué hice |
| --- | --- | --- |
| ... | ... | Corregido / Descartado: motivo / Pendiente de tu decisión |
```

Fusionar a `main` y subir siguen siendo decisión del usuario.
