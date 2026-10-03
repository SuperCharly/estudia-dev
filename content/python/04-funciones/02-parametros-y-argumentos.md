---
title: Parámetros y argumentos
description: Valores por defecto, argumentos por nombre y funciones que aceptan cualquier cantidad de datos.
objectives:
  - Dar valores por defecto a los parámetros.
  - Llamar a una función con argumentos posicionales y por nombre.
  - Aceptar una cantidad variable de argumentos con *args.
  - Evitar el error de usar una lista como valor por defecto.
estimatedMinutes: 35
sources:
  - title: 'Tutorial de Python — 4.9.1. Argumentos con valores por omisión'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#default-argument-values
  - title: 'Tutorial de Python — 4.9.2. Palabras clave como argumentos'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#keyword-arguments
  - title: 'Tutorial de Python — 4.9.4. Listas de argumentos arbitrarios'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#arbitrary-argument-lists
furtherReading:
  - book: aprende-python
  - book: manual-de-python-alf
prerequisites:
  - python/04-funciones/01-definir-funciones
---

## Valores por defecto

Un parámetro puede tener un **valor por defecto**, que se usa cuando no se pasa ese
argumento:

```python
def saludar(nombre, saludo="Hola"):
    return f"{saludo}, {nombre}"

print(saludar("Ana"))                  # Hola, Ana
print(saludar("Ana", "Buenas tardes")) # Buenas tardes, Ana
```

Así una misma función cubre el caso habitual (sin escribir de más) y los casos especiales.

Los parámetros con valor por defecto van **después** de los que no lo tienen:

```python
def saludar(saludo="Hola", nombre):   # SyntaxError
    ...
```

## Argumentos posicionales y por nombre

Hasta ahora has pasado los argumentos **por posición**: el primero va al primer parámetro,
el segundo al segundo, etc. También puedes pasarlos **por nombre**:

```python
def crear_usuario(nombre, edad, ciudad="Sin ciudad"):
    return f"{nombre} ({edad}) - {ciudad}"

crear_usuario("Ana", 30)                       # por posición
crear_usuario(nombre="Ana", edad=30)           # por nombre
crear_usuario(edad=30, nombre="Ana")           # por nombre, en cualquier orden
crear_usuario("Ana", 30, ciudad="Lima")        # mezcla: primero los posicionales
```

Los argumentos por nombre hacen que la llamada se entienda sin mirar la definición. Compara
`enviar("Ana", True, False)` con `enviar("Ana", urgente=True, copia=False)`.

Dos reglas al mezclarlos:

- Los posicionales van primero: `crear_usuario(nombre="Ana", 30)` es un `SyntaxError`.
- No puedes dar dos valores al mismo parámetro: `crear_usuario("Ana", nombre="Eva", edad=3)`
  es un `TypeError`.

Ya conocías este mecanismo: `print("a", "b", sep="-")` y `sorted(lista, reverse=True)` usan
argumentos por nombre.

## Cantidad variable de argumentos: \*args

Si antepones un asterisco a un parámetro, este recibe **todos los argumentos posicionales
sobrantes** empaquetados en una tupla. Por convención se le llama `args`, pero cualquier
nombre sirve:

```python
def sumar(*numeros):
    total = 0
    for n in numeros:
        total += n
    return total

print(sumar(1, 2))         # 3
print(sumar(1, 2, 3, 4))   # 10
print(sumar())             # 0  (numeros es una tupla vacía)
```

Puede combinarse con parámetros normales, que van antes:

```python
def anunciar(titulo, *lineas):
    print(titulo.upper())
    for linea in lineas:
        print("-", linea)

anunciar("Tareas", "Estudiar", "Practicar")
```

La operación inversa también existe: un asterisco en la **llamada** desempaqueta una lista
o tupla en argumentos separados.

```python
datos = [3, 4, 5]
print(sumar(*datos))   # equivale a sumar(3, 4, 5)
```

## Una trampa: listas como valor por defecto

El valor por defecto se crea **una sola vez**, cuando se define la función, no en cada
llamada. Con valores inmutables (números, textos, `None`) no importa, pero con una lista o
un diccionario sí:

```python
def agregar(elemento, lista=[]):   # ¡cuidado!
    lista.append(elemento)
    return lista

print(agregar("a"))   # ['a']
print(agregar("b"))   # ['a', 'b']  ← la misma lista de la llamada anterior
```

La solución habitual es usar `None` como valor por defecto y crear la lista dentro:

```python
def agregar(elemento, lista=None):
    if lista is None:
        lista = []
    lista.append(elemento)
    return lista
```

## Resumen

- `def f(a, b=valor)`: `b` es opcional. Los parámetros con valor por defecto van al final.
- Puedes pasar argumentos por posición o por nombre (`f(1, b=2)`); los posicionales primero.
- `*args` recibe los argumentos posicionales sobrantes en una tupla.
- Nunca uses una lista o un diccionario como valor por defecto: usa `None` y créalo dentro.
