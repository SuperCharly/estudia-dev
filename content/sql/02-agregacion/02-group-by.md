---
title: Agrupar con GROUP BY
description: Calcula resúmenes por grupo, por ejemplo cuántos productos hay en cada categoría.
objectives:
  - Agrupar filas con GROUP BY y aplicar funciones de agregación a cada grupo.
  - Conocer la regla de las columnas permitidas en el SELECT.
  - Ordenar grupos por el resultado de una agregación.
estimatedMinutes: 25
sources:
  - title: 'PostgreSQL — 2.7. Aggregate Functions'
    url: https://www.postgresql.org/docs/current/tutorial-agg.html
  - title: 'PostgreSQL — 7.2.3. The GROUP BY and HAVING Clauses'
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP
furtherReading:
  - book: sql-apuntes-basicos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/02-agregacion/01-funciones-de-agregacion
---

## Un resumen por grupo

Con `COUNT(*)` sabes cuántos productos hay en total. Pero ¿cuántos hay **en cada
categoría**? Para eso existe `GROUP BY`:

```sql
SELECT categoria, COUNT(*) AS productos
FROM productos
GROUP BY categoria;
```

| categoria   | productos |
| ----------- | --------- |
| Papelería   | 4         |
| Electrónica | 4         |
| Hogar       | 2         |
| Libros      | 2         |

`GROUP BY categoria` reúne las filas que tienen la misma categoría en un **grupo**, y la
función de agregación se calcula **una vez por grupo**. El resultado tiene una fila por
grupo.

## La regla de oro

En una consulta con `GROUP BY`, cada columna del `SELECT` debe cumplir una de dos
condiciones:

1. Estar en el `GROUP BY`, o
2. Estar dentro de una función de agregación.

```sql
-- ERROR: ¿qué "nombre" mostrar, si cada grupo tiene varios productos?
SELECT categoria, nombre, COUNT(*)
FROM productos
GROUP BY categoria;
```

```text
ERROR: column "productos.nombre" must appear in the GROUP BY clause
or be used in an aggregate function
```

## Agrupar y ordenar

Puedes ordenar los grupos por cualquier columna del resultado, incluida una agregación.
En el `ORDER BY` puedes usar el alias:

```sql
SELECT categoria, SUM(stock) AS unidades
FROM productos
GROUP BY categoria
ORDER BY unidades DESC;
```

## Agrupar después de filtrar

`WHERE` se aplica **antes** de agrupar. Esta consulta cuenta solo los productos activos de
cada categoría:

```sql
SELECT categoria, COUNT(*) AS activos
FROM productos
WHERE activo
GROUP BY categoria;
```

## Agrupar por varias columnas

Si agrupas por varias columnas, se forma un grupo por cada **combinación** distinta:

```sql
SELECT categoria, activo, COUNT(*)
FROM productos
GROUP BY categoria, activo;
```

## Orden de las cláusulas

```sql
SELECT columnas, agregaciones
FROM tabla
WHERE condición          -- filtra filas
GROUP BY columnas        -- forma grupos
ORDER BY columnas        -- ordena el resultado
LIMIT n;
```

## Resumen

- `GROUP BY col` forma un grupo por cada valor distinto de `col`.
- Las agregaciones se calculan una vez por grupo.
- En el `SELECT` solo van columnas agrupadas o agregaciones.
- `WHERE` filtra antes de agrupar; `ORDER BY` puede usar el alias de una agregación.
