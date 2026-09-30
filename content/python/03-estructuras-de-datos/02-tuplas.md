---
title: Tuplas y desempaquetado
description: Agrupa datos que no cambian, desempaquétalos en variables y recorre secuencias con enumerate y zip.
objectives:
  - Crear tuplas y entender en qué se diferencian de las listas.
  - Desempaquetar secuencias en varias variables.
  - Recorrer una secuencia junto con su posición usando enumerate.
  - Recorrer varias secuencias a la vez con zip.
estimatedMinutes: 25
sources:
  - title: 'Tutorial de Python — 5.3. Tuplas y secuencias'
    url: https://docs.python.org/es/3/tutorial/datastructures.html#tuples-and-sequences
  - title: 'Tutorial de Python — 5.6. Técnicas de iteración'
    url: https://docs.python.org/es/3/tutorial/datastructures.html#looping-techniques
  - title: 'Funciones incorporadas — enumerate() y zip()'
    url: https://docs.python.org/es/3/library/functions.html#enumerate
furtherReading:
  - book: manual-de-python-alf
prerequisites:
  - python/03-estructuras-de-datos/01-listas
---

## Tuplas

Una **tupla** es como una lista, pero **inmutable**: una vez creada no se puede
modificar. Se escribe con paréntesis:

```python
punto = (3, 4)
color = ("rojo", 255, 0, 0)
print(punto[0])    # 3
print(len(color))  # 4
```

Intentar cambiarla produce un error:

```python
punto[0] = 10
```

```text
TypeError: 'tuple' object does not support item assignment
```

### ¿Cuándo usar una tupla?

- Para datos que **van juntos y no deben cambiar**: coordenadas `(x, y)`, una fecha
  `(2026, 9, 30)`, un color RGB.
- Una lista suele contener elementos del mismo tipo que pueden aumentar o disminuir
  (una lista de notas); una tupla, un registro con posiciones de significado fijo.

Detalle curioso: una tupla de un solo elemento necesita una coma final: `(5,)`. Sin ella,
`(5)` es solo el número 5 entre paréntesis.

## Desempaquetado

Puedes asignar los elementos de una secuencia a varias variables en una sola línea:

```python
punto = (3, 4)
x, y = punto
print(x, y)   # 3 4

nombre, edad = ["Ada", 36]   # también funciona con listas
```

La cantidad de variables debe coincidir con la cantidad de elementos; si no, se produce un
`ValueError`.

### Intercambiar variables

El desempaquetado permite intercambiar valores sin variable auxiliar:

```python
a, b = 1, 2
a, b = b, a
print(a, b)   # 2 1
```

## enumerate: posición y valor

Cuando necesitas el índice de cada elemento, no hace falta un contador manual.
`enumerate` entrega pares `(posición, valor)` que se desempaquetan en el `for`:

```python
frutas = ["manzana", "pera", "uva"]
for i, fruta in enumerate(frutas, start=1):
    print(f"{i}. {fruta}")
```

```text
1. manzana
2. pera
3. uva
```

Sin `start`, la numeración empieza en 0.

## zip: recorrer en paralelo

`zip` junta varias secuencias elemento por elemento:

```python
nombres = ["Ana", "Luis", "Marta"]
notas = [90, 85, 77]
for nombre, nota in zip(nombres, notas):
    print(f"{nombre}: {nota}")
```

```text
Ana: 90
Luis: 85
Marta: 77
```

Si las secuencias tienen distinto largo, `zip` se detiene en la más corta.

## Resumen

- Las tuplas `( )` son secuencias inmutables, ideales para registros fijos.
- `x, y = secuencia` desempaqueta; `a, b = b, a` intercambia valores.
- `enumerate(secuencia, start=1)` entrega posición y valor.
- `zip(a, b)` recorre varias secuencias a la vez.
