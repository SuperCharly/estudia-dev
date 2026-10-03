---
title: Eliminar filas con DELETE
description: Borra las filas que cumplan una condición y entiende cómo las claves foráneas protegen los datos relacionados.
objectives:
  - Eliminar filas con DELETE … WHERE.
  - Reconocer el riesgo de un DELETE sin WHERE.
  - Explicar por qué una clave foránea puede impedir un borrado.
  - Eliminar filas relacionadas en el orden correcto.
  - Usar subconsultas para decidir qué filas eliminar.
estimatedMinutes: 30
sources:
  - title: 'PostgreSQL — 6.3. Deleting Data'
    url: https://www.postgresql.org/docs/current/dml-delete.html
  - title: 'PostgreSQL — 5.5.5. Foreign Keys'
    url: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK
  - title: 'PostgreSQL — 3.4. Transactions'
    url: https://www.postgresql.org/docs/current/tutorial-transactions.html
furtherReading:
  - book: sql-apuntes-basicos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/04-modificar-datos/02-update
---

## La sentencia DELETE

`DELETE` elimina **filas completas** de una tabla:

```sql
DELETE FROM pedido_detalle
WHERE pedido_id = 6;
```

No se indican columnas: se borra la fila entera. Si lo que quieres es "vaciar" un dato de
una fila que debe seguir existiendo, eso es un `UPDATE … SET columna = NULL`.

Como en `UPDATE`, el `WHERE` decide qué filas se ven afectadas, y **sin `WHERE` se eliminan
todas**:

```sql
DELETE FROM pedido_detalle;   -- la tabla queda vacía (pero sigue existiendo)
```

El mismo hábito de la lección anterior sirve aquí: prueba primero la condición con un
`SELECT` y, cuando veas exactamente las filas que quieres borrar, cambia `SELECT *` por
`DELETE`.

## Las claves foráneas impiden dejar datos huérfanos

Intenta borrar un cliente que tiene pedidos:

```sql
DELETE FROM clientes WHERE id = 1;
-- ERROR: update or delete on table "clientes" violates foreign key constraint
--        "pedidos_cliente_id_fkey" on table "pedidos"
```

La base de datos lo impide porque quedarían pedidos que apuntan a un cliente inexistente.
Hay dos formas de resolverlo:

1. **Borrar primero las filas que dependen de ella** (de "hijos" a "padres").
2. No borrar: muchas veces es mejor **marcar** la fila como inactiva o cancelada con un
   `UPDATE`, y conservar el historial.

Para eliminar un pedido con sus líneas, el orden es el inverso al de la inserción:

```sql
DELETE FROM pedido_detalle WHERE pedido_id = 6;   -- primero las líneas
DELETE FROM pedidos        WHERE id = 6;          -- después el pedido
```

> Al crear una tabla se puede indicar `ON DELETE CASCADE` en la clave foránea para que las
> filas dependientes se borren automáticamente. Es cómodo, pero también peligroso: un solo
> `DELETE` puede arrastrar muchas filas. Las tablas de estos ejercicios no lo usan.

## Decidir con una subconsulta

Cuando la condición depende de otra tabla, usa las subconsultas del módulo anterior:

```sql
-- Elimina las líneas de detalle de los pedidos cancelados
DELETE FROM pedido_detalle
WHERE pedido_id IN (SELECT id FROM pedidos WHERE estado = 'cancelado');

-- Elimina los clientes que nunca han hecho un pedido
DELETE FROM clientes c
WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id);
```

Decide por la **relación real** entre las tablas (¿tiene pedidos?), no por un dato que
"suele" coincidir (¿le falta la ciudad?). Lo segundo puede funcionar hoy por casualidad y
fallar mañana.

## Transacciones: una red de seguridad

En una base de datos real, los cambios pueden agruparse en una **transacción**: empieza con
`BEGIN` y termina con `COMMIT` (confirmar) o `ROLLBACK` (deshacer todo).

```sql
BEGIN;
DELETE FROM pedido_detalle WHERE pedido_id = 6;
DELETE FROM pedidos WHERE id = 6;
-- Si algo salió mal: ROLLBACK;
COMMIT;
```

Así, o se aplican todos los cambios o ninguno. En estos ejercicios no necesitas escribirlo:
la plataforma ya ejecuta tu código dentro de una transacción y la deshace al terminar.

## Resumen

- `DELETE FROM tabla WHERE condición;` elimina filas completas.
- Sin `WHERE` se eliminan todas las filas. Prueba antes la condición con un `SELECT`.
- Una clave foránea impide borrar una fila a la que otras hacen referencia.
- Borra de "hijos" a "padres": primero el detalle, luego el pedido.
- A menudo es preferible marcar como inactivo (`UPDATE`) que borrar.
