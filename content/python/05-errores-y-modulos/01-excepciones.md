---
title: Manejar excepciones
description: Evita que tu programa se detenga ante un error previsible con try y except.
objectives:
  - Leer un mensaje de error e identificar el tipo de excepción.
  - Capturar excepciones con try y except.
  - Capturar solo las excepciones que sabes manejar.
  - Usar else y finally.
  - Obtener el mensaje del error con as.
estimatedMinutes: 35
sources:
  - title: 'Tutorial de Python — 8. Errores y excepciones'
    url: https://docs.python.org/es/3/tutorial/errors.html
  - title: 'Tutorial de Python — 8.3. Gestionando excepciones'
    url: https://docs.python.org/es/3/tutorial/errors.html#handling-exceptions
  - title: 'Biblioteca estándar — Excepciones incorporadas'
    url: https://docs.python.org/es/3/library/exceptions.html
furtherReading:
  - book: aprende-python
  - book: think-python-es
prerequisites:
  - python/04-funciones/04-documentar-y-anotar
---

## Dos clases de errores

Los **errores de sintaxis** aparecen antes de que el programa empiece: el código está mal
escrito y Python no puede entenderlo.

```python
print("Hola"     # SyntaxError: falta cerrar el paréntesis
```

Las **excepciones** ocurren mientras el programa se ejecuta: el código está bien escrito,
pero algo sale mal con los datos concretos.

```python
edad = int("veinte")     # ValueError: invalid literal for int() with base 10: 'veinte'
```

Si nadie se ocupa de una excepción, el programa **se detiene** y muestra el error. La
última línea del mensaje dice el **tipo** de excepción y una descripción. Ya te has
encontrado con varias:

| Excepción           | Cuándo ocurre                                        |
| ------------------- | ---------------------------------------------------- |
| `ValueError`        | El valor no es válido: `int("hola")`                 |
| `TypeError`         | El tipo no es el adecuado: `"a" + 1`                 |
| `ZeroDivisionError` | División entre cero: `5 / 0`                         |
| `IndexError`        | Posición fuera de la lista: `[1, 2][5]`              |
| `KeyError`          | Clave que no existe en el diccionario: `d["x"]`      |
| `NameError`         | Nombre que no se ha definido                         |

## try y except

Para manejar una excepción, pon el código que puede fallar en un bloque `try` y lo que
debe hacerse si falla en un bloque `except`:

```python
texto = input("Edad: ")
try:
    edad = int(texto)
    print(f"El próximo año tendrás {edad + 1}.")
except ValueError:
    print("Eso no es un número entero.")
print("Fin del programa")
```

- Si no hay error, se ejecuta todo el `try` y se salta el `except`.
- Si ocurre un `ValueError`, el resto del `try` **se abandona** y se ejecuta el `except`.
- En ambos casos, el programa continúa después.

## Captura solo lo que sabes manejar

Indica siempre **qué** excepción esperas. Un `except:` sin tipo (o `except Exception:`)
captura cualquier cosa, incluidos errores que no habías previsto, como un nombre mal
escrito, y los esconde:

```python
try:
    edad = int(texto)
    print(edda + 1)          # error de dedo: NameError
except:                      # ¡mal! oculta el NameError
    print("Eso no es un número entero.")
```

El programa culparía al usuario de un error que es del código. Con `except ValueError:`
el `NameError` se mostraría y podrías corregirlo.

Puedes manejar varias excepciones, juntas o por separado:

```python
try:
    resultado = int(a) / int(b)
except ValueError:
    print("Escribe números enteros.")
except ZeroDivisionError:
    print("No se puede dividir entre cero.")
```

```python
except (ValueError, ZeroDivisionError):   # el mismo tratamiento para ambas
    print("Datos no válidos.")
```

## Obtener el mensaje del error

Con `as` guardas la excepción en una variable. Al convertirla a texto obtienes su mensaje:

```python
try:
    numero = int("12a")
except ValueError as error:
    print(f"No se pudo convertir: {error}")
# No se pudo convertir: invalid literal for int() with base 10: '12a'
```

## else y finally

Un `try` admite dos bloques opcionales más:

```python
try:
    numero = int(texto)
except ValueError:
    print("No es un número.")
else:
    print("Conversión correcta.")      # solo si NO hubo excepción
finally:
    print("Esto se ejecuta siempre.")  # con error o sin él
```

- `else` sirve para el código que depende de que el `try` haya salido bien, sin meterlo en
  el `try` (donde sus propios errores quedarían capturados por accidente).
- `finally` se usa para tareas de limpieza que deben ocurrir pase lo que pase, como cerrar
  un archivo o una conexión.

## Mantén pequeño el try

Rodea con `try` solo la operación que puede fallar. Compara, al procesar una lista:

```python
# Se detiene en el primer dato incorrecto
try:
    for texto in datos:
        total += int(texto)
except ValueError:
    print("Dato no válido")

# Omite el dato incorrecto y sigue con los demás
for texto in datos:
    try:
        total += int(texto)
    except ValueError:
        print(f"Se omite '{texto}'")
```

## Resumen

- Una excepción no manejada detiene el programa; `try`/`except` permite reaccionar.
- Captura excepciones concretas (`except ValueError:`), no todas.
- `except Tipo as error` da acceso al mensaje con `str(error)`.
- `else` se ejecuta si no hubo error; `finally`, siempre.
- Pon en el `try` solo lo que puede fallar.
