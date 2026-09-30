---
title: Repetir con while
description: Repite instrucciones mientras se cumpla una condición y controla el bucle con break y continue.
objectives:
  - Escribir bucles while con una condición de salida clara.
  - Usar contadores y acumuladores.
  - Detener o saltar iteraciones con break y continue.
  - Reconocer y evitar bucles infinitos.
estimatedMinutes: 30
sources:
  - title: 'Referencia del lenguaje — 8.2. La sentencia while'
    url: https://docs.python.org/es/3/reference/compound_stmts.html#the-while-statement
  - title: 'Tutorial de Python — 4.4. Las sentencias break y continue'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#break-and-continue-statements
furtherReading:
  - book: manual-de-python-alf
prerequisites:
  - python/02-control-de-flujo/01-condicionales
---

## El bucle while

`while` repite un bloque **mientras** su condición sea verdadera. Antes de cada vuelta
(llamada **iteración**), Python vuelve a evaluar la condición:

```python
contador = 1

while contador <= 3:
    print(f"Vuelta {contador}")
    contador += 1

print("Terminé")
```

```text
Vuelta 1
Vuelta 2
Vuelta 3
Terminé
```

Paso a paso:

1. `contador` vale 1; `1 <= 3` es verdadero, así que se ejecuta el bloque.
2. Se imprime y `contador` pasa a 2. Se vuelve a evaluar la condición…
3. Cuando `contador` vale 4, `4 <= 3` es falso y el bucle termina.

## Bucles infinitos

Si la condición **nunca** se vuelve falsa, el bucle no termina:

```python
contador = 1
while contador <= 3:
    print(contador)
    # ¡Olvidamos contador += 1!
```

Asegúrate siempre de que algo dentro del bucle acerque la condición a ser falsa.

> En esta plataforma, si tu programa tarda demasiado, se detiene automáticamente y te lo
> avisamos. En tu computadora, puedes detener un programa con `Ctrl + C`.

## Contadores y acumuladores

Dos patrones que usarás constantemente:

- Un **contador** cuenta cuántas veces ocurre algo (`veces += 1`).
- Un **acumulador** va sumando valores (`total += valor`).

```python
# Suma de los números del 1 al 100
numero = 1
total = 0
while numero <= 100:
    total += numero
    numero += 1
print(total)  # 5050
```

## Leer datos hasta un valor centinela

`while` es ideal cuando **no sabes cuántas veces** repetir: por ejemplo, leer datos hasta
que el usuario escriba un valor especial (un **centinela**):

```python
total = 0
numero = int(input())
while numero != 0:
    total += numero
    numero = int(input())
print(f"Total: {total}")
```

Con las entradas `5`, `8` y `0`, muestra `Total: 13`.

## break y continue

- `break` **termina** el bucle de inmediato.
- `continue` **salta** al inicio de la siguiente iteración.

```python
while True:                   # bucle "infinito" a propósito…
    palabra = input("Palabra (o 'fin'): ")
    if palabra == "fin":
        break                 # …del que salimos con break
    if palabra == "":
        continue              # ignoramos las líneas vacías
    print(palabra.upper())
```

`while True` con un `break` es un patrón común cuando la condición de salida se conoce en
medio del bucle. Úsalo con cuidado: asegúrate de que el `break` siempre sea alcanzable.

## Resumen

- `while condición:` repite el bloque mientras la condición sea verdadera.
- Algo dentro del bucle debe cambiar para que termine; si no, es infinito.
- Contadores y acumuladores son los patrones básicos de los bucles.
- `break` sale del bucle; `continue` pasa a la siguiente iteración.
