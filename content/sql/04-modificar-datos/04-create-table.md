---
title: Crear tablas y restricciones
description: Define tablas nuevas con sus tipos de datos y con las reglas que mantienen los datos correctos.
objectives:
  - Crear una tabla con CREATE TABLE eligiendo el tipo de cada columna.
  - Definir claves primarias, NOT NULL, UNIQUE, CHECK y DEFAULT.
  - Relacionar tablas con claves foráneas (REFERENCES).
  - Generar identificadores automáticos con columnas de identidad.
  - Modificar y eliminar tablas con ALTER TABLE y DROP TABLE.
estimatedMinutes: 40
sources:
  - title: 'PostgreSQL — 5.1. Table Basics'
    url: https://www.postgresql.org/docs/current/ddl-basics.html
  - title: 'PostgreSQL — 5.5. Constraints'
    url: https://www.postgresql.org/docs/current/ddl-constraints.html
  - title: 'PostgreSQL — 5.2. Default Values'
    url: https://www.postgresql.org/docs/current/ddl-default.html
  - title: 'PostgreSQL — 5.3. Identity Columns'
    url: https://www.postgresql.org/docs/current/ddl-identity-columns.html
  - title: 'PostgreSQL — 5.7. Modifying Tables'
    url: https://www.postgresql.org/docs/current/ddl-alter.html
furtherReading:
  - book: diseno-bases-de-datos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/04-modificar-datos/03-delete
---

## CREATE TABLE

Para crear una tabla se indica su nombre y, entre paréntesis, sus columnas: cada una con un
**nombre**, un **tipo de dato** y, opcionalmente, **restricciones**.

```sql
CREATE TABLE proveedores (
  id       INTEGER PRIMARY KEY,
  nombre   TEXT NOT NULL,
  telefono TEXT
);
```

## Tipos de datos más usados

| Tipo            | Guarda                                   | Ejemplo               |
| --------------- | ---------------------------------------- | --------------------- |
| `INTEGER`       | Números enteros                          | `42`                  |
| `NUMERIC(10, 2)`| Decimales exactos (dinero)               | `1450.00`             |
| `TEXT`          | Texto de cualquier longitud              | `'Lápiz HB'`          |
| `BOOLEAN`       | Verdadero o falso                        | `TRUE`                |
| `DATE`          | Fecha                                    | `'2025-10-01'`        |
| `TIMESTAMP`     | Fecha y hora                             | `'2025-10-01 09:30'`  |

`NUMERIC(10, 2)` significa hasta 10 dígitos en total, 2 de ellos decimales. Para el dinero
se prefiere a los tipos de coma flotante (`REAL`, `DOUBLE PRECISION`), que pueden introducir
pequeños errores de redondeo.

## Restricciones

Las **restricciones** son reglas que la base de datos hace cumplir en cada `INSERT` y
`UPDATE`. Ya las has visto actuar; ahora las defines tú:

```sql
CREATE TABLE cupones (
  id         INTEGER PRIMARY KEY,
  codigo     TEXT NOT NULL UNIQUE,
  descuento  INTEGER NOT NULL CHECK (descuento BETWEEN 1 AND 100),
  activo     BOOLEAN NOT NULL DEFAULT TRUE,
  creado     DATE NOT NULL DEFAULT CURRENT_DATE
);
```

- `PRIMARY KEY`: identifica cada fila. Implica `NOT NULL` y `UNIQUE`.
- `NOT NULL`: el dato es obligatorio.
- `UNIQUE`: no puede haber dos filas con el mismo valor.
- `CHECK (condición)`: la condición debe cumplirse en cada fila.
- `DEFAULT valor`: valor que se usa cuando el `INSERT` no menciona la columna. No es una
  restricción en sentido estricto, pero se define en el mismo lugar.

Vale la pena pensar las restricciones al crear la tabla: es mucho más fácil impedir que
entren datos incorrectos que limpiarlos después.

## Claves foráneas

`REFERENCES` declara que una columna apunta a la clave primaria de otra tabla:

```sql
CREATE TABLE opiniones (
  id          INTEGER PRIMARY KEY,
  cliente_id  INTEGER NOT NULL REFERENCES clientes (id),
  texto       TEXT NOT NULL
);
```

Así no puede existir una opinión de un cliente inexistente. La tabla referenciada
(`clientes`) debe existir **antes** de crear la que apunta a ella.

## Claves primarias de varias columnas

Una relación de **muchos a muchos** se guarda en una tabla intermedia cuya clave primaria
combina las dos claves foráneas. Como la clave abarca dos columnas, se escribe como una
restricción aparte, al final:

```sql
CREATE TABLE favoritos (
  cliente_id  INTEGER NOT NULL REFERENCES clientes (id),
  producto_id INTEGER NOT NULL REFERENCES productos (id),
  PRIMARY KEY (cliente_id, producto_id)
);
```

Un cliente puede tener muchos favoritos y un producto puede ser favorito de muchos
clientes, pero la misma pareja no puede repetirse. Es el mismo diseño de `pedido_detalle`.

## Identificadores automáticos

En lugar de elegir cada `id` a mano, puedes pedir a la base de datos que los genere:

```sql
CREATE TABLE proveedores (
  id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL
);

INSERT INTO proveedores (nombre) VALUES ('Papelera del Norte'), ('TecnoMayoreo');
-- reciben id 1 y 2
```

En código antiguo verás `SERIAL`, que hace algo parecido; las columnas de identidad son la
forma estándar y la recomendada hoy en PostgreSQL.

## Cambiar y eliminar tablas

`ALTER TABLE` modifica una tabla que ya existe:

```sql
ALTER TABLE clientes ADD COLUMN telefono TEXT;
ALTER TABLE clientes ADD COLUMN vip BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE clientes DROP COLUMN telefono;
```

Las filas existentes reciben `NULL` en la columna nueva, o su valor por defecto si lo
indicas. Por eso, para agregar una columna `NOT NULL` a una tabla con datos necesitas un
`DEFAULT`.

`DROP TABLE` elimina la tabla **con todos sus datos**:

```sql
DROP TABLE cupones;
```

No confundas `DELETE FROM cupones` (borra las filas, la tabla sigue) con
`DROP TABLE cupones` (desaparece la tabla).

## Resumen

- `CREATE TABLE nombre (columna TIPO restricciones, …);`
- Tipos habituales: `INTEGER`, `NUMERIC(p, s)`, `TEXT`, `BOOLEAN`, `DATE`.
- Restricciones: `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, `REFERENCES`; además, `DEFAULT`.
- Las relaciones de muchos a muchos usan una tabla intermedia con clave primaria compuesta.
- `GENERATED ALWAYS AS IDENTITY` genera los identificadores.
- `ALTER TABLE` cambia la estructura; `DROP TABLE` elimina la tabla y sus datos.
