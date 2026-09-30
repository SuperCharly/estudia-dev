---
title: Variables y tipos de datos
description: Guarda información en variables y conoce los tipos básicos de Python.
objectives:
  - Crear variables y reasignarles valores.
  - Distinguir los tipos int, float, str y bool.
  - Consultar el tipo de un valor con type().
  - Construir textos con f-strings.
estimatedMinutes: 25
sources:
  - title: 'Tutorial de Python — 3.1. Usando Python como una calculadora'
    url: https://docs.python.org/es/3/tutorial/introduction.html#using-python-as-a-calculator
  - title: 'Tutorial de Python — 7.1.1. Literales de cadena formateados'
    url: https://docs.python.org/es/3/tutorial/inputoutput.html#formatted-string-literals
  - title: 'PEP 8 — Guía de estilo para código Python (nombres)'
    url: https://peps.python.org/pep-0008/#naming-conventions
furtherReading:
  - book: manual-de-python-alf
prerequisites:
  - python/01-primeros-pasos/01-hola-python
---

## ¿Qué es una variable?

Una **variable** es un nombre que apunta a un valor para que puedas usarlo más adelante.
Se crea con el signo `=` (operador de **asignación**):

```python
nombre = "Ada"
edad = 36

print(nombre)
print(edad)
```

```text
Ada
36
```

`=` no significa "es igual a" como en matemáticas, sino **"guarda este valor con este
nombre"**. Por eso puedes cambiar el valor de una variable:

```python
puntos = 10
puntos = puntos + 5  # toma el valor actual (10), le suma 5 y lo vuelve a guardar
print(puntos)        # 15
```

### Cómo nombrar variables

- Pueden contener letras, números y guion bajo, pero **no pueden empezar con un número**.
- Distinguen mayúsculas y minúsculas: `edad` y `Edad` son variables distintas.
- En Python se usa el estilo `snake_case`: palabras en minúscula separadas por `_`
  (por ejemplo, `precio_total`), como recomienda la guía de estilo PEP 8.
- Elige nombres que expliquen qué guardan: `precio_total` es mejor que `pt` o `x`.

## Tipos de datos básicos

Cada valor tiene un **tipo**, que determina qué puedes hacer con él:

| Tipo    | Qué representa           | Ejemplos                      |
| ------- | ------------------------ | ----------------------------- |
| `int`   | Números enteros          | `42`, `-7`, `0`               |
| `float` | Números con decimales    | `3.14`, `-0.5`, `2.0`         |
| `str`   | Texto (cadenas)          | `"hola"`, `'Python'`, `""`    |
| `bool`  | Verdadero o falso        | `True`, `False`               |

Con la función `type()` puedes averiguar el tipo de cualquier valor:

```python
print(type(42))       # <class 'int'>
print(type(3.14))     # <class 'float'>
print(type("42"))     # <class 'str'>
print(type(True))     # <class 'bool'>
```

Observa que `42` y `"42"` son cosas distintas: el primero es un número y el segundo, texto.
Los decimales se escriben con **punto**, no con coma: `3.14`.

## Construir textos con f-strings

Las **f-strings** (cadenas con `f` delante) permiten insertar valores dentro de un texto
escribiéndolos entre llaves `{}`:

```python
nombre = "Ada"
edad = 36
print(f"{nombre} tiene {edad} años")
```

```text
Ada tiene 36 años
```

Dentro de las llaves puedes poner cualquier expresión, por ejemplo `{edad + 1}`. También
puedes controlar el formato de los números: `{precio:.2f}` muestra dos decimales.

```python
precio = 19.5
print(f"Total: ${precio:.2f}")  # Total: $19.50
```

## Resumen

- `nombre = valor` crea o actualiza una variable.
- Usa nombres descriptivos en `snake_case`.
- Los tipos básicos son `int`, `float`, `str` y `bool`; `type()` te dice cuál es cuál.
- Las f-strings (`f"...{valor}..."`) son la forma moderna de combinar texto y valores.
