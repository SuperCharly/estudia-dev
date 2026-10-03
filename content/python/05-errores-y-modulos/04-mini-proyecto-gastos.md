---
title: 'Mini-proyecto: registro de gastos'
description: Reúne funciones, estructuras de datos, excepciones y módulos en un programa completo, construido paso a paso.
objectives:
  - Dividir un programa en funciones pequeñas con una sola responsabilidad.
  - Validar datos de entrada y lanzar excepciones con mensajes claros.
  - Procesar muchos datos sin que uno incorrecto detenga el programa.
  - Agrupar y resumir información con diccionarios.
  - Separar la lógica del programa de la entrada y la salida.
estimatedMinutes: 60
sources:
  - title: 'Tutorial de Python — 4.8. Definir funciones'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#defining-functions
  - title: 'Tutorial de Python — 8. Errores y excepciones'
    url: https://docs.python.org/es/3/tutorial/errors.html
  - title: 'Tutorial de Python — 5.5. Diccionarios'
    url: https://docs.python.org/es/3/tutorial/datastructures.html#dictionaries
  - title: 'Tutorial de Python — 7.1. Formateo elegante de la salida'
    url: https://docs.python.org/es/3/tutorial/inputoutput.html#fancier-output-formatting
furtherReading:
  - book: think-python-es
  - book: aprende-python
prerequisites:
  - python/05-errores-y-modulos/03-modulos-y-biblioteca-estandar
---

## El proyecto

Vas a construir un programa que lleva la cuenta de tus gastos. Recibe líneas como estas:

```text
comida 45.50
transporte 12
comida 30
cine
ocio -5
fin
```

y produce un informe con el total por categoría, el total general y cuántas líneas no se
pudieron leer:

```text
comida: 75.50
transporte: 12.00
Total: 87.50
Líneas con error: 2
```

Es un programa pequeño, pero tiene los ingredientes de uno real: datos que llegan con
errores, reglas que validar, información que agrupar y un resultado que presentar.

## Pensar antes de programar

La tentación es escribirlo todo seguido, en un solo bloque. Funciona hasta que algo falla
y no sabes dónde. Es mejor dividir el problema en pasos y dar a cada uno su función:

| Paso                         | Función                           | Recibe            | Devuelve                 |
| ---------------------------- | --------------------------------- | ----------------- | ------------------------ |
| Interpretar una línea        | `leer_gasto(linea)`               | un texto          | `(categoria, monto)`     |
| Procesar todas las líneas    | `procesar(lineas)`                | lista de textos   | `(gastos, errores)`      |
| Sumar por categoría          | `totales_por_categoria(gastos)`   | lista de gastos   | diccionario de totales   |
| Leer, calcular y mostrar     | programa principal                | la entrada        | el informe               |

Fíjate en dos decisiones de diseño:

- Las tres funciones **no usan `input` ni `print`**: reciben datos y devuelven datos. Por
  eso se pueden probar una a una con valores de ejemplo.
- Solo el programa principal habla con el usuario. Si mañana los gastos vinieran de un
  archivo o el informe tuviera otro formato, las funciones no cambiarían.

## Paso 1: interpretar una línea

`leer_gasto("comida 45.50")` debe devolver `("comida", 45.5)`. Hay tres cosas que pueden
salir mal, y en las tres la función lanza un `ValueError`:

- La línea no tiene exactamente dos partes (`"cine"`, `"a b c"`).
- El monto no es un número (`"comida mucho"`). Aquí `float()` ya lanza el error por ti.
- El monto es cero o negativo.

La función **no decide** qué hacer con una línea incorrecta: solo avisa.

## Paso 2: procesar sin detenerse

`procesar(lineas)` llama a `leer_gasto` con cada línea. Las correctas se guardan en una
lista de gastos; de las incorrectas se anota el **número de línea** (empezando en 1) para
poder informar al usuario. Es el patrón de la lección de excepciones: el `try` va
**dentro** del bucle.

`enumerate` es útil aquí, porque entrega la posición junto con cada elemento:

```python
for numero, linea in enumerate(lineas, start=1):
    print(numero, linea)
```

## Paso 3: agrupar

`totales_por_categoria(gastos)` recorre la lista de tuplas y acumula en un diccionario,
con el patrón `d[clave] = d.get(clave, 0) + valor` que ya conoces.

## Paso 4: el programa completo

El programa principal lee líneas hasta encontrar `fin`, llama a las funciones y muestra el
informe. Para mostrar los montos con dos decimales, usa el formato `:.2f` en un f-string:

```python
total = 87.5
print(f"Total: {total:.2f}")    # Total: 87.50
```

## Al terminar

Los cuatro primeros ejercicios construyen el programa pieza por pieza: en cada uno
encontrarás ya escritas las funciones de los pasos anteriores. El último es una propuesta
abierta para que lo amplíes por tu cuenta.

Con este proyecto completas la ruta de Python. Lo siguiente es practicar con programas
propios: es la mejor manera de afianzar lo aprendido.

## Resumen

- Divide el problema en pasos y escribe una función para cada uno.
- Las funciones que calculan no usan `input` ni `print`: así se pueden probar y reutilizar.
- Valida los datos donde entran y lanza excepciones con mensajes claros.
- Captura las excepciones donde sabes qué hacer con ellas.
- Un dato incorrecto no debería detener el procesamiento de los demás.
