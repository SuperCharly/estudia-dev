---
title: Tu primera consulta con SELECT
description: Qué es una base de datos relacional y cómo leer datos de una tabla.
objectives:
  - Entender qué son las tablas, filas y columnas.
  - Leer todas las columnas o solo algunas con SELECT.
  - Calcular columnas nuevas y renombrarlas con AS.
estimatedMinutes: 20
sources:
  - title: 'PostgreSQL — 2.5. Querying a Table'
    url: https://www.postgresql.org/docs/current/tutorial-select.html
  - title: 'PostgreSQL — 7.3. Select Lists (Column Labels)'
    url: https://www.postgresql.org/docs/current/queries-select-lists.html#QUERIES-COLUMN-LABELS
furtherReading:
  - book: sql-apuntes-basicos
  - book: bases-de-datos-relacionales
---

## Bases de datos relacionales

Una **base de datos relacional** organiza la información en **tablas**. Cada tabla se
parece a una hoja de cálculo:

- Cada **columna** representa un dato con un nombre y un tipo (texto, número, fecha…).
- Cada **fila** es un registro: un producto, un cliente, un pedido.

**SQL** (*Structured Query Language*) es el lenguaje estándar para consultar y modificar
estas bases de datos. En esta sección usamos **PostgreSQL**, uno de los motores de base de
datos de código abierto más usados, que corre directamente en tu navegador.

Durante el módulo trabajaremos con la tabla `productos` de una tienda:

| id | nombre          | categoria   | precio | stock | activo |
| -- | --------------- | ----------- | ------ | ----- | ------ |
| 1  | Lápiz HB        | Papelería   | 8.50   | 120   | true   |
| 5  | Audífonos …     | Electrónica | 899.00 | 25    | true   |
| …  | …               | …           | …      | …     | …      |

> Puedes ver el script completo que crea las tablas en el panel **Ver tablas del ejercicio**
> de cada ejercicio.

## Leer todas las columnas

La consulta más simple lee todas las columnas (`*`) de una tabla:

```sql
SELECT * FROM productos;
```

Se lee así: "selecciona todas las columnas de la tabla productos". El `;` marca el final de
la instrucción.

## Elegir columnas

Casi siempre es mejor pedir solo las columnas que necesitas, separadas por comas:

```sql
SELECT nombre, precio FROM productos;
```

**Buena práctica:** evita `SELECT *` en aplicaciones reales. Traer columnas que no usas
gasta recursos y hace que tu código se rompa si la tabla cambia.

## Calcular columnas y usar alias

En la lista del `SELECT` también puedes escribir expresiones. Con `AS` le das un nombre
(alias) a la columna resultante:

```sql
SELECT nombre, precio * 1.16 AS precio_con_iva
FROM productos;
```

## Estilo

SQL no distingue mayúsculas en las palabras clave: `select` y `SELECT` funcionan igual.
Por convención se escriben las **palabras clave en mayúsculas** y los nombres de tablas y
columnas en minúsculas, y cada cláusula en su propia línea cuando la consulta crece:

```sql
SELECT nombre, precio
FROM productos;
```

## Resumen

- Una tabla tiene columnas (datos) y filas (registros).
- `SELECT columnas FROM tabla` lee datos; `*` significa todas las columnas.
- Puedes calcular columnas nuevas y nombrarlas con `AS`.
