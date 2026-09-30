---
title: Diccionarios
description: Asocia claves con valores para buscar información por nombre en lugar de por posición.
objectives:
  - Crear diccionarios y acceder a sus valores por clave.
  - Agregar, modificar y eliminar pares clave-valor.
  - Evitar el KeyError con in y get().
  - Recorrer claves, valores y pares con items().
  - Usar un diccionario para contar o agrupar.
estimatedMinutes: 35
sources:
  - title: 'Tutorial de Python — 5.5. Diccionarios'
    url: https://docs.python.org/es/3/tutorial/datastructures.html#dictionaries
  - title: 'Tipos incorporados — Tipos mapa: dict'
    url: https://docs.python.org/es/3/library/stdtypes.html#mapping-types-dict
furtherReading:
  - book: aprende-python
  - book: python-manual-basico
prerequisites:
  - python/03-estructuras-de-datos/02-tuplas
---

## Buscar por nombre, no por posición

En una lista buscas por posición: `notas[2]`. Pero muchas veces quieres buscar por un
**nombre**: el precio *del café*, el teléfono *de Ana*. Para eso existe el **diccionario**,
que asocia **claves** con **valores**:

```python
precios = {"café": 45, "té": 30, "pan": 12}
print(precios["café"])   # 45
```

- Se escribe entre llaves `{}`, con pares `clave: valor` separados por comas.
- Las claves deben ser **únicas** e **inmutables** (textos, números o tuplas).
- Los valores pueden ser de cualquier tipo, incluso listas u otros diccionarios.
- Conservan el orden en que se insertaron los elementos (desde Python 3.7).

## Agregar, modificar y eliminar

```python
precios = {"café": 45, "té": 30}
precios["pan"] = 12        # agrega una clave nueva
precios["café"] = 48       # modifica una existente
del precios["té"]          # elimina una clave
print(precios)             # {'café': 48, 'pan': 12}
print(len(precios))        # 2
```

La misma sintaxis `dic[clave] = valor` sirve para agregar y para modificar: si la clave
existe, se reemplaza su valor; si no, se crea.

## Claves que no existen

Leer una clave inexistente produce un `KeyError`:

```python
precios["jugo"]   # KeyError: 'jugo'
```

Hay dos formas de evitarlo:

```python
if "jugo" in precios:          # in revisa las claves
    print(precios["jugo"])

print(precios.get("jugo"))     # None
print(precios.get("jugo", 0))  # 0: valor por defecto
```

## Recorrer un diccionario

```python
precios = {"café": 45, "té": 30, "pan": 12}

for producto in precios:                 # recorre las claves
    print(producto)

for precio in precios.values():          # recorre los valores
    print(precio)

for producto, precio in precios.items():  # recorre pares (clave, valor)
    print(f"{producto}: ${precio}")
```

`items()` entrega tuplas que se desempaquetan en el `for`, como aprendiste en la lección
anterior.

## Patrón: contar

Los diccionarios son perfectos para contar cuántas veces aparece cada cosa:

```python
frase = "el sol y el mar y el cielo"
conteo = {}
for palabra in frase.split():
    conteo[palabra] = conteo.get(palabra, 0) + 1
print(conteo)
# {'el': 3, 'sol': 1, 'y': 2, 'mar': 1, 'cielo': 1}
```

`conteo.get(palabra, 0)` devuelve el conteo actual, o 0 si la palabra aún no está.

## Patrón: agrupar

Un valor también puede ser una lista, lo que permite agrupar elementos:

```python
nombres = ["Ana", "Luis", "Alma", "Lía"]
por_inicial = {}
for nombre in nombres:
    inicial = nombre[0]
    if inicial not in por_inicial:
        por_inicial[inicial] = []
    por_inicial[inicial].append(nombre)
print(por_inicial)   # {'A': ['Ana', 'Alma'], 'L': ['Luis', 'Lía']}
```

## Resumen

- Un diccionario asocia claves únicas con valores: `{"clave": valor}`.
- `dic[clave] = valor` agrega o modifica; `del dic[clave]` elimina.
- Usa `in` o `get()` para no provocar un `KeyError`.
- `items()` recorre pares clave-valor.
- Contar y agrupar son dos de los usos más comunes de los diccionarios.
