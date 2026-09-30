---
title: Recorrer con for y range
description: Recorre secuencias con for, genera rangos de números y anida bucles.
objectives:
  - Recorrer los caracteres de un texto con for.
  - Generar secuencias de números con range().
  - Elegir entre for y while según el problema.
  - Escribir bucles anidados.
estimatedMinutes: 30
sources:
  - title: 'Tutorial de Python — 4.2. La sentencia for'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#for-statements
  - title: 'Tutorial de Python — 4.3. La función range()'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#the-range-function
  - title: 'Tipos incorporados — Rangos'
    url: https://docs.python.org/es/3/library/stdtypes.html#ranges
furtherReading:
  - book: think-python-es
  - book: python-manual-basico
prerequisites:
  - python/02-control-de-flujo/02-bucle-while
---

## El bucle for

`for` recorre, uno por uno, los elementos de una **secuencia**. En cada iteración, la
variable del bucle toma el valor del siguiente elemento:

```python
for letra in "Hola":
    print(letra)
```

```text
H
o
l
a
```

A diferencia de `while`, no necesitas un contador ni una condición: el bucle termina solo
cuando se acaban los elementos. En el próximo módulo lo usarás para recorrer listas y
diccionarios.

## range(): secuencias de números

`range()` genera una secuencia de enteros. Tiene tres formas:

| Llamada              | Números que genera | Explicación                           |
| -------------------- | ------------------ | ------------------------------------- |
| `range(5)`           | 0, 1, 2, 3, 4      | De 0 hasta 5, **sin incluir** el 5    |
| `range(2, 6)`        | 2, 3, 4, 5         | Desde 2 hasta 6, sin incluir el 6     |
| `range(0, 10, 3)`    | 0, 3, 6, 9         | De 3 en 3                             |
| `range(5, 0, -1)`    | 5, 4, 3, 2, 1      | Hacia atrás, con paso negativo        |

El final **nunca se incluye**. Por eso, para contar del 1 al 10 se escribe `range(1, 11)`.

```python
for i in range(1, 4):
    print(f"{i} x 7 = {i * 7}")
```

```text
1 x 7 = 7
2 x 7 = 14
3 x 7 = 21
```

## for o while

- Usa **`for`** cuando sabes qué vas a recorrer o cuántas veces repetir.
- Usa **`while`** cuando repites hasta que ocurra algo y no sabes cuándo pasará
  (por ejemplo, hasta que el usuario acierte).

Compara la suma del 1 al 100 con cada bucle:

```python
# Con while
total = 0
n = 1
while n <= 100:
    total += n
    n += 1

# Con for: más corto y sin riesgo de olvidar el incremento
total = 0
for n in range(1, 101):
    total += n
```

`break` y `continue` funcionan igual en `for` que en `while`.

## Bucles anidados

Un bucle puede ir dentro de otro. El bucle interior se ejecuta **completo** en cada
iteración del exterior:

```python
for fila in range(1, 4):
    linea = ""
    for columna in range(1, 4):
        linea += f"{fila * columna:4}"
    print(linea)
```

```text
   1   2   3
   2   4   6
   3   6   9
```

`{valor:4}` reserva 4 espacios para cada número, así las columnas quedan alineadas.

## Buena práctica: nombres de variables

- `i`, `j` son aceptables para índices o contadores cortos.
- Para lo demás, usa nombres que digan qué es cada elemento: `for letra in palabra`,
  `for fila in range(filas)`.
- Si no necesitas la variable, la convención es usar `_`: `for _ in range(3): print("Hola")`.

## Resumen

- `for elemento in secuencia:` recorre la secuencia elemento por elemento.
- `range(inicio, fin, paso)` genera enteros; el `fin` nunca se incluye.
- Usa `for` cuando sabes qué recorrer; `while`, cuando repites hasta una condición.
- En un bucle anidado, el interior se completa en cada vuelta del exterior.
