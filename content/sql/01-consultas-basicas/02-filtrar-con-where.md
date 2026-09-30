---
title: Filtrar filas con WHERE
description: Quédate solo con las filas que cumplen una condición.
objectives:
  - Filtrar filas con WHERE y los operadores de comparación.
  - Combinar condiciones con AND, OR y NOT.
  - Usar IN, BETWEEN y LIKE / ILIKE.
  - Buscar valores desconocidos con IS NULL.
estimatedMinutes: 30
sources:
  - title: 'PostgreSQL — 7.2.2. The WHERE Clause'
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-WHERE
  - title: 'PostgreSQL — 9.2. Comparison Functions and Operators'
    url: https://www.postgresql.org/docs/current/functions-comparison.html
  - title: 'PostgreSQL — 9.7.1. LIKE'
    url: https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-LIKE
furtherReading:
  - book: sql-apuntes-basicos
prerequisites:
  - sql/01-consultas-basicas/01-select
---

## La cláusula WHERE

`WHERE` va después de `FROM` y deja pasar solo las filas que cumplen una condición:

```sql
SELECT nombre, precio
FROM productos
WHERE precio < 100;
```

Los operadores de comparación son `=`, `<>` (distinto; también se acepta `!=`), `<`, `>`,
`<=` y `>=`. Los textos van entre **comillas simples**:

```sql
SELECT nombre
FROM productos
WHERE categoria = 'Hogar';
```

> En SQL, las comillas dobles `"..."` sirven para nombres de columnas o tablas, no para
> textos. `WHERE categoria = "Hogar"` produce un error.

## Combinar condiciones

- `AND`: se deben cumplir ambas condiciones.
- `OR`: basta con que se cumpla una.
- `NOT`: niega una condición.

```sql
SELECT nombre, precio, stock
FROM productos
WHERE categoria = 'Electrónica' AND stock > 0;
```

`AND` se evalúa antes que `OR`. Si los mezclas, usa paréntesis para dejar clara tu
intención:

```sql
WHERE (categoria = 'Hogar' OR categoria = 'Libros') AND activo
```

Como `activo` ya es booleano, `WHERE activo` equivale a `WHERE activo = TRUE`.

## IN y BETWEEN

`IN` compara contra una lista de valores y `BETWEEN` contra un rango (**incluye** ambos
extremos):

```sql
SELECT nombre FROM productos WHERE categoria IN ('Hogar', 'Libros');

SELECT nombre, precio FROM productos WHERE precio BETWEEN 50 AND 500;
```

## Buscar patrones con LIKE e ILIKE

`LIKE` compara textos usando comodines: `%` representa cualquier cantidad de caracteres y
`_` exactamente uno. `ILIKE` (propio de PostgreSQL) hace lo mismo sin distinguir
mayúsculas y minúsculas.

```sql
-- Productos cuyo nombre empieza con "L"
SELECT nombre FROM productos WHERE nombre LIKE 'L%';

-- Productos que contienen "de" en cualquier parte, sin importar mayúsculas
SELECT nombre FROM productos WHERE nombre ILIKE '%de%';
```

## Valores desconocidos: NULL

`NULL` representa un valor **desconocido o ausente** (por ejemplo, un cliente que no
registró su ciudad). No es cero ni texto vacío, y **no se puede comparar con `=`**:
`ciudad = NULL` nunca es verdadero. Usa `IS NULL` o `IS NOT NULL`:

```sql
SELECT nombre
FROM clientes
WHERE ciudad IS NULL;
```

## Resumen

- `WHERE condición` filtra filas; los textos van entre comillas simples.
- Combina condiciones con `AND`, `OR`, `NOT` y usa paréntesis para aclarar.
- `IN` para listas, `BETWEEN` para rangos, `LIKE`/`ILIKE` para patrones.
- Para `NULL` usa `IS NULL` / `IS NOT NULL`, nunca `= NULL`.
