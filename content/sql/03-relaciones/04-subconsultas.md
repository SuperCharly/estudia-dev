---
title: Subconsultas
description: Usa el resultado de una consulta dentro de otra.
objectives:
  - Comparar contra un valor calculado con una subconsulta escalar.
  - Filtrar con IN y una subconsulta.
  - Usar EXISTS y NOT EXISTS.
  - Escribir subconsultas correlacionadas.
estimatedMinutes: 30
sources:
  - title: 'PostgreSQL — 4.2.11. Scalar Subqueries'
    url: https://www.postgresql.org/docs/current/sql-expressions.html#SQL-SYNTAX-SCALAR-SUBQUERIES
  - title: 'PostgreSQL — 9.24. Subquery Expressions'
    url: https://www.postgresql.org/docs/current/functions-subquery.html
furtherReading:
  - book: sql-apuntes-basicos
prerequisites:
  - sql/03-relaciones/03-left-join
---

## Una consulta dentro de otra

¿Qué productos cuestan más que el promedio? Necesitas dos pasos: calcular el promedio y
luego filtrar. Una **subconsulta** (una consulta entre paréntesis dentro de otra) hace
ambos en una sola instrucción:

```sql
SELECT nombre, precio
FROM productos
WHERE precio > (SELECT AVG(precio) FROM productos);
```

PostgreSQL ejecuta primero la subconsulta, obtiene un número, y lo usa en la comparación.
Así, la consulta sigue funcionando aunque cambien los precios, algo que no ocurriría si
escribieras el promedio a mano.

## Subconsultas escalares

Una subconsulta que devuelve **un solo valor** (una fila, una columna) se llama
**escalar** y puede usarse donde iría un valor. Si devuelve más de una fila, `=` o `>`
producen un error:

```text
ERROR: more than one row returned by a subquery used as an expression
```

## IN con subconsulta

Si la subconsulta devuelve **una lista** de valores, usa `IN`:

```sql
-- Clientes que tienen algún pedido enviado
SELECT nombre
FROM clientes
WHERE id IN (SELECT cliente_id FROM pedidos WHERE estado = 'enviado');
```

A diferencia de un `JOIN`, `IN` no repite al cliente aunque tenga varios pedidos que
cumplan la condición.

> **Cuidado con `NOT IN`:** si la subconsulta devuelve algún `NULL`, `NOT IN` no devuelve
> ninguna fila. Para "los que no tienen…" es más seguro `NOT EXISTS` o el patrón
> `LEFT JOIN … IS NULL` de la lección anterior.

## EXISTS

`EXISTS (subconsulta)` es verdadero si la subconsulta devuelve **al menos una fila**:

```sql
-- Productos que aparecen en algún pedido
SELECT pr.nombre
FROM productos pr
WHERE EXISTS (
  SELECT 1 FROM pedido_detalle d WHERE d.producto_id = pr.id
);
```

`NOT EXISTS` hace lo contrario. El `SELECT 1` es una convención: a `EXISTS` solo le
importa si hay filas, no qué columnas tienen.

## Subconsultas correlacionadas

La subconsulta anterior usa `pr.id`, una columna de la consulta externa: se evalúa **una
vez por cada producto**. Eso es una subconsulta **correlacionada**. Permiten, por ejemplo,
comparar cada fila con su propio grupo:

```sql
-- Productos más caros que el promedio de SU categoría
SELECT p.nombre, p.categoria, p.precio
FROM productos p
WHERE p.precio > (
  SELECT AVG(p2.precio)
  FROM productos p2
  WHERE p2.categoria = p.categoria
);
```

Fíjate en los alias `p` y `p2`: son la misma tabla, y los alias indican a cuál se refiere
cada columna.

## ¿Subconsulta o JOIN?

Muchas preguntas pueden resolverse de ambas formas. Como guía:

- Si necesitas **mostrar columnas** de ambas tablas, usa `JOIN`.
- Si solo necesitas **filtrar** según otra tabla, `IN` o `EXISTS` suelen expresar mejor
  la intención.

## Resumen

- Una subconsulta escalar devuelve un valor y se usa en comparaciones.
- `IN (subconsulta)` compara contra una lista de valores.
- `EXISTS` comprueba si hay filas; prefiere `NOT EXISTS` a `NOT IN`.
- Una subconsulta correlacionada usa columnas de la consulta externa.
