---
title: Ordenar y limitar resultados
description: Ordena resultados con ORDER BY, limita su cantidad y elimina duplicados.
objectives:
  - Ordenar resultados de forma ascendente y descendente.
  - Ordenar por varias columnas.
  - Limitar la cantidad de filas con LIMIT y OFFSET.
  - Eliminar filas repetidas con DISTINCT.
estimatedMinutes: 20
sources:
  - title: 'PostgreSQL — 7.5. Sorting Rows (ORDER BY)'
    url: https://www.postgresql.org/docs/current/queries-order.html
  - title: 'PostgreSQL — 7.6. LIMIT and OFFSET'
    url: https://www.postgresql.org/docs/current/queries-limit.html
  - title: 'PostgreSQL — 7.3.3. DISTINCT'
    url: https://www.postgresql.org/docs/current/queries-select-lists.html#QUERIES-DISTINCT
furtherReading:
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/01-consultas-basicas/02-filtrar-con-where
---

## El orden no está garantizado

Sin una instrucción explícita, la base de datos puede devolver las filas **en cualquier
orden**, y ese orden puede cambiar de una ejecución a otra. Si el orden importa, pídelo con
`ORDER BY`.

## ORDER BY

```sql
SELECT nombre, precio
FROM productos
ORDER BY precio;          -- de menor a mayor (ASC, el valor por defecto)
```

```sql
SELECT nombre, precio
FROM productos
ORDER BY precio DESC;     -- de mayor a menor
```

Puedes ordenar por varias columnas: si hay empate en la primera, se usa la segunda.

```sql
SELECT categoria, nombre, precio
FROM productos
ORDER BY categoria, precio DESC;
```

En PostgreSQL, los valores `NULL` van **al final** en orden ascendente y al principio en
orden descendente. Puedes cambiarlo con `NULLS FIRST` o `NULLS LAST`.

## LIMIT y OFFSET

`LIMIT n` devuelve como máximo `n` filas. `OFFSET m` se salta las primeras `m`. Juntos se
usan, por ejemplo, para paginar resultados:

```sql
-- Los 3 productos más caros
SELECT nombre, precio
FROM productos
ORDER BY precio DESC
LIMIT 3;
```

**Buena práctica:** usa siempre `LIMIT` junto con `ORDER BY`. Sin un orden definido, "las
primeras 3 filas" pueden ser distintas cada vez.

## DISTINCT

`DISTINCT` elimina las filas repetidas del resultado:

```sql
SELECT DISTINCT categoria
FROM productos
ORDER BY categoria;
```

## Orden de las cláusulas

Las cláusulas que has aprendido se escriben siempre en este orden:

```sql
SELECT DISTINCT columnas
FROM tabla
WHERE condición
ORDER BY columnas
LIMIT n OFFSET m;
```

## Resumen

- Sin `ORDER BY`, el orden de las filas no está garantizado.
- `ASC` (por defecto) ordena de menor a mayor; `DESC`, de mayor a menor.
- `LIMIT` y `OFFSET` recortan el resultado; úsalos con `ORDER BY`.
- `DISTINCT` elimina filas duplicadas.
