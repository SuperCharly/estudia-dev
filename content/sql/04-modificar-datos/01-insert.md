---
title: Insertar filas con INSERT
description: Agrega filas nuevas a una tabla, una o varias a la vez, y entiende qué pasa con las columnas que no indicas.
objectives:
  - Insertar una fila indicando las columnas y sus valores.
  - Insertar varias filas en una sola sentencia.
  - Aprovechar los valores por defecto y distinguirlos de NULL.
  - Insertar filas a partir de una consulta con INSERT … SELECT.
  - Interpretar los errores de restricciones al insertar.
estimatedMinutes: 30
sources:
  - title: 'PostgreSQL — 6.1. Inserting Data'
    url: https://www.postgresql.org/docs/current/dml-insert.html
  - title: 'PostgreSQL — 2.4. Populating a Table With Rows'
    url: https://www.postgresql.org/docs/current/tutorial-populate.html
  - title: 'PostgreSQL — INSERT'
    url: https://www.postgresql.org/docs/current/sql-insert.html
furtherReading:
  - book: sql-apuntes-basicos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/03-relaciones/04-subconsultas
---

## De leer a escribir

Hasta ahora solo has **leído** datos con `SELECT`. En este módulo aprenderás a
**modificarlos**: agregar filas (`INSERT`), cambiarlas (`UPDATE`), eliminarlas (`DELETE`)
y crear tablas nuevas (`CREATE TABLE`).

Puedes experimentar sin miedo: en cada ejecución la base de datos de los ejercicios vuelve
a su estado inicial. En una base de datos real los cambios son permanentes, así que conviene
adquirir buenos hábitos desde ahora.

> En estos ejercicios, al pulsar **Ejecutar** verás cómo queda la tabla después de tu
> código, y **Comprobar** compara ese resultado con el esperado.

## Insertar una fila

```sql
INSERT INTO productos (id, nombre, categoria, precio, stock, activo)
VALUES (13, 'Goma de borrar', 'Papelería', 6.00, 200, TRUE);
```

- Después del nombre de la tabla va la **lista de columnas**, y en `VALUES`, un valor para
  cada una **en el mismo orden**.
- Los textos y las fechas van entre comillas simples (`'Papelería'`, `'2025-10-01'`); los
  números y los booleanos, sin comillas.

La lista de columnas puede omitirse (`INSERT INTO productos VALUES (...)`), pero entonces
debes dar todos los valores en el orden exacto en que se creó la tabla. Escribir siempre
las columnas es más claro y no se rompe si la tabla cambia.

## Columnas omitidas: DEFAULT y NULL

Si no mencionas una columna, recibe su **valor por defecto**. En `productos`, `stock` tiene
`DEFAULT 0` y `activo` tiene `DEFAULT TRUE`:

```sql
INSERT INTO productos (id, nombre, categoria, precio)
VALUES (14, 'Sacapuntas', 'Papelería', 9.50);
-- stock = 0, activo = TRUE
```

Si la columna no tiene valor por defecto, recibe `NULL`. Y si además es `NOT NULL`, la
inserción falla. También puedes escribir `NULL` de forma explícita para indicar "sin dato":

```sql
INSERT INTO clientes (id, nombre, email, ciudad, fecha_registro)
VALUES (9, 'Inés Mora', NULL, 'Puebla', '2025-10-01');
```

Recuerda que `NULL` (sin comillas) no es lo mismo que el texto `'NULL'` ni que un texto
vacío `''`.

## Insertar varias filas

Separa los grupos de valores con comas:

```sql
INSERT INTO productos (id, nombre, categoria, precio) VALUES
  (15, 'Tijeras',   'Papelería', 38.00),
  (16, 'Pegamento', 'Papelería', 22.50);
```

Es más rápido que varias sentencias y, además, **todo o nada**: si una fila falla, no se
inserta ninguna.

## Insertar el resultado de una consulta

En lugar de `VALUES` puedes usar un `SELECT`: se inserta cada fila que devuelva.

```sql
-- Agrega al pedido 3 dos unidades del producto 2, con su precio actual
INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario)
SELECT 3, id, 2, precio
FROM productos
WHERE id = 2;
```

El `SELECT` puede mezclar valores fijos (`3`, `2`) con columnas (`id`, `precio`). Así no
copias a mano un dato que ya está en la base de datos y que podría cambiar.

## Las restricciones protegen los datos

La base de datos rechaza las filas que rompen las reglas de la tabla:

```sql
INSERT INTO productos (id, nombre, categoria, precio)
VALUES (1, 'Duplicado', 'Hogar', 10);
-- ERROR: duplicate key value violates unique constraint "productos_pkey"

INSERT INTO productos (id, nombre, categoria, precio)
VALUES (17, 'Regalo', 'Hogar', -5);
-- ERROR: new row for relation "productos" violates check constraint "productos_precio_check"

INSERT INTO pedidos (id, cliente_id, fecha, estado)
VALUES (9, 999, '2025-10-01', 'pendiente');
-- ERROR: insert or update on table "pedidos" violates foreign key constraint
```

Estos errores son buenas noticias: evitan identificadores repetidos, precios negativos y
pedidos de clientes que no existen. Por la misma razón, el **orden importa**: primero se
inserta el pedido y después sus líneas de detalle.

## Resumen

- `INSERT INTO tabla (columnas) VALUES (valores);` agrega una fila.
- Las columnas omitidas reciben su valor por defecto o `NULL`.
- Varias filas: `VALUES (...), (...), (...)`.
- `INSERT INTO … SELECT …` inserta el resultado de una consulta.
- Las restricciones (clave primaria, `NOT NULL`, `CHECK`, claves foráneas) rechazan datos inválidos.
