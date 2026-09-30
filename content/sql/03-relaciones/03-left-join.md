---
title: LEFT JOIN y datos faltantes
description: Conserva las filas sin pareja en la otra tabla y encuentra lo que falta.
objectives:
  - Diferenciar INNER JOIN y LEFT JOIN.
  - Encontrar filas sin relación con LEFT JOIN e IS NULL.
  - Contar correctamente con LEFT JOIN.
  - Reemplazar NULL por un valor con COALESCE.
estimatedMinutes: 30
sources:
  - title: 'PostgreSQL — 2.6. Joins Between Tables (outer joins)'
    url: https://www.postgresql.org/docs/current/tutorial-join.html
  - title: 'PostgreSQL — 7.2.1.1. Joined Tables'
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN
  - title: 'PostgreSQL — 9.18.2. COALESCE'
    url: https://www.postgresql.org/docs/current/functions-conditional.html#FUNCTIONS-COALESCE-NVL-IFNULL
furtherReading:
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/03-relaciones/02-inner-join
---

## El problema del INNER JOIN

Esta consulta cuenta los pedidos de cada cliente:

```sql
SELECT c.nombre, COUNT(*) AS pedidos
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id, c.nombre;
```

Pero Sofía y Raúl no aparecen: no tienen pedidos, así que el `JOIN` no les encuentra pareja
y los descarta. Si queremos un reporte de **todos** los clientes, necesitamos otro tipo de
unión.

## LEFT JOIN

`LEFT JOIN` conserva **todas las filas de la tabla izquierda** (la que va en el `FROM`).
Cuando una fila no tiene pareja, las columnas de la tabla derecha se llenan con `NULL`:

```sql
SELECT c.nombre, p.id AS pedido
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id;
```

| nombre     | pedido |
| ---------- | ------ |
| Ana Torres | 1      |
| …          | …      |
| Sofía Díaz | NULL   |
| Raúl Ortiz | NULL   |

También existen `RIGHT JOIN` (conserva la tabla derecha) y `FULL JOIN` (conserva ambas).
En la práctica casi siempre basta con `LEFT JOIN`, ordenando las tablas como convenga.

## Encontrar lo que falta

Las filas sin pareja son justo las que tienen `NULL` en la clave de la tabla derecha:

```sql
-- Clientes que nunca han hecho un pedido
SELECT c.nombre
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.id IS NULL;
```

Este patrón (`LEFT JOIN` + `IS NULL`) responde preguntas como "¿qué productos nunca se han
vendido?" o "¿qué estudiantes no entregaron la tarea?".

## Contar con LEFT JOIN

Cuidado con `COUNT(*)`: cuenta filas, y un cliente sin pedidos **sí** tiene una fila (con
`NULL`). Para contar pedidos reales, cuenta una columna de la tabla derecha, que ignora los
`NULL`:

```sql
SELECT c.nombre, COUNT(p.id) AS pedidos   -- Sofía: 0, no 1
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id, c.nombre;
```

## COALESCE: un valor en lugar de NULL

`SUM` de un grupo sin valores devuelve `NULL`, no `0`. `COALESCE` devuelve el primer valor
no nulo de su lista, así que sirve para poner un valor por defecto:

```sql
SELECT pr.nombre, COALESCE(SUM(d.cantidad), 0) AS unidades
FROM productos pr
LEFT JOIN pedido_detalle d ON d.producto_id = pr.id
GROUP BY pr.id, pr.nombre;
```

## Resumen

- `JOIN` (inner) descarta las filas sin pareja; `LEFT JOIN` las conserva con `NULL`.
- `LEFT JOIN` + `WHERE derecha.id IS NULL` encuentra filas sin relación.
- Con `LEFT JOIN`, cuenta una columna de la tabla derecha (`COUNT(p.id)`), no `COUNT(*)`.
- `COALESCE(valor, 0)` reemplaza `NULL` por un valor por defecto.
