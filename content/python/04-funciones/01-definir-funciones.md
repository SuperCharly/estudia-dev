---
title: Definir funciones
description: Agrupa instrucciones bajo un nombre para reutilizarlas, y devuelve resultados con return.
objectives:
  - Definir una función con def y llamarla.
  - Pasar datos a una función mediante parámetros.
  - Devolver un resultado con return.
  - Distinguir entre devolver un valor y mostrarlo con print.
  - Dividir un problema en funciones pequeñas.
estimatedMinutes: 35
sources:
  - title: 'Tutorial de Python — 4.8. Definir funciones'
    url: https://docs.python.org/es/3/tutorial/controlflow.html#defining-functions
  - title: 'Referencia del lenguaje — La sentencia return'
    url: https://docs.python.org/es/3/reference/simple_stmts.html#the-return-statement
furtherReading:
  - book: aprende-python
  - book: think-python-es
prerequisites:
  - python/03-estructuras-de-datos/04-conjuntos-y-comprensiones
---

## ¿Por qué funciones?

Ya has usado muchas funciones: `print()`, `len()`, `input()`, `sorted()`. Cada una es un
bloque de código con nombre que alguien escribió una vez y que tú reutilizas sin pensar en
cómo está hecho por dentro.

Tú también puedes crear las tuyas. Sirven para:

- **No repetir código**: escribes la lógica una vez y la usas muchas veces.
- **Dar nombre a las ideas**: `calcular_total(carrito)` se entiende mejor que diez líneas sueltas.
- **Probar por partes**: una función pequeña se comprueba fácilmente por separado.

## Definir y llamar

Una función se **define** con `def` y se **llama** escribiendo su nombre con paréntesis:

```python
def saludar():
    print("¡Hola!")
    print("Bienvenida al curso.")

saludar()   # ejecuta el cuerpo de la función
saludar()   # y otra vez
```

- La línea `def` termina en dos puntos y el cuerpo va **indentado**, igual que en `if` o `for`.
- Definir una función no la ejecuta: solo la crea. El cuerpo se ejecuta al llamarla.
- La función debe estar definida **antes** de la línea que la llama.

## Parámetros

Los **parámetros** son variables que reciben los datos que le pasas a la función. Los
valores concretos que pasas al llamarla se llaman **argumentos**:

```python
def saludar(nombre):              # nombre es un parámetro
    print(f"¡Hola, {nombre}!")

saludar("Ana")                    # "Ana" es un argumento
saludar("Luis")
```

Puede haber varios parámetros, separados por comas. Los argumentos se asignan en orden:

```python
def presentar(nombre, ciudad):
    print(f"{nombre} vive en {ciudad}.")

presentar("Ana", "Lima")   # Ana vive en Lima.
```

## Devolver un resultado: return

La mayoría de las funciones útiles no muestran nada: **calculan un valor y lo devuelven**
a quien las llamó. Para eso sirve `return`:

```python
def area_rectangulo(base, altura):
    return base * altura

a = area_rectangulo(3, 4)      # a vale 12
print(a + 1)                   # 13
print(area_rectangulo(2, 5))   # 10
```

La llamada `area_rectangulo(3, 4)` "se convierte" en el valor devuelto, así que puedes
guardarlo en una variable, usarlo en una operación o pasarlo a otra función.

`return` además **termina la función** en ese punto. Lo que haya después no se ejecuta:

```python
def clasificar(edad):
    if edad >= 18:
        return "adulto"
    return "menor"      # solo se llega aquí si edad < 18
```

## return no es print

Es la confusión más común al empezar:

```python
def doble_mostrado(n):
    print(n * 2)        # lo muestra en pantalla y no devuelve nada

def doble(n):
    return n * 2        # lo devuelve; no muestra nada

x = doble(5)            # x vale 10
y = doble_mostrado(5)   # muestra 10, pero y vale None
```

Una función sin `return` (o con un `return` sin valor) devuelve `None`. Como regla general:
**las funciones calculan y devuelven; el programa principal decide qué mostrar**. Así la
misma función sirve para mostrar el resultado, guardarlo o seguir calculando con él.

## Devolver varios valores

Para devolver más de un valor, sepáralos con comas: Python los empaqueta en una tupla que
puedes desempaquetar al recibirla.

```python
def dividir(a, b):
    return a // b, a % b

cociente, resto = dividir(17, 5)   # 3 y 2
```

## Funciones que usan funciones

Una función puede llamar a otras. Así se construyen programas grandes a partir de piezas
pequeñas:

```python
def promedio(numeros):
    return sum(numeros) / len(numeros)

def aprobo(notas):
    return promedio(notas) >= 6

print(aprobo([7, 5, 8]))   # True
```

## Resumen

- `def nombre(parametros):` define una función; `nombre(argumentos)` la llama.
- `return` devuelve un valor y termina la función. Sin `return`, la función devuelve `None`.
- `print` muestra en pantalla; `return` entrega el valor a quien llamó.
- Puedes devolver varios valores separados por comas (una tupla).
- Divide los problemas en funciones pequeñas con nombres claros.
