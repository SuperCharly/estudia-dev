---
title: Hola, Python
description: Qué es Python, cómo se ejecuta un programa y cómo mostrar texto en pantalla.
objectives:
  - Entender qué es un programa y qué hace el intérprete de Python.
  - Mostrar texto y números en pantalla con print().
  - Escribir comentarios para documentar tu código.
estimatedMinutes: 15
sources:
  - title: 'Tutorial de Python — 1. Abriendo el apetito'
    url: https://docs.python.org/es/3/tutorial/appetite.html
  - title: 'Tutorial de Python — 3. Una introducción informal a Python'
    url: https://docs.python.org/es/3/tutorial/introduction.html
  - title: 'Funciones incorporadas — print()'
    url: https://docs.python.org/es/3/library/functions.html#print
furtherReading:
  - book: aprende-python
  - book: think-python-es
---

## ¿Qué es Python?

Python es un lenguaje de programación **interpretado**: en lugar de convertir todo tu
programa a código máquina antes de ejecutarlo, un programa llamado **intérprete** lee tus
instrucciones y las ejecuta una por una, de arriba hacia abajo.

Es uno de los lenguajes más usados del mundo porque su sintaxis es clara y cercana al
lenguaje natural. Se usa en desarrollo web, ciencia de datos, inteligencia artificial,
automatización de tareas y mucho más.

> En esta plataforma no necesitas instalar nada: los ejercicios se ejecutan con
> [Pyodide](https://pyodide.org), una versión de Python que corre dentro de tu navegador.
> Cuando quieras programar en tu computadora, descarga Python desde
> [python.org](https://www.python.org/downloads/).

## Tu primer programa

La función `print()` muestra en pantalla lo que le pases entre paréntesis:

```python
print("Hola, mundo")
```

Salida:

```text
Hola, mundo
```

El texto entre comillas se llama **cadena de caracteres** (en inglés, *string*). Puedes
usar comillas dobles `"..."` o simples `'...'`; lo importante es abrir y cerrar con el mismo
tipo.

### Varios valores y varias líneas

Cada llamada a `print()` escribe una línea nueva. Si le pasas varios valores separados por
comas, los muestra separados por un espacio:

```python
print("Tengo", 25, "años")
print("Python", "es", "genial")
```

```text
Tengo 25 años
Python es genial
```

Fíjate en que el número `25` no lleva comillas: es un número, no texto. Lo veremos en la
siguiente lección.

## Comentarios

Todo lo que escribas después de `#` en una línea es un **comentario**: Python lo ignora.
Sirven para explicar el *porqué* de tu código a otras personas (y a tu yo del futuro).

```python
# Este programa saluda al usuario
print("¡Bienvenida!")  # También puede ir al final de una línea
```

**Buena práctica:** comenta lo que no es evidente. `x = x + 1  # suma uno a x` no aporta
nada; `x = x + 1  # compensamos el índice que empieza en cero` sí.

## Errores: tus aliados

Si escribes algo que Python no entiende, te mostrará un error. Por ejemplo, si olvidas
cerrar el paréntesis:

```python
print("Hola"
```

```text
SyntaxError: '(' was never closed
```

Leer los errores con calma es una de las habilidades más importantes de quien programa:
casi siempre te dicen **qué** falló y **en qué línea**.

## Resumen

- Python ejecuta tus instrucciones en orden, de arriba hacia abajo.
- `print()` muestra valores en pantalla; varios valores se separan con comas.
- El texto va entre comillas; los números no.
- `#` inicia un comentario que Python ignora.
