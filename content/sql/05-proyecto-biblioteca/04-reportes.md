---
title: Reportes de la biblioteca
description: Resume meses de actividad con agregaciones para decidir qué comprar, a quién avisar y cómo funciona el servicio.
objectives:
  - Combinar JOIN, GROUP BY y ORDER BY para construir rankings.
  - Incluir en un reporte los grupos sin actividad.
  - Calcular promedios a partir de operaciones entre fechas.
  - Filtrar grupos con HAVING.
  - Seguir un método para escribir consultas complejas paso a paso.
estimatedMinutes: 45
sources:
  - title: 'PostgreSQL — 2.7. Aggregate Functions'
    url: https://www.postgresql.org/docs/current/tutorial-agg.html
  - title: 'PostgreSQL — 7.2.3. The GROUP BY and HAVING Clauses'
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP
  - title: 'PostgreSQL — 7.6. LIMIT and OFFSET'
    url: https://www.postgresql.org/docs/current/queries-limit.html
  - title: 'PostgreSQL — 9.24. Subquery Expressions'
    url: https://www.postgresql.org/docs/current/functions-subquery.html
furtherReading:
  - book: sql-apuntes-basicos
  - book: diseno-bases-de-datos
prerequisites:
  - sql/05-proyecto-biblioteca/03-consultas-del-dia-a-dia
---

## De los datos a las decisiones

Las consultas de la lección anterior responden al "ahora". Los **reportes** miran el
conjunto: qué libros convendría comprar de nuevo, qué géneros casi no se piden, qué socios
han dejado de venir, cuánto tardan en volver los libros. Todos combinan lo mismo: unir
tablas, agrupar y resumir.

## Un método para consultas largas

Una consulta de reporte puede intimidar si intentas escribirla de un tirón. Constrúyela por
capas, ejecutando en cada paso:

1. **¿Una fila por qué?** Decide qué representa cada fila del resultado (un libro, un
   género, un socio). Eso irá en el `GROUP BY`.
2. **Une las tablas** necesarias y mira las filas sin agrupar. ¿Tienen sentido?
3. **Agrupa y agrega**: `COUNT`, `SUM`, `AVG`…
4. **Filtra**: `WHERE` para filas (antes de agrupar), `HAVING` para grupos (después).
5. **Ordena y limita**.

Ejemplo: los libros más prestados.

```sql
-- Pasos 1 y 2: una fila por libro; hacen falta libros y prestamos
SELECT l.titulo, p.id
FROM libros l
JOIN prestamos p ON p.libro_id = l.id;

-- Pasos 3 y 5: contar, ordenar y limitar
SELECT l.titulo, COUNT(*) AS prestamos
FROM libros l
JOIN prestamos p ON p.libro_id = l.id
GROUP BY l.id, l.titulo
ORDER BY prestamos DESC, l.titulo
LIMIT 3;
```

El segundo criterio de orden (`l.titulo`) desempata: sin él, cuando dos libros tienen los
mismos préstamos, la base de datos puede devolverlos en cualquier orden y el "top 3" podría
cambiar de una ejecución a otra.

## Los grupos sin actividad también cuentan

Un reporte de préstamos por género hecho con `JOIN` omite los géneros que nadie ha pedido,
que quizá sean justo lo que interesa ver. Con `LEFT JOIN` aparecen con un cero:

```sql
SELECT l.genero, COUNT(p.id) AS prestamos
FROM libros l
LEFT JOIN prestamos p ON p.libro_id = l.id
GROUP BY l.genero
ORDER BY prestamos DESC, l.genero;
```

Recuerda contar una columna de la tabla derecha (`COUNT(p.id)`), no `COUNT(*)`.

Y para listar solo lo que **no** tiene actividad, usa `NOT EXISTS`:

```sql
-- Libros que nunca se han prestado
SELECT l.titulo
FROM libros l
WHERE NOT EXISTS (SELECT 1 FROM prestamos p WHERE p.libro_id = l.id);
```

## Promedios con fechas

¿Cuántos días pasa un libro fuera? La duración de un préstamo devuelto es
`fecha_devolucion - fecha_prestamo`, un número de días que se puede promediar:

```sql
SELECT ROUND(AVG(p.fecha_devolucion - p.fecha_prestamo), 1) AS dias_promedio
FROM prestamos p
WHERE p.fecha_devolucion IS NOT NULL;
```

El `WHERE` deja fuera los préstamos activos, que todavía no tienen duración. (Aunque no lo
escribieras, `AVG` ignora los `NULL`; ponerlo deja clara la intención y evita sorpresas si
después agregas un `COUNT(*)`.)

## HAVING: grupos con datos suficientes

Un promedio calculado con un solo dato dice poco. `HAVING` permite quedarse solo con los
grupos que tengan una cantidad mínima de filas:

```sql
SELECT l.genero, ROUND(AVG(p.fecha_devolucion - p.fecha_prestamo), 1) AS dias_promedio
FROM prestamos p
JOIN libros l ON l.id = p.libro_id
WHERE p.fecha_devolucion IS NOT NULL
GROUP BY l.genero
HAVING COUNT(*) >= 2;
```

Repasa el orden en que se evalúa una consulta, porque explica qué puede ir en cada parte:

```text
FROM / JOIN  →  WHERE  →  GROUP BY  →  HAVING  →  SELECT  →  ORDER BY  →  LIMIT
```

## ¿Y ahora?

Con este módulo terminas la ruta de SQL. Has diseñado un modelo, lo has creado con sus
restricciones, lo has llenado y modificado, y le has hecho preguntas simples y complejas.
Es el ciclo completo de trabajo con una base de datos relacional.

El último ejercicio te propone repetirlo con un tema que elijas tú. Para practicar fuera de
la plataforma puedes instalar PostgreSQL en tu computadora: todo lo que has escrito aquí
funciona igual.

## Resumen

- Construye los reportes por capas: unir, agrupar, filtrar, ordenar.
- Añade un criterio de desempate al `ORDER BY` antes de usar `LIMIT`.
- `LEFT JOIN` + `COUNT(columna)` incluye los grupos con cero.
- `fecha - fecha` se puede promediar con `AVG` y redondear con `ROUND`.
- `WHERE` filtra filas antes de agrupar; `HAVING` filtra grupos después.
