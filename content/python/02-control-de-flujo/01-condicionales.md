---
title: Tomar decisiones con if
description: Ejecuta código solo cuando se cumple una condición con if, elif y else.
objectives:
  - Escribir condiciones con if, elif y else.
  - Entender el papel de la indentación en Python.
  - Saber qué valores se consideran verdaderos o falsos.
  - Usar la expresión condicional y conocer match.
estimatedMinutes: 30
sources:
  - title: 'Tutorial de Python — 4.1. La sentencia if'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#if-statements
  - title: 'Tutorial de Python — 4.7. La sentencia match'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#match-statements
  - title: 'Tipos incorporados — Evaluación del valor de verdad'
    url: https://docs.python.org/es/3/library/stdtypes.html#truth-value-testing
furtherReading:
  - book: aprende-python
  - book: think-python-es
prerequisites:
  - python/01-primeros-pasos/03-operadores
---

## La sentencia if

Hasta ahora, tus programas ejecutaban todas las líneas, una tras otra. Con `if` puedes
ejecutar un bloque de código **solo si** se cumple una condición:

```python
temperatura = 32

if temperatura > 30:
    print("Hace calor")
    print("Toma agua")

print("Fin del programa")
```

```text
Hace calor
Toma agua
Fin del programa
```

La estructura es:

1. La palabra `if`, una condición y **dos puntos** `:`.
2. Un bloque **indentado** (con sangría) que se ejecuta si la condición es verdadera.

## La indentación importa

En muchos lenguajes los bloques se marcan con llaves `{ }`. En Python se marcan con la
**indentación**: todas las líneas del bloque deben tener la misma sangría. La convención
(PEP 8) es usar **4 espacios**.

```python
if temperatura > 30:
    print("Hace calor")   # dentro del if
print("Fin")              # fuera del if: se ejecuta siempre
```

Si la indentación es inconsistente, Python muestra un `IndentationError`.

## else y elif

`else` define qué hacer cuando la condición **no** se cumple:

```python
edad = 15

if edad >= 18:
    print("Puedes votar")
else:
    print("Aún no puedes votar")
```

Para evaluar varias opciones en orden se usa `elif` (abreviatura de *else if*). Python
revisa las condiciones de arriba hacia abajo y ejecuta **solo el primer bloque** cuya
condición sea verdadera:

```python
calificacion = 85

if calificacion >= 90:
    print("Excelente")
elif calificacion >= 70:
    print("Aprobado")
elif calificacion >= 60:
    print("Suficiente")
else:
    print("Reprobado")
```

```text
Aprobado
```

Aunque `85 >= 60` también es verdadero, ese bloque no se ejecuta: ya se ejecutó el de
`>= 70`. Por eso el **orden de las condiciones importa**.

## Condiciones combinadas

Puedes usar los operadores lógicos que ya conoces:

```python
edad = 25
tiene_licencia = True

if edad >= 18 and tiene_licencia:
    print("Puede conducir")
```

Python también permite encadenar comparaciones, como en matemáticas:

```python
nota = 7
if 0 <= nota <= 10:
    print("Nota válida")
```

## Valores "verdaderos" y "falsos"

Una condición no tiene que ser un `bool`. Python considera **falsos** estos valores:
`False`, `None`, `0`, `0.0`, la cadena vacía `""` y las colecciones vacías. Todo lo demás
se considera verdadero.

```python
nombre = input("Nombre: ")
if nombre:
    print(f"Hola, {nombre}")
else:
    print("No escribiste tu nombre")
```

## La expresión condicional

Para elegir entre dos valores en una sola línea existe la **expresión condicional**:

```python
edad = 20
estado = "mayor de edad" if edad >= 18 else "menor de edad"
print(estado)  # mayor de edad
```

Úsala solo para casos simples: si la lógica crece, un `if` normal es más legible.

## Una mirada a match

Desde Python 3.10 existe `match`, que compara un valor contra varios **patrones**. Es útil
cuando comparas una misma variable con muchos valores concretos:

```python
comando = "salir"

match comando:
    case "ayuda":
        print("Mostrando ayuda")
    case "salir" | "exit":
        print("Hasta luego")
    case _:
        print("Comando desconocido")
```

`|` significa "o" y `_` atrapa cualquier otro valor. `match` puede hacer mucho más
(desempaquetar estructuras, por ejemplo); por ahora, basta con reconocerlo.

## Resumen

- `if condición:` ejecuta un bloque indentado solo si la condición es verdadera.
- `elif` evalúa otras condiciones en orden; `else` cubre todos los demás casos.
- Solo se ejecuta el **primer** bloque cuya condición se cumple.
- `0`, `""`, `None` y las colecciones vacías se consideran falsos.
- `valor_a if condición else valor_b` elige entre dos valores en una línea.
