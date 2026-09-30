---
title: Entrada de datos y conversión de tipos
description: Pide datos al usuario con input() y conviértelos al tipo que necesitas.
objectives:
  - Leer datos del usuario con input().
  - Convertir entre tipos con int(), float() y str().
  - Reconocer el error ValueError al convertir datos inválidos.
estimatedMinutes: 20
sources:
  - title: 'Funciones incorporadas — input()'
    url: https://docs.python.org/es/3/library/functions.html#input
  - title: 'Funciones incorporadas — int()'
    url: https://docs.python.org/es/3/library/functions.html#int
  - title: 'Funciones incorporadas — float()'
    url: https://docs.python.org/es/3/library/functions.html#float
furtherReading:
  - book: aprende-python
prerequisites:
  - python/01-primeros-pasos/03-operadores
---

## Pedir datos con `input()`

`input()` detiene el programa, espera a que el usuario escriba algo y presione Enter, y
devuelve lo que escribió. Si le pasas un texto, lo muestra como mensaje:

```python
nombre = input("¿Cómo te llamas? ")
print(f"¡Hola, {nombre}!")
```

```text
¿Cómo te llamas? Ada
¡Hola, Ada!
```

> En los ejercicios de esta plataforma, `input()` recibe datos de prueba automáticamente
> para que puedas comprobar tu programa sin escribirlos cada vez.

## `input()` siempre devuelve texto

Aunque el usuario escriba un número, `input()` devuelve un `str`. Esto produce resultados
inesperados:

```python
edad = input("Edad: ")   # el usuario escribe 20
print(edad + 1)
```

```text
TypeError: can only concatenate str (not "int") to str
```

Python no puede sumar el texto `"20"` y el número `1`. Hay que **convertir** el texto.

## Conversión de tipos

| Función   | Convierte a         | Ejemplo                     |
| --------- | ------------------- | --------------------------- |
| `int()`   | Entero              | `int("20")` → `20`          |
| `float()` | Decimal             | `float("3.5")` → `3.5`      |
| `str()`   | Texto               | `str(20)` → `"20"`          |

```python
edad = int(input("Edad: "))  # el usuario escribe 20
print(edad + 1)              # 21
```

Algunas conversiones útiles más:

```python
print(int(3.99))    # 3 → int() descarta los decimales (no redondea)
print(round(3.99))  # 4 → para redondear, usa round()
print(int("  7 "))  # 7 → ignora los espacios alrededor
```

## Cuando la conversión falla

Si el texto no representa un número válido, Python lanza un `ValueError`:

```python
int("veinte")
```

```text
ValueError: invalid literal for int() with base 10: 'veinte'
```

Más adelante, en el módulo de errores, aprenderás a manejar estos casos con `try` y
`except` para que tu programa no se detenga.

## Resumen

- `input()` lee una línea escrita por el usuario y **siempre** devuelve un `str`.
- Convierte con `int()`, `float()` y `str()` según lo que necesites.
- Convertir un texto que no es un número produce `ValueError`.
