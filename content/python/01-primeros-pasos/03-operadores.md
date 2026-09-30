---
title: Operadores
description: Haz cálculos, compara valores y combina condiciones.
objectives:
  - Usar los operadores aritméticos, incluidos //, % y **.
  - Comparar valores y obtener resultados booleanos.
  - Combinar condiciones con and, or y not.
  - Conocer el orden de precedencia de los operadores.
estimatedMinutes: 25
sources:
  - title: 'Tutorial de Python — 3.1.1. Números'
    url: https://docs.python.org/es/3/tutorial/introduction.html#numbers
  - title: 'Referencia del lenguaje — 6.17. Precedencia de operadores'
    url: https://docs.python.org/es/3/reference/expressions.html#operator-precedence
  - title: 'Tipos incorporados — Operaciones booleanas'
    url: https://docs.python.org/es/3/library/stdtypes.html#boolean-operations-and-or-not
furtherReading:
  - book: python-manual-basico
prerequisites:
  - python/01-primeros-pasos/02-variables-y-tipos
---

## Operadores aritméticos

| Operador | Operación          | Ejemplo    | Resultado |
| -------- | ------------------ | ---------- | --------- |
| `+`      | Suma               | `7 + 2`    | `9`       |
| `-`      | Resta              | `7 - 2`    | `5`       |
| `*`      | Multiplicación     | `7 * 2`    | `14`      |
| `/`      | División           | `7 / 2`    | `3.5`     |
| `//`     | División entera    | `7 // 2`   | `3`       |
| `%`      | Módulo (residuo)   | `7 % 2`    | `1`       |
| `**`     | Potencia           | `7 ** 2`   | `49`      |

Dos detalles importantes:

- `/` **siempre** devuelve un `float`, aunque la división sea exacta: `6 / 2` es `3.0`.
- `//` redondea hacia abajo (hacia menos infinito): `-7 // 2` es `-4`, no `-3`.

### El operador módulo `%`

`%` devuelve el residuo de una división. Es muy útil para saber si un número es
divisible entre otro:

```python
print(10 % 2)  # 0 → 10 es par
print(7 % 2)   # 1 → 7 es impar
print(15 % 5)  # 0 → 15 es múltiplo de 5
```

### Operadores con asignación

Para actualizar una variable existe una forma abreviada:

```python
saldo = 100
saldo += 50   # equivale a saldo = saldo + 50
saldo -= 30   # equivale a saldo = saldo - 30
print(saldo)  # 120
```

## Operadores de comparación

Comparan dos valores y devuelven un `bool` (`True` o `False`):

| Operador | Significado       |
| -------- | ----------------- |
| `==`     | Igual a           |
| `!=`     | Distinto de       |
| `<`      | Menor que         |
| `>`      | Mayor que         |
| `<=`     | Menor o igual que |
| `>=`     | Mayor o igual que |

```python
edad = 20
print(edad >= 18)   # True
print(edad == 21)   # False
```

**Cuidado:** `=` asigna y `==` compara. Confundirlos es uno de los errores más comunes.

## Operadores lógicos

Combinan condiciones:

- `a and b` es `True` solo si **ambas** son verdaderas.
- `a or b` es `True` si **al menos una** es verdadera.
- `not a` invierte el valor.

```python
edad = 20
tiene_boleto = True

print(edad >= 18 and tiene_boleto)  # True
print(edad < 12 or edad > 65)       # False
print(not tiene_boleto)             # False
```

## Precedencia

Como en matemáticas, algunos operadores se evalúan antes que otros. De mayor a menor:
`**`, luego `*`, `/`, `//`, `%`, luego `+`, `-`, después las comparaciones y al final
`not`, `and` y `or`.

```python
print(2 + 3 * 4)    # 14, no 20
print((2 + 3) * 4)  # 20
```

**Buena práctica:** si dudas, usa paréntesis. Hacen tu intención explícita y el código más
fácil de leer.

## Resumen

- `/` da decimales; `//` da la parte entera; `%` da el residuo.
- Las comparaciones devuelven `True` o `False`.
- `and`, `or` y `not` combinan condiciones.
- Usa paréntesis para dejar clara la precedencia.
