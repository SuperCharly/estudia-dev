---
title: Alcance de las variables
description: Dónde existe cada variable, por qué las funciones no deberían depender de variables globales y qué pasa al modificar una lista recibida.
objectives:
  - Distinguir variables locales y globales.
  - Explicar por qué una variable local no existe fuera de su función.
  - Reconocer y corregir un UnboundLocalError.
  - Preferir parámetros y return en lugar de variables globales.
  - Saber cuándo una función modifica la lista que recibe.
estimatedMinutes: 30
sources:
  - title: 'Tutorial de Python — 9.2. Ámbitos y espacios de nombres en Python'
    url: https://docs.python.org/es/3/tutorial/classes.html#python-scopes-and-namespaces
  - title: 'Preguntas frecuentes — ¿Cuáles son las reglas para las variables locales y globales?'
    url: https://docs.python.org/es/3/faq/programming.html#what-are-the-rules-for-local-and-global-variables-in-python
  - title: 'Preguntas frecuentes — ¿Por qué obtengo un UnboundLocalError?'
    url: https://docs.python.org/es/3/faq/programming.html#why-am-i-getting-an-unboundlocalerror-when-the-variable-has-a-value
furtherReading:
  - book: think-python-es
  - book: aprende-python
prerequisites:
  - python/04-funciones/02-parametros-y-argumentos
---

## Variables locales

Las variables que se crean dentro de una función (incluidos sus parámetros) son
**locales**: existen solo mientras la función se ejecuta y solo dentro de ella.

```python
def calcular_total(precio, cantidad):
    subtotal = precio * cantidad     # subtotal es local
    return subtotal * 1.16

print(calcular_total(10, 3))
print(subtotal)    # NameError: name 'subtotal' is not defined
```

Esto es una ventaja: cada función tiene su propio "espacio de trabajo". Dos funciones
pueden usar una variable llamada `total` o `i` sin estorbarse, y no necesitas conocer el
interior de una función para usarla.

## Variables globales

Las variables creadas fuera de cualquier función son **globales**. Una función puede
**leerlas**:

```python
IVA = 0.16

def con_iva(precio):
    return precio * (1 + IVA)   # lee la variable global

print(con_iva(100))   # 116.0
```

Leer constantes globales (por convención, en MAYÚSCULAS) es habitual y está bien.

## Asignar crea una variable local

Si dentro de una función **asignas** a un nombre, Python lo trata como una variable local
nueva, aunque exista una global con el mismo nombre:

```python
contador = 10

def reiniciar():
    contador = 0        # crea una variable LOCAL llamada contador

reiniciar()
print(contador)         # 10: la global no cambió
```

Y si intentas leerla antes de asignarla, aparece un error que sorprende la primera vez:

```python
total = 0

def agregar(monto):
    total = total + monto   # UnboundLocalError

agregar(50)
```

Como hay una asignación a `total` dentro de la función, Python decide que `total` es local
en **toda** la función. Al calcular `total + monto`, esa variable local todavía no tiene
valor.

## La solución: parámetros y return

Existe la palabra `global` para modificar una variable global desde una función, pero casi
nunca es la mejor opción: una función que cambia variables externas es difícil de probar y
de entender, porque su resultado depende de algo que no se ve en la llamada.

Lo recomendable es que la función **reciba** lo que necesita y **devuelva** el resultado:

```python
def agregar(total, monto):
    return total + monto

total = 0
total = agregar(total, 50)
total = agregar(total, 30)
print(total)   # 80
```

Ahora `agregar` solo depende de sus argumentos: con las mismas entradas siempre da el mismo
resultado.

## Listas y diccionarios como argumentos

Al pasar una lista a una función no se crea una copia: el parámetro y la variable original
son **la misma lista**. Si la función la modifica (con `append`, `sort`, `remove`…), el
cambio se ve fuera:

```python
def agregar_fin(lista):
    lista.append("fin")      # modifica la lista original

tareas = ["leer"]
agregar_fin(tareas)
print(tareas)                # ['leer', 'fin']
```

En cambio, **asignar** al parámetro solo cambia a qué apunta el nombre local:

```python
def vaciar(lista):
    lista = []               # el nombre local apunta a otra lista; la original no cambia

vaciar(tareas)
print(tareas)                # ['leer', 'fin']
```

Si no quieres alterar los datos de quien te llama, construye y devuelve una lista nueva:

```python
def en_mayusculas(palabras):
    return [p.upper() for p in palabras]   # la original queda intacta
```

Es buena práctica que una función haga una de dos cosas: **modificar** lo que recibe (y no
devolver nada) o **devolver** algo nuevo (sin modificar lo que recibe), pero no ambas. Así
lo hacen `lista.sort()` (modifica y devuelve `None`) y `sorted(lista)` (devuelve una lista
nueva).

## Resumen

- Las variables creadas en una función son locales: no existen fuera de ella.
- Una función puede leer variables globales, pero asignar a un nombre crea una local.
- `UnboundLocalError` aparece al leer una variable local antes de asignarla.
- Prefiere parámetros y `return` antes que `global`.
- Las listas y los diccionarios no se copian al pasarlos: modificarlos afecta al original.
