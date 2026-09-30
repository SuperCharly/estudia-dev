---
title: Conjuntos y comprensiones
description: Elimina duplicados y compara colecciones con conjuntos; crea listas y diccionarios en una línea con comprensiones.
objectives:
  - Crear conjuntos y usarlos para eliminar duplicados.
  - Calcular uniones, intersecciones y diferencias.
  - Escribir comprensiones de listas con y sin filtro.
  - Escribir comprensiones de diccionarios y conjuntos.
estimatedMinutes: 30
sources:
  - title: 'Tutorial de Python — 5.4. Conjuntos'
    url: https://docs.python.org/es/3/tutorial/datastructures.html#sets
  - title: 'Tutorial de Python — 5.1.3. Comprensión de listas'
    url: https://docs.python.org/es/3/tutorial/datastructures.html#list-comprehensions
  - title: 'Tipos incorporados — Tipos de conjuntos'
    url: https://docs.python.org/es/3/library/stdtypes.html#set-types-set-frozenset
furtherReading:
  - book: think-python-es
prerequisites:
  - python/03-estructuras-de-datos/03-diccionarios
---

## Conjuntos

Un **conjunto** (`set`) es una colección **sin orden** y **sin elementos repetidos**:

```python
colores = {"rojo", "verde", "rojo", "azul"}
print(colores)        # {'verde', 'azul', 'rojo'} (el orden puede variar)
print(len(colores))   # 3
```

Para crear un conjunto vacío usa `set()`: `{}` crea un diccionario vacío.

### Eliminar duplicados

El uso más común: convertir una lista en conjunto elimina los repetidos.

```python
numeros = [3, 1, 3, 2, 1]
unicos = set(numeros)          # {1, 2, 3}
ordenados = sorted(unicos)     # [1, 2, 3]
```

Como los conjuntos no tienen orden, no se accede a sus elementos por índice. Si necesitas
un orden, conviértelo en lista ordenada con `sorted()`.

### Búsquedas rápidas

`elemento in conjunto` es muy rápido, incluso con millones de elementos, mientras que
`in` en una lista revisa los elementos uno por uno. Si vas a buscar muchas veces en una
colección grande, conviértela en conjunto.

### Operaciones de conjuntos

```python
a = {1, 2, 3, 4}
b = {3, 4, 5}

print(a | b)   # {1, 2, 3, 4, 5}  unión: en a o en b
print(a & b)   # {3, 4}           intersección: en a y en b
print(a - b)   # {1, 2}           diferencia: en a pero no en b
print(a ^ b)   # {1, 2, 5}        diferencia simétrica: en uno solo
```

Para modificar un conjunto: `add(x)` agrega y `discard(x)` elimina (sin error si no está).

## Comprensiones de listas

Una **comprensión** crea una lista a partir de otra secuencia en una sola línea. Compara:

```python
# Con un bucle
cuadrados = []
for n in range(1, 6):
    cuadrados.append(n ** 2)

# Con una comprensión
cuadrados = [n ** 2 for n in range(1, 6)]   # [1, 4, 9, 16, 25]
```

Se lee casi como en español: "`n ** 2` **para cada** `n` **en** `range(1, 6)`".

### Con filtro

Agrega un `if` al final para conservar solo algunos elementos:

```python
pares = [n for n in range(1, 11) if n % 2 == 0]          # [2, 4, 6, 8, 10]
largas = [p for p in ["sol", "estrella", "luz"] if len(p) > 3]  # ['estrella']
```

Ahora entiendes la línea que usamos para leer números: `[int(x) for x in input().split()]`
convierte cada palabra de la entrada en un entero.

## Comprensiones de diccionarios y conjuntos

La misma idea funciona con llaves:

```python
palabras = ["sol", "luna", "mar"]
longitudes = {p: len(p) for p in palabras}   # {'sol': 3, 'luna': 4, 'mar': 3}
iniciales = {p[0] for p in palabras}          # {'s', 'l', 'm'}
```

## Buena práctica

Las comprensiones son ideales para transformaciones y filtros **simples**. Si necesitas
varias condiciones, bucles anidados o efectos como `print`, un bucle normal es más legible.

## Resumen

- Un `set` no tiene orden ni duplicados; `set(lista)` elimina repetidos.
- `|`, `&`, `-` y `^` calculan unión, intersección, diferencia y diferencia simétrica.
- `[expr for x in secuencia if condición]` crea una lista en una línea.
- `{clave: valor for ...}` y `{expr for ...}` crean diccionarios y conjuntos.
