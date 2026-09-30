---
title: Listas
description: Guarda varios valores en orden, accede a ellos por posición y modifícalos.
objectives:
  - Crear listas y acceder a sus elementos con índices y rebanadas.
  - Agregar, insertar y eliminar elementos.
  - Recorrer listas y resumirlas con len, sum, min y max.
  - Entender que las listas son mutables y qué implica asignarlas a otra variable.
estimatedMinutes: 35
sources:
  - title: 'Tutorial de Python — 3.1.3. Listas'
    url: https://docs.python.org/es/3/tutorial/introduction.html#lists
  - title: 'Tutorial de Python — 5.1. Más sobre listas'
    url: https://docs.python.org/es/3/tutorial/datastructures.html#more-on-lists
  - title: 'Tipos incorporados — Operaciones comunes de secuencias'
    url: https://docs.python.org/es/3/library/stdtypes.html#common-sequence-operations
furtherReading:
  - book: aprende-python
  - book: think-python-es
prerequisites:
  - python/02-control-de-flujo/03-bucle-for
---

## ¿Qué es una lista?

Una **lista** guarda varios valores **en orden** dentro de una sola variable. Se escribe
entre corchetes, con los elementos separados por comas:

```python
frutas = ["manzana", "pera", "uva"]
numeros = [4, 8, 15, 16, 23, 42]
vacia = []
mezcla = ["Ada", 36, True]   # puede mezclar tipos, aunque no es lo habitual
```

## Acceder por posición

Cada elemento tiene un **índice**, que empieza en **0**. Los índices negativos cuentan
desde el final:

```python
frutas = ["manzana", "pera", "uva"]
print(frutas[0])    # manzana
print(frutas[2])    # uva
print(frutas[-1])   # uva (el último)
print(len(frutas))  # 3
```

Pedir un índice que no existe (`frutas[3]`) produce un `IndexError`.

### Rebanadas

Con `lista[inicio:fin]` obtienes una **rebanada** (*slice*): una nueva lista desde
`inicio` hasta `fin`, **sin incluir** `fin`, igual que en `range`:

```python
numeros = [10, 20, 30, 40, 50]
print(numeros[1:3])   # [20, 30]
print(numeros[:2])    # [10, 20]      (desde el principio)
print(numeros[3:])    # [40, 50]      (hasta el final)
print(numeros[::-1])  # [50, 40, 30, 20, 10]  (invertida)
```

## Modificar una lista

Las listas son **mutables**: puedes cambiarlas después de crearlas.

```python
compras = ["leche", "huevos"]
compras[0] = "leche deslactosada"  # reemplaza un elemento
compras.append("pan")              # agrega al final
compras.insert(0, "café")          # inserta en la posición 0
compras.remove("huevos")           # elimina la primera aparición de un valor
ultimo = compras.pop()             # quita y devuelve el último ("pan")
print(compras)                     # ['café', 'leche deslactosada']
```

## Recorrer y resumir

Una lista es una secuencia, así que se recorre con `for`:

```python
notas = [90, 75, 88]
for nota in notas:
    print(nota)
```

Para listas de números hay funciones que te ahorran el bucle:

```python
print(sum(notas))              # 253
print(min(notas), max(notas))  # 75 90
print(sum(notas) / len(notas)) # 84.333...
print(88 in notas)             # True: el operador in busca un valor
```

## Ordenar

- `sorted(lista)` devuelve una **nueva** lista ordenada y deja la original igual.
- `lista.sort()` ordena la lista **en su lugar** (la modifica) y devuelve `None`.

```python
numeros = [3, 1, 2]
ordenados = sorted(numeros)          # [1, 2, 3]; numeros sigue [3, 1, 2]
numeros.sort(reverse=True)           # numeros ahora es [3, 2, 1]
```

Un error común es escribir `numeros = numeros.sort()`: la variable queda en `None`.

## De texto a lista

`split()` separa un texto en una lista de palabras; `join()` hace lo contrario:

```python
palabras = "hola mundo cruel".split()   # ['hola', 'mundo', 'cruel']
print("-".join(palabras))               # hola-mundo-cruel
```

Para leer varios números escritos en una sola línea, se convierte cada palabra a entero:

```python
numeros = [int(x) for x in input().split()]  # "4 8 15" → [4, 8, 15]
```

Esta forma compacta se llama **comprensión de listas**; la verás a fondo en la última
lección del módulo.

## Cuidado: dos nombres, una lista

Asignar una lista a otra variable **no la copia**: ambos nombres apuntan a la misma lista.

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)   # [1, 2, 3, 4]  ¡a también cambió!
```

Si necesitas una copia independiente, usa `a.copy()` o `a[:]`.

## Resumen

- Las listas guardan valores en orden; los índices empiezan en 0 y `-1` es el último.
- `lista[inicio:fin]` crea una rebanada sin incluir `fin`.
- `append`, `insert`, `remove` y `pop` modifican la lista.
- `sorted()` crea una lista nueva; `.sort()` modifica la original.
- `b = a` no copia la lista: usa `a.copy()`.
