---
title: Lanzar excepciones
description: Haz que tus funciones avisen con claridad cuando reciben datos que no pueden procesar.
objectives:
  - Lanzar una excepción con raise y un mensaje útil.
  - Elegir entre devolver un valor y lanzar una excepción.
  - Validar los argumentos al inicio de una función.
  - Capturar en el programa principal las excepciones de tus funciones.
  - Definir una excepción propia sencilla.
estimatedMinutes: 30
sources:
  - title: 'Tutorial de Python — 8.4. Lanzando excepciones'
    url: https://docs.python.org/es/3/tutorial/errors.html#raising-exceptions
  - title: 'Tutorial de Python — 8.6. Excepciones definidas por el usuario'
    url: https://docs.python.org/es/3/tutorial/errors.html#user-defined-exceptions
  - title: 'Biblioteca estándar — Excepciones incorporadas'
    url: https://docs.python.org/es/3/library/exceptions.html
furtherReading:
  - book: aprende-python
  - book: manual-de-python-alf
prerequisites:
  - python/05-errores-y-modulos/01-excepciones
---

## raise

Hasta ahora las excepciones las lanzaba Python. Con `raise` puedes lanzarlas tú cuando tu
función detecta que no puede hacer su trabajo:

```python
def raiz_cuadrada(n):
    if n < 0:
        raise ValueError("El número no puede ser negativo")
    return n ** 0.5

print(raiz_cuadrada(9))     # 3.0
print(raiz_cuadrada(-4))    # ValueError: El número no puede ser negativo
```

Se escribe `raise`, el tipo de excepción y, entre paréntesis, un **mensaje** que explique
el problema. Al igual que `return`, `raise` termina la función en ese punto; la diferencia
es que no devuelve un valor: interrumpe también a quien la llamó, y así sucesivamente,
hasta que alguien capture la excepción con `try`/`except` (o el programa se detenga).

## ¿Por qué no devolver un valor especial?

Podrías devolver `-1`, `None` o un texto como `"error"`, pero entonces:

- Quien llama puede **olvidar** revisarlo y seguir calculando con un dato absurdo.
- El valor especial puede confundirse con un resultado legítimo.

Una excepción **no puede ignorarse por accidente** y lleva un mensaje que explica qué
pasó. Como guía:

- Si es una situación **normal y esperada** (buscar algo que puede no estar), devolver
  `None` o un valor por defecto es razonable.
- Si los datos son **inválidos** y la función no puede cumplir lo que promete, lanza una
  excepción.

## Qué excepción lanzar

Usa las que ya existen cuando describan el problema:

- `ValueError`: el tipo es correcto, pero el valor no es aceptable (una edad negativa).
- `TypeError`: el tipo no es el esperado (un texto donde va un número).
- `KeyError` / `IndexError`: la clave o la posición no existe.

## Validar al principio

Un patrón muy común es comprobar los argumentos en las primeras líneas, de modo que el
resto de la función pueda asumir que los datos son correctos:

```python
def retirar(saldo, monto):
    """Devuelve el saldo que queda tras retirar el monto."""
    if monto <= 0:
        raise ValueError("El monto debe ser positivo")
    if monto > saldo:
        raise ValueError("Saldo insuficiente")
    return saldo - monto
```

## Lanzar en la función, capturar en el programa

La función detecta el problema, pero no decide qué hacer con él: eso le corresponde a
quien la llama, que conoce el contexto (¿mostrar un mensaje?, ¿volver a preguntar?,
¿usar otro valor?).

```python
try:
    saldo = retirar(saldo, monto)
    print(f"Nuevo saldo: {saldo}")
except ValueError as error:
    print(f"No se pudo retirar: {error}")
```

Por eso las funciones **no deberían mostrar el error con `print` y seguir**: quien las usa
no tendría forma de enterarse de que algo falló.

## Excepciones propias

Cuando ninguna excepción incorporada describe bien el problema, puedes definir la tuya.
Basta una línea (verás qué es una clase más adelante; por ahora, tómalo como una receta):

```python
class SaldoInsuficienteError(Exception):
    """El saldo no alcanza para la operación."""


def retirar(saldo, monto):
    if monto > saldo:
        raise SaldoInsuficienteError(f"Faltan {monto - saldo}")
    return saldo - monto
```

La ventaja es que se puede capturar **ese** problema sin confundirlo con otros:

```python
try:
    saldo = retirar(saldo, monto)
except SaldoInsuficienteError as error:
    print(f"Saldo insuficiente. {error}")
```

Por convención, el nombre termina en `Error`.

## Resumen

- `raise Tipo("mensaje")` lanza una excepción y termina la función.
- Lanza una excepción cuando los datos son inválidos; no devuelvas valores "mágicos".
- Valida los argumentos al principio de la función.
- La función lanza; el programa principal decide cómo reaccionar con `try`/`except`.
- `class MiError(Exception):` define una excepción propia.
