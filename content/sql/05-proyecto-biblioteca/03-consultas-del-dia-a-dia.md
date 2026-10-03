---
title: Consultas del día a día
description: Responde las preguntas del mostrador combinando las cuatro tablas de la biblioteca.
objectives:
  - Unir más de dos tablas en una misma consulta.
  - Listar los préstamos activos y los atrasados.
  - Calcular días de atraso con operaciones entre fechas.
  - Distinguir una condición en ON de una en WHERE al usar LEFT JOIN.
  - Calcular los ejemplares disponibles de cada libro.
estimatedMinutes: 40
sources:
  - title: 'PostgreSQL — 7.2.1.1. Joined Tables'
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN
  - title: 'PostgreSQL — 2.6. Joins Between Tables'
    url: https://www.postgresql.org/docs/current/tutorial-join.html
  - title: 'PostgreSQL — 9.9. Date/Time Functions and Operators'
    url: https://www.postgresql.org/docs/current/functions-datetime.html
furtherReading:
  - book: sql-apuntes-basicos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/05-proyecto-biblioteca/02-registrar-movimientos
---

## Las preguntas del mostrador

Quien atiende la biblioteca necesita respuestas rápidas: ¿de quién es este libro?, ¿quién
tiene ahora *Rayuela*?, ¿qué préstamos están atrasados?, ¿queda algún ejemplar libre?

Al separar los datos en cuatro tablas evitamos repetirlos; el precio es que casi todas las
preguntas necesitan **unir** tablas. Ten a mano el diseño:

```text
autores ──< libros ──< prestamos >── socios
```

Cada `──<` es una relación de uno a muchos: la clave foránea está en la tabla de la derecha.

## Unir varias tablas

Un `JOIN` une dos tablas, y su resultado puede unirse con una tercera, y así sucesivamente.
Cada `JOIN` lleva su propia condición `ON`:

```sql
SELECT l.titulo, a.nombre AS autor, s.nombre AS socio, p.fecha_prestamo
FROM prestamos p
JOIN libros l  ON l.id = p.libro_id
JOIN autores a ON a.id = l.autor_id
JOIN socios s  ON s.id = p.socio_id;
```

Como `autores` y `socios` tienen una columna `nombre`, los alias de columna (`AS autor`,
`AS socio`) evitan confusiones en el resultado.

Un consejo: empieza por la tabla que tiene "una fila por cada cosa que quiero listar". Si
quieres una fila por préstamo, empieza en `prestamos`; si quieres una fila por libro,
empieza en `libros`.

## Préstamos activos y atrasados

Un préstamo está **activo** si no se ha devuelto:

```sql
SELECT l.titulo, s.nombre AS socio, p.fecha_limite
FROM prestamos p
JOIN libros l ON l.id = p.libro_id
JOIN socios s ON s.id = p.socio_id
WHERE p.fecha_devolucion IS NULL
ORDER BY p.fecha_limite;
```

Y está **atrasado** si, además, su fecha límite ya pasó. Con "hoy" igual al `2025-10-06`:

```sql
WHERE p.fecha_devolucion IS NULL
  AND p.fecha_limite < DATE '2025-10-06'
```

Los días de atraso son la diferencia entre hoy y la fecha límite:

```sql
SELECT l.titulo, DATE '2025-10-06' - p.fecha_limite AS dias_atraso
```

## ON o WHERE: no es lo mismo con LEFT JOIN

Queremos saber cuántos préstamos **activos** tiene cada libro, incluidos los que no tienen
ninguno. Primer intento:

```sql
SELECT l.titulo, COUNT(p.id) AS activos
FROM libros l
LEFT JOIN prestamos p ON p.libro_id = l.id
WHERE p.fecha_devolucion IS NULL
GROUP BY l.id, l.titulo;
```

Parece correcto, pero **faltan libros**: los que tienen préstamos y todos están devueltos.
El `LEFT JOIN` generó sus filas, pero después el `WHERE` las descartó, porque en ellas
`fecha_devolucion` no es `NULL`.

La solución es poner la condición en el `ON`. Así decide **qué préstamos se emparejan**, y
el `LEFT JOIN` conserva de todos modos los libros que se queden sin pareja:

```sql
SELECT l.titulo, COUNT(p.id) AS activos
FROM libros l
LEFT JOIN prestamos p
  ON p.libro_id = l.id
 AND p.fecha_devolucion IS NULL
GROUP BY l.id, l.titulo;
```

La regla general con `LEFT JOIN`:

- Condiciones sobre la tabla **derecha** que limitan con qué se empareja → en el `ON`.
- Condiciones que deben **eliminar filas** del resultado final → en el `WHERE`.

Con `INNER JOIN` ambas formas dan el mismo resultado; la diferencia solo aparece cuando hay
que conservar filas sin pareja.

## Ejemplares disponibles

De cada libro hay `ejemplares` copias, y cada préstamo activo ocupa una. Los disponibles
son la resta:

```sql
SELECT l.titulo, l.ejemplares - COUNT(p.id) AS disponibles
FROM libros l
LEFT JOIN prestamos p
  ON p.libro_id = l.id
 AND p.fecha_devolucion IS NULL
GROUP BY l.id, l.titulo, l.ejemplares;
```

`l.ejemplares` aparece en el `GROUP BY` porque se usa fuera de una función de agregación.
(Al agrupar por la clave primaria `l.id`, PostgreSQL permitiría omitirlo, pero escribirlo
es más claro y funciona en cualquier base de datos.)

## Resumen

- Encadena un `JOIN` por cada tabla que necesites, cada uno con su `ON`.
- Activo: `fecha_devolucion IS NULL`. Atrasado: activo y con `fecha_limite` anterior a hoy.
- `fecha - fecha` da días: sirve para calcular atrasos.
- Con `LEFT JOIN`, filtrar la tabla derecha en el `WHERE` elimina filas; hazlo en el `ON`.
- Disponibles = ejemplares − préstamos activos.
