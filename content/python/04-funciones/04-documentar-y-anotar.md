---
title: Documentar y anotar funciones
description: Explica qué hace cada función con docstrings, indica los tipos esperados con anotaciones y pasa funciones como argumento.
objectives:
  - Escribir docstrings siguiendo las convenciones de Python.
  - Consultar la documentación de una función con help().
  - Anotar los tipos de los parámetros y del valor devuelto.
  - Entender que las anotaciones no validan los tipos al ejecutar.
  - Pasar una función como argumento (key) y escribir funciones lambda sencillas.
estimatedMinutes: 35
sources:
  - title: 'Tutorial de Python — 4.9.7. Cadenas de texto de documentación'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#documentation-strings
  - title: 'Tutorial de Python — 4.9.8. Anotación de funciones'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#function-annotations
  - title: 'Tutorial de Python — 4.9.6. Expresiones lambda'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#lambda-expressions
  - title: 'Biblioteca estándar — typing: soporte para indicadores de tipo'
    url: https://docs.python.org/es/3/library/typing.html
furtherReading:
  - book: aprende-python
  - book: manual-de-python-alf
prerequisites:
  - python/04-funciones/03-alcance-de-variables
---

## Docstrings

Un **docstring** es un texto entre comillas triples que se escribe como **primera línea del
cuerpo** de una función y explica qué hace:

```python
def area_circulo(radio):
    """Devuelve el área de un círculo a partir de su radio."""
    return 3.14159 * radio ** 2
```

No es un comentario cualquiera: Python lo guarda y lo muestra cuando alguien pide ayuda
sobre la función.

```python
help(area_circulo)            # muestra la firma y el docstring
print(area_circulo.__doc__)   # el texto del docstring
```

Convenciones habituales:

- La primera línea es un **resumen breve**, que empieza con mayúscula y termina en punto.
- Describe **qué** hace la función y qué devuelve, no cómo lo hace línea por línea.
- Si hace falta más detalle, deja una línea en blanco y continúa:

```python
def precio_final(precio, descuento=0):
    """Devuelve el precio con el descuento aplicado.

    El descuento es un porcentaje entre 0 y 100. El resultado se redondea
    a dos decimales.
    """
    return round(precio * (1 - descuento / 100), 2)
```

## Anotaciones de tipo

Las **anotaciones** (o *type hints*) indican qué tipo de dato espera cada parámetro y qué
tipo devuelve la función:

```python
def precio_final(precio: float, descuento: float = 0) -> float:
    """Devuelve el precio con el descuento aplicado."""
    return round(precio * (1 - descuento / 100), 2)
```

- Tras cada parámetro: dos puntos y el tipo (`precio: float`). El valor por defecto va
  después (`descuento: float = 0`).
- Tras los paréntesis: `->` y el tipo del valor devuelto. Si no devuelve nada, `-> None`.

Para las colecciones se indica también el tipo de sus elementos:

```python
def promedio(notas: list[float]) -> float: ...
def contar(palabras: list[str]) -> dict[str, int]: ...
def buscar(nombre: str) -> str | None: ...     # devuelve un texto o None
```

### Las anotaciones no validan

Python **no comprueba** las anotaciones al ejecutar el programa:

```python
def doble(n: int) -> int:
    return n * 2

print(doble("ja"))   # jaja: no hay error
```

Entonces, ¿para qué sirven? Documentan la función de forma precisa, permiten que el editor
te autocomplete y te avise de errores antes de ejecutar, y existen herramientas (como
`mypy` o `pyright`) que revisan todo el programa a partir de ellas. Python las guarda en el
atributo `__annotations__` de la función.

## Funciones como valores

En Python una función es un valor más: puedes guardarla en una variable o **pasarla como
argumento** a otra función. Fíjate en que se pasa el nombre **sin paréntesis** (con
paréntesis la estarías llamando):

```python
palabras = ["manzana", "kiwi", "pera"]
print(sorted(palabras, key=len))   # ['kiwi', 'pera', 'manzana']
```

El parámetro `key` de `sorted`, `min` y `max` recibe una función que se aplica a cada
elemento para decidir por qué valor se compara. Puedes pasar una función tuya:

```python
def precio(producto):
    return producto[1]

productos = [("pan", 12), ("café", 45), ("té", 30)]
print(sorted(productos, key=precio))    # ordena por precio
print(max(productos, key=precio))       # ('café', 45)
```

## Funciones lambda

Para funciones tan cortas que solo calculan una expresión existe una forma abreviada,
`lambda`, que crea una función sin nombre:

```python
sorted(productos, key=lambda producto: producto[1])
```

`lambda parametros: expresion` equivale a una función que devuelve esa expresión. Úsala
solo para casos simples como este; si la lógica crece, una función con `def`, nombre y
docstring se lee mejor.

## Resumen

- El docstring va entre comillas triples como primera línea del cuerpo y resume qué hace la función.
- `help(funcion)` muestra su documentación.
- Las anotaciones (`parametro: tipo`, `-> tipo`) documentan los tipos, pero Python no los valida al ejecutar.
- Las funciones son valores: pueden pasarse como argumento, por ejemplo en `key`.
- `lambda` crea funciones pequeñas de una sola expresión.
