---
title: Módulos y biblioteca estándar
description: Reutiliza código ya escrito con import y conoce algunos módulos que vienen incluidos con Python.
objectives:
  - Importar módulos con import, from … import y as.
  - Usar math, statistics, datetime, random y collections.
  - Consultar la documentación de un módulo.
  - Organizar tu propio código en módulos.
  - Separar el programa principal del código que se puede importar.
estimatedMinutes: 40
sources:
  - title: 'Tutorial de Python — 6. Módulos'
    url: https://docs.python.org/es/3/tutorial/modules.html
  - title: 'Tutorial de Python — 10. Pequeño paseo por la Biblioteca Estándar'
    url: https://docs.python.org/es/3/tutorial/stdlib.html
  - title: 'La biblioteca estándar de Python'
    url: https://docs.python.org/es/3/library/index.html
furtherReading:
  - book: aprende-python
  - book: python-manual-basico
prerequisites:
  - python/05-errores-y-modulos/02-lanzar-excepciones
---

## ¿Qué es un módulo?

Un **módulo** es un archivo de Python con funciones, constantes y otras definiciones
listas para usarse desde otros programas. Python incluye cientos de ellos: es la
**biblioteca estándar**. No hay que instalar nada, solo importarlos.

```python
import math

print(math.sqrt(16))   # 4.0
print(math.pi)         # 3.141592653589793
```

`import math` carga el módulo, y sus contenidos se usan con el prefijo `math.`. Por
convención, los `import` van al principio del archivo.

## Formas de importar

```python
import math                      # se usa como math.sqrt(16)
from math import sqrt, pi        # se usan directamente: sqrt(16)
import statistics as st          # alias: st.mean([1, 2, 3])
```

- `import modulo` es la forma más clara: al leer `math.sqrt` se sabe de dónde viene.
- `from modulo import nombre` ahorra escribir el prefijo; úsalo para pocos nombres concretos.
- `as` da un nombre más corto. Algunos alias son convenciones muy extendidas.

Evita `from math import *`: trae todos los nombres del módulo y puede reemplazar sin
avisar funciones tuyas que se llamen igual.

## math: matemáticas

```python
import math

math.sqrt(25)      # 5.0   raíz cuadrada
math.ceil(4.1)     # 5     redondea hacia arriba
math.floor(4.9)    # 4     redondea hacia abajo
math.pi            # 3.14159...
```

`ceil` es útil para preguntas como "¿cuántas cajas de 12 necesito para 50 piezas?":
`math.ceil(50 / 12)` da `5`.

## statistics: estadística básica

```python
import statistics

notas = [7, 9, 6, 10, 8]
statistics.mean(notas)      # 8      media
statistics.median(notas)    # 8      mediana (valor central una vez ordenados)
```

Si la lista está vacía, lanzan un `StatisticsError`.

## datetime: fechas

```python
from datetime import date

hoy = date.today()
examen = date(2026, 6, 15)
inicio = date.fromisoformat("2026-01-12")   # desde un texto AAAA-MM-DD

print(examen.year, examen.month, examen.day)   # 2026 6 15
print((examen - inicio).days)                  # 154
```

Restar dos fechas da una duración, y su atributo `days` es el número de días. `datetime`
tiene en cuenta la longitud de cada mes y los años bisiestos, así que no hagas esas cuentas
a mano.

## random: azar

```python
import random

random.randint(1, 6)                  # entero entre 1 y 6, ambos incluidos
random.choice(["piedra", "papel"])    # un elemento al azar
random.shuffle(lista)                 # desordena la lista
```

## collections.Counter: contar

En el módulo de estructuras de datos contaste palabras con un diccionario. `Counter` lo
hace por ti:

```python
from collections import Counter

conteo = Counter("el sol y el mar y el cielo".split())
print(conteo["el"])             # 3
print(conteo.most_common(2))    # [('el', 3), ('y', 2)]
```

`most_common(n)` devuelve los `n` elementos más frecuentes como tuplas `(elemento, veces)`.

## Cómo saber qué hay en un módulo

- `help(math)` y `help(math.ceil)` muestran la documentación.
- `dir(math)` lista los nombres que contiene.
- La documentación oficial describe cada módulo con ejemplos.

Antes de escribir una función de uso general, busca en la biblioteca estándar: es muy
probable que ya exista, probada y bien documentada.

## Tus propios módulos

Cualquier archivo `.py` tuyo es un módulo. Si guardas esto en `geometria.py`:

```python
def area_rectangulo(base, altura):
    return base * altura
```

desde otro archivo de la misma carpeta puedes escribir:

```python
import geometria

print(geometria.area_rectangulo(3, 4))
```

Así se dividen los programas grandes en archivos manejables. Dos advertencias:

- **No llames a tus archivos como un módulo estándar**. Si creas `random.py`,
  `import random` cargará tu archivo en lugar del módulo de Python.
- Al importar un módulo se ejecuta todo su código. Si tiene pruebas o un programa
  principal, se ejecutarían también al importarlo.

Para lo segundo existe este patrón:

```python
def area_rectangulo(base, altura):
    return base * altura

if __name__ == "__main__":
    # Solo se ejecuta al lanzar este archivo directamente, no al importarlo
    print(area_rectangulo(3, 4))
```

La variable `__name__` vale `"__main__"` cuando el archivo se ejecuta como programa, y el
nombre del módulo cuando se importa.

> En esta plataforma cada ejercicio es un solo archivo, así que practicarás con los
> módulos de la biblioteca estándar. Para crear tus propios módulos necesitas Python
> instalado en tu computadora.

## Resumen

- `import modulo`, `from modulo import nombre` e `import modulo as alias`.
- La biblioteca estándar ya viene con Python: `math`, `statistics`, `datetime`, `random`, `collections`…
- `help()` y la documentación oficial te dicen qué ofrece cada módulo.
- Cada archivo `.py` es un módulo; no uses nombres de módulos estándar para tus archivos.
- `if __name__ == "__main__":` separa el programa principal de lo que se puede importar.
