---
title: Filtrar grupos con HAVING
description: Quédate solo con los grupos que cumplen una condición sobre sus agregaciones.
objectives:
  - Filtrar grupos con HAVING.
  - Distinguir cuándo usar WHERE y cuándo HAVING.
  - Combinar WHERE, GROUP BY, HAVING y ORDER BY en una consulta.
estimatedMinutes: 20
sources:
  - title: 'PostgreSQL — 2.7. Aggregate Functions (WHERE y HAVING)'
    url: https://www.postgresql.org/docs/current/tutorial-agg.html
  - title: 'PostgreSQL — 7.2.3. The GROUP BY and HAVING Clauses'
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP
furtherReading:
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/02-agregacion/02-group-by
---

## Filtrar grupos

`WHERE` filtra **filas**, antes de agrupar. Pero ¿cómo te quedas con las categorías que
tienen **más de 2 productos**? Esa condición depende de un `COUNT(*)`, que solo existe
después de agrupar. Para eso está `HAVING`:

```sql
SELECT categoria, COUNT(*) AS productos
FROM productos
GROUP BY categoria
HAVING COUNT(*) > 2;
```

## WHERE o HAVING

|               | `WHERE`                        | `HAVING`                          |
| ------------- | ------------------------------ | --------------------------------- |
| Filtra        | Filas individuales             | Grupos                            |
| Se aplica     | Antes de agrupar               | Después de agrupar                |
| Agregaciones  | **No** puede usarlas           | Sí puede usarlas                  |

```sql
-- ERROR: WHERE no puede usar funciones de agregación
SELECT categoria FROM productos WHERE COUNT(*) > 2 GROUP BY categoria;
```

**Buena práctica:** si una condición no depende de una agregación, ponla en `WHERE`. Así
la base de datos descarta filas antes de agrupar, lo cual es más claro y eficiente.

## Combinar WHERE y HAVING

Puedes usar ambas en la misma consulta. Por ejemplo, categorías con al menos 2 productos
**activos**:

```sql
SELECT categoria, COUNT(*) AS activos
FROM productos
WHERE activo               -- 1. descarta los productos inactivos
GROUP BY categoria         -- 2. agrupa los que quedan
HAVING COUNT(*) >= 2       -- 3. descarta los grupos pequeños
ORDER BY activos DESC;     -- 4. ordena el resultado
```

> En PostgreSQL, `HAVING` no acepta los alias del `SELECT` (`HAVING activos >= 2` da
> error): repite la expresión, como en el ejemplo. `ORDER BY` sí acepta alias.

## El orden completo

```sql
SELECT ...        -- 5. qué columnas mostrar
FROM ...          -- 1. de qué tabla
WHERE ...         -- 2. qué filas conservar
GROUP BY ...      -- 3. cómo agrupar
HAVING ...        -- 4. qué grupos conservar
ORDER BY ...      -- 6. cómo ordenar
LIMIT ...;        -- 7. cuántas filas devolver
```

Los números indican el orden **lógico** en que se evalúa cada parte. Explica, por ejemplo,
por qué `WHERE` no puede usar un `COUNT(*)`: cuando se aplica, los grupos todavía no
existen.

## Resumen

- `HAVING` filtra grupos usando condiciones sobre agregaciones.
- `WHERE` filtra filas antes de agrupar y no puede usar agregaciones.
- Si la condición no necesita una agregación, va en `WHERE`.
- En PostgreSQL, `HAVING` no usa alias del `SELECT`; `ORDER BY` sí.
