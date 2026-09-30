---
title: Funciones de agregación
description: Resume muchas filas en un solo valor con COUNT, SUM, AVG, MIN y MAX.
objectives:
  - Contar filas y valores con COUNT.
  - Calcular sumas, promedios, mínimos y máximos.
  - Entender cómo tratan los NULL las funciones de agregación.
  - Redondear resultados y contar valores distintos.
estimatedMinutes: 25
sources:
  - title: 'PostgreSQL — 2.7. Aggregate Functions'
    url: https://www.postgresql.org/docs/current/tutorial-agg.html
  - title: 'PostgreSQL — 9.21. Aggregate Functions'
    url: https://www.postgresql.org/docs/current/functions-aggregate.html
  - title: 'PostgreSQL — 9.3. Mathematical Functions (round)'
    url: https://www.postgresql.org/docs/current/functions-math.html
furtherReading:
  - book: sql-apuntes-basicos
prerequisites:
  - sql/01-consultas-basicas/03-ordenar-y-limitar
---

## De muchas filas a un solo valor

Hasta ahora, cada fila de una tabla producía una fila en el resultado. Las **funciones de
agregación** hacen algo distinto: toman **muchas filas** y devuelven **un solo valor** que
las resume.

```sql
SELECT COUNT(*) AS total_productos
FROM productos;
```

| total_productos |
| --------------- |
| 12              |

Las funciones más usadas son:

| Función       | Qué calcula                         |
| ------------- | ----------------------------------- |
| `COUNT(*)`    | Número de filas                     |
| `COUNT(col)`  | Número de valores no nulos en `col` |
| `SUM(col)`    | Suma                                |
| `AVG(col)`    | Promedio                            |
| `MIN(col)`    | Valor mínimo                        |
| `MAX(col)`    | Valor máximo                        |

Puedes calcular varias a la vez:

```sql
SELECT MIN(precio) AS mas_barato,
       MAX(precio) AS mas_caro,
       SUM(stock)  AS unidades
FROM productos;
```

## Agregación con WHERE

`WHERE` se aplica **antes** de agregar: primero se filtran las filas y después se resumen
las que quedan.

```sql
-- ¿Cuántos productos de Electrónica hay?
SELECT COUNT(*)
FROM productos
WHERE categoria = 'Electrónica';
```

## Los NULL no se cuentan

Las funciones de agregación **ignoran los `NULL`**, con una excepción: `COUNT(*)`, que
cuenta filas completas.

```sql
SELECT COUNT(*)     AS clientes,
       COUNT(email) AS con_email
FROM clientes;
```

Si un cliente no tiene email, cuenta en `clientes` pero no en `con_email`. Lo mismo ocurre
con `AVG`: el promedio se calcula solo con los valores no nulos.

## Valores distintos

`COUNT(DISTINCT col)` cuenta cuántos valores **diferentes** hay (sin contar `NULL`):

```sql
SELECT COUNT(DISTINCT categoria) AS categorias
FROM productos;
```

## Redondear

`AVG` suele devolver muchos decimales. `ROUND(valor, n)` redondea a `n` decimales:

```sql
SELECT ROUND(AVG(precio), 2) AS precio_promedio
FROM productos;
```

## Una regla importante

Si usas una función de agregación, **no puedes mezclarla** con columnas normales en el
`SELECT` (por ahora):

```sql
SELECT nombre, MAX(precio) FROM productos;  -- ERROR
```

¿De qué producto sería el `nombre`, si el resultado tiene una sola fila? PostgreSQL
responde con un error. En la siguiente lección verás cómo agrupar para resolverlo.

## Resumen

- Las funciones de agregación convierten muchas filas en un valor.
- `WHERE` filtra antes de agregar.
- Los `NULL` se ignoran, excepto en `COUNT(*)`.
- `COUNT(DISTINCT col)` cuenta valores únicos; `ROUND(x, n)` redondea.
