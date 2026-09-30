---
title: Claves y relaciones
description: Cómo se conectan las tablas mediante claves primarias y foráneas.
objectives:
  - Explicar qué es una clave primaria y para qué sirve.
  - Explicar qué es una clave foránea y cómo protege la integridad de los datos.
  - Reconocer relaciones uno a muchos y muchos a muchos.
  - Consultar datos relacionados usando los valores de las claves.
estimatedMinutes: 25
sources:
  - title: 'PostgreSQL — 5.5.4. Primary Keys'
    url: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS
  - title: 'PostgreSQL — 5.5.5. Foreign Keys'
    url: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK
  - title: 'PostgreSQL — 3.3. Foreign Keys (tutorial)'
    url: https://www.postgresql.org/docs/current/tutorial-fk.html
furtherReading:
  - book: diseno-bases-de-datos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/02-agregacion/03-having
---

## ¿Por qué varias tablas?

Imagina guardar los pedidos de la tienda en una sola tabla, repitiendo en cada fila el
nombre, email y ciudad del cliente. Si Ana cambia de email, habría que actualizar todas
sus filas, y basta olvidar una para tener datos contradictorios.

Las bases de datos **relacionales** evitan esa repetición: cada cosa se guarda **una sola
vez** en su propia tabla, y las tablas se **relacionan** mediante claves.

## Clave primaria

La **clave primaria** (*primary key*) identifica **de forma única** cada fila de una tabla.
En nuestro dataset, cada tabla tiene una columna `id` declarada así:

```sql
CREATE TABLE clientes (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  ...
);
```

Una clave primaria nunca puede repetirse ni ser `NULL`: PostgreSQL rechaza cualquier
intento de insertar dos clientes con el mismo `id`.

## Clave foránea

Una **clave foránea** (*foreign key*) es una columna que **apunta a la clave primaria de
otra tabla**:

```sql
CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id),
  ...
);
```

`cliente_id` guarda el `id` del cliente que hizo el pedido. `REFERENCES` garantiza la
**integridad referencial**: no se puede crear un pedido para un cliente que no existe, ni
borrar un cliente que todavía tiene pedidos.

## Tipos de relación

### Uno a muchos

Un cliente puede tener **muchos** pedidos, pero cada pedido pertenece a **un** cliente.
La clave foránea va en el lado "muchos" (`pedidos.cliente_id`).

```text
clientes (1) ──< pedidos (muchos)
```

### Muchos a muchos

Un pedido puede incluir muchos productos, y un producto puede aparecer en muchos pedidos.
Esta relación se representa con una **tabla intermedia** que tiene una clave foránea hacia
cada lado:

```text
pedidos (1) ──< pedido_detalle >── (1) productos
```

`pedido_detalle` guarda qué producto va en qué pedido, cuántas unidades y a qué precio. Su
clave primaria es la **combinación** `(pedido_id, producto_id)`: el mismo producto no puede
aparecer dos veces en un pedido.

## El esquema completo

| Tabla            | Clave primaria              | Claves foráneas                           |
| ---------------- | --------------------------- | ----------------------------------------- |
| `clientes`       | `id`                        | —                                         |
| `productos`      | `id`                        | —                                         |
| `pedidos`        | `id`                        | `cliente_id` → `clientes.id`              |
| `pedido_detalle` | `(pedido_id, producto_id)`  | `pedido_id` → `pedidos.id`, `producto_id` → `productos.id` |

## Consultar usando las claves

Con lo que ya sabes puedes seguir una relación en varios pasos. Por ejemplo, ¿qué
productos incluye el pedido 1?

```sql
SELECT producto_id, cantidad
FROM pedido_detalle
WHERE pedido_id = 1;
```

Obtienes los `id` de los productos, pero no sus nombres: están en otra tabla. En la
siguiente lección aprenderás a combinar ambas con `JOIN`.

## Resumen

- La clave primaria identifica cada fila y no se repite.
- La clave foránea apunta a la clave primaria de otra tabla y protege la integridad.
- Uno a muchos: la clave foránea va en el lado "muchos".
- Muchos a muchos: se usa una tabla intermedia con dos claves foráneas.
