---
title: Modificar filas con UPDATE
description: Cambia los valores de las filas que cumplan una condición, sin tocar las demás.
objectives:
  - Modificar una o varias columnas con UPDATE … SET.
  - Limitar el cambio con WHERE y entender el riesgo de omitirlo.
  - Calcular el valor nuevo a partir del actual.
  - Elegir las filas a modificar con una subconsulta.
  - Revisar lo modificado con RETURNING.
estimatedMinutes: 30
sources:
  - title: 'PostgreSQL — 6.2. Updating Data'
    url: https://www.postgresql.org/docs/current/dml-update.html
  - title: 'PostgreSQL — 6.4. Returning Data from Modified Rows'
    url: https://www.postgresql.org/docs/current/dml-returning.html
  - title: 'PostgreSQL — UPDATE'
    url: https://www.postgresql.org/docs/current/sql-update.html
furtherReading:
  - book: sql-apuntes-basicos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/04-modificar-datos/01-insert
---

## La sentencia UPDATE

`UPDATE` cambia valores de filas que ya existen. Tiene tres partes: la tabla, las columnas
que cambian y qué filas se ven afectadas.

```sql
UPDATE productos
SET precio = 9.00
WHERE id = 1;
```

Para cambiar varias columnas a la vez, sepáralas con comas:

```sql
UPDATE productos
SET precio = 9.00, stock = 150
WHERE id = 1;
```

## El WHERE decide qué filas cambian

El `WHERE` funciona igual que en `SELECT`: se modifican **todas** las filas que cumplan la
condición, sean una, cien o ninguna.

```sql
UPDATE productos
SET activo = FALSE
WHERE categoria = 'Libros' AND stock = 0;
```

Y si lo omites, se modifican **todas las filas de la tabla**:

```sql
UPDATE productos
SET precio = 9.00;      -- ¡todos los productos cuestan ahora 9.00!
```

La base de datos no pregunta "¿seguro?". Un hábito que evita disgustos: antes de un
`UPDATE`, ejecuta un `SELECT` con el mismo `WHERE` y comprueba que devuelve exactamente las
filas que quieres cambiar.

```sql
SELECT id, nombre FROM productos WHERE categoria = 'Libros' AND stock = 0;
```

## Calcular a partir del valor actual

A la derecha del `=` puede ir cualquier expresión, incluidas las columnas de la propia
fila, que conservan su valor **anterior** al cambio:

```sql
-- Sube un 10 % el precio de los productos de Hogar
UPDATE productos
SET precio = precio * 1.10
WHERE categoria = 'Hogar';

-- Llegan 20 unidades del producto 3
UPDATE productos
SET stock = stock + 20
WHERE id = 3;
```

Como todas las expresiones de `SET` usan los valores anteriores, el orden en que escribas
las columnas no altera el resultado. En cambio, **dos sentencias seguidas sí dependen del
orden**: la segunda ve los cambios de la primera.

```sql
UPDATE productos SET activo = TRUE WHERE NOT activo;
UPDATE productos SET stock = 10   WHERE NOT activo;   -- ya no encuentra ninguna fila
```

## Elegir filas con una subconsulta

La condición puede depender de otra tabla, con las mismas subconsultas que ya conoces:

```sql
-- Marca como entregados los pedidos enviados de clientes de Monterrey
UPDATE pedidos
SET estado = 'entregado'
WHERE estado = 'enviado'
  AND cliente_id IN (SELECT id FROM clientes WHERE ciudad = 'Monterrey');
```

## RETURNING: ver lo que cambió

En PostgreSQL, `INSERT`, `UPDATE` y `DELETE` aceptan `RETURNING`, que devuelve las filas
afectadas como si fuera un `SELECT`:

```sql
UPDATE productos
SET precio = precio * 1.10
WHERE categoria = 'Hogar'
RETURNING id, nombre, precio;
```

Es una forma cómoda de confirmar el resultado sin lanzar otra consulta.

## Las restricciones siguen vigentes

Un `UPDATE` que deje una fila en un estado inválido se rechaza por completo:

```sql
UPDATE productos SET stock = stock - 500 WHERE id = 1;
-- ERROR: new row for relation "productos" violates check constraint "productos_stock_check"
```

## Resumen

- `UPDATE tabla SET columna = valor WHERE condición;`
- Sin `WHERE` se modifican todas las filas. Prueba antes la condición con un `SELECT`.
- El valor nuevo puede calcularse con el actual: `SET stock = stock + 20`.
- El `WHERE` admite subconsultas para decidir según otras tablas.
- `RETURNING` devuelve las filas modificadas.
