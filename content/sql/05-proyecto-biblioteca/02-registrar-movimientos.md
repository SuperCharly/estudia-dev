---
title: Registrar movimientos
description: Da de alta libros, registra préstamos y devoluciones, y trabaja con fechas.
objectives:
  - Insertar filas relacionadas en el orden correcto.
  - Sumar días a una fecha y restar dos fechas.
  - Registrar una devolución sin alterar el historial.
  - Modificar filas según datos de otra tabla.
estimatedMinutes: 35
sources:
  - title: 'PostgreSQL — 9.9. Date/Time Functions and Operators'
    url: https://www.postgresql.org/docs/current/functions-datetime.html
  - title: 'PostgreSQL — 8.5. Date/Time Types'
    url: https://www.postgresql.org/docs/current/datatype-datetime.html
  - title: 'PostgreSQL — 6. Data Manipulation'
    url: https://www.postgresql.org/docs/current/dml.html
furtherReading:
  - book: sql-apuntes-basicos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/05-proyecto-biblioteca/01-disenar-el-modelo
---

## La biblioteca en marcha

Con las tablas creadas, la biblioteca empieza a funcionar. A partir de esta lección
trabajarás con una base de datos ya cargada: autores, libros, socios y varios meses de
préstamos. Ábrela en "Ver tablas del ejercicio" para conocerla.

El trabajo diario se reduce a tres operaciones:

| Situación                 | Operación                                              |
| ------------------------- | ------------------------------------------------------ |
| Llega un libro nuevo      | `INSERT` en `libros` (y antes en `autores`, si hace falta) |
| Un socio se lleva un libro| `INSERT` en `prestamos`, sin fecha de devolución       |
| Un socio devuelve un libro| `UPDATE` de `fecha_devolucion` en ese préstamo         |

Observa que devolver un libro **no borra** el préstamo: se completa la fila. Así se conserva
el historial, que después permitirá saber qué libros se prestan más o quién devuelve tarde.

## Altas: primero lo referenciado

Para registrar un libro de un autor que aún no está en la base de datos, el autor va
primero:

```sql
INSERT INTO autores (id, nombre, pais)
VALUES (8, 'Elena Garro', 'México');

INSERT INTO libros (id, titulo, autor_id, genero, anio)
VALUES (13, 'Los recuerdos del porvenir', 8, 'Novela', 1963);
-- ejemplares toma su valor por defecto: 1
```

## Operar con fechas

Las fechas se escriben como texto con el formato `'AAAA-MM-DD'`. Cuando PostgreSQL no
puede deducir que un texto es una fecha, se le indica con `DATE`:

```sql
SELECT DATE '2025-10-06';
```

Con el tipo `DATE` se pueden hacer cuentas:

```sql
SELECT DATE '2025-10-06' + 14;                   -- 2025-10-20 (fecha + días = fecha)
SELECT DATE '2025-10-20' - DATE '2025-10-06';    -- 14 (fecha - fecha = días)
```

PostgreSQL conoce la duración de cada mes y los años bisiestos:

```sql
SELECT DATE '2025-10-25' + 14;    -- 2025-11-08
```

`CURRENT_DATE` devuelve la fecha de hoy. En estos ejercicios se usa una fecha fija
(el `2025-10-06`) para que el resultado no cambie según el día en que los resuelvas.

## Registrar un préstamo

Un préstamo nuevo no tiene fecha de devolución, y la fecha límite se calcula a partir de la
del préstamo (aquí, 14 días después):

```sql
INSERT INTO prestamos (id, libro_id, socio_id, fecha_prestamo, fecha_limite)
VALUES (15, 5, 6, '2025-10-06', DATE '2025-10-06' + 14);
```

Al omitir `fecha_devolucion`, queda en `NULL`: el préstamo está **activo**.

## Registrar una devolución

```sql
UPDATE prestamos
SET fecha_devolucion = '2025-10-06'
WHERE id = 12;
```

Si se identifican los préstamos por socio o por libro en lugar de por `id`, hay que añadir
una condición importante: **solo los activos**.

```sql
UPDATE prestamos
SET fecha_devolucion = '2025-10-06'
WHERE socio_id = 5
  AND fecha_devolucion IS NULL;
```

Sin `fecha_devolucion IS NULL`, la sentencia sobrescribiría también las fechas de los
préstamos que ese socio ya devolvió hace meses, y el historial quedaría falseado sin que
aparezca ningún error.

## Cambios que dependen de otra tabla

Una prórroga para los préstamos activos de libros de poesía:

```sql
UPDATE prestamos
SET fecha_limite = fecha_limite + 7
WHERE fecha_devolucion IS NULL
  AND libro_id IN (SELECT id FROM libros WHERE genero = 'Poesía');
```

El género está en `libros`, no en `prestamos`, así que se usa una subconsulta para obtener
los libros que interesan.

## Resumen

- Inserta primero las filas a las que otras hacen referencia.
- `fecha + n` suma días; `fecha - fecha` da los días de diferencia.
- Un préstamo activo es el que tiene `fecha_devolucion IS NULL`.
- Devolver es un `UPDATE`, no un `DELETE`: el historial se conserva.
- Al modificar por socio o por libro, limita el cambio a los préstamos activos.
