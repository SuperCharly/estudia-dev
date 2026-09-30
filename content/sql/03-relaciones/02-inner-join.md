---
title: Combinar tablas con JOIN
description: Une filas de varias tablas relacionadas en una sola consulta.
objectives:
  - Combinar dos tablas con JOIN ... ON.
  - Usar alias de tabla y calificar columnas ambiguas.
  - Encadenar varios JOIN para recorrer una relación muchos a muchos.
  - Combinar JOIN con WHERE, GROUP BY y ORDER BY.
estimatedMinutes: 35
sources:
  - title: 'PostgreSQL — 2.6. Joins Between Tables'
    url: https://www.postgresql.org/docs/current/tutorial-join.html
  - title: 'PostgreSQL — 7.2.1.1. Joined Tables'
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN
furtherReading:
  - book: sql-apuntes-basicos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/03-relaciones/01-claves-y-relaciones
---

## Unir dos tablas

`JOIN` combina filas de dos tablas cuando cumplen una condición, normalmente que la clave
foránea de una coincida con la clave primaria de la otra:

```sql
SELECT pedidos.id, clientes.nombre, pedidos.fecha
FROM pedidos
JOIN clientes ON pedidos.cliente_id = clientes.id;
```

Para cada pedido, PostgreSQL busca el cliente cuyo `id` coincide con `cliente_id` y arma
una fila con columnas de ambos.

`JOIN` es la forma abreviada de `INNER JOIN`: solo aparecen las filas que **tienen
pareja** en la otra tabla. En la siguiente lección verás cómo conservar también las que
no la tienen.

## Alias de tabla

Escribir el nombre completo de cada tabla es largo. Un **alias** le da un nombre corto:

```sql
SELECT p.id, c.nombre, p.fecha
FROM pedidos AS p
JOIN clientes AS c ON p.cliente_id = c.id;
```

La palabra `AS` es opcional: `FROM pedidos p` también funciona.

### Columnas ambiguas

Si dos tablas tienen una columna con el mismo nombre (aquí, ambas tienen `id`), debes
indicar de cuál hablas: `p.id` o `c.id`. Si no, PostgreSQL responde
`column reference "id" is ambiguous`. **Buena práctica:** en consultas con `JOIN`, califica
todas las columnas con su alias, aunque no sean ambiguas: la consulta queda más clara.

## Varios JOIN

Para responder "¿qué productos compró cada cliente?" hay que recorrer toda la cadena de
relaciones: `clientes` → `pedidos` → `pedido_detalle` → `productos`.

```sql
SELECT c.nombre AS cliente, pr.nombre AS producto, d.cantidad
FROM clientes c
JOIN pedidos p         ON p.cliente_id = c.id
JOIN pedido_detalle d  ON d.pedido_id = p.id
JOIN productos pr      ON pr.id = d.producto_id;
```

Cada `JOIN` agrega una tabla y su condición de unión.

## JOIN con el resto de cláusulas

Después de unir, puedes filtrar, agrupar y ordenar como siempre:

```sql
-- Unidades vendidas de cada categoría en pedidos entregados
SELECT pr.categoria, SUM(d.cantidad) AS unidades
FROM pedido_detalle d
JOIN pedidos p    ON p.id = d.pedido_id
JOIN productos pr ON pr.id = d.producto_id
WHERE p.estado = 'entregado'
GROUP BY pr.categoria
ORDER BY unidades DESC;
```

Al agrupar por cliente, agrupa por su clave (`c.id`) además del nombre: dos clientes
distintos podrían llamarse igual.

## Cuidado con olvidar la condición

Si unes dos tablas sin condición (`FROM clientes, pedidos` o `CROSS JOIN`), obtienes el
**producto cartesiano**: cada fila de una tabla combinada con **cada** fila de la otra.
Con 8 clientes y 8 pedidos, 64 filas sin sentido. La condición `ON` es lo que da
significado a la unión.

## Resumen

- `JOIN tabla ON condición` combina filas relacionadas; solo quedan las que tienen pareja.
- Usa alias (`FROM pedidos p`) y califica las columnas (`p.id`).
- Encadena varios `JOIN` para recorrer relaciones de varias tablas.
- Sin condición de unión obtienes un producto cartesiano.
