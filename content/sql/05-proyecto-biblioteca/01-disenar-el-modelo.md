---
title: Diseñar el modelo
description: Convierte los requisitos de una biblioteca en tablas, columnas, claves y restricciones.
objectives:
  - Identificar entidades, atributos y relaciones a partir de una descripción.
  - Distinguir relaciones de uno a muchos y de muchos a muchos.
  - Decidir en qué tabla va cada clave foránea.
  - Evitar datos repetidos separando la información en tablas.
  - Traducir el diseño a sentencias CREATE TABLE con sus restricciones.
estimatedMinutes: 45
sources:
  - title: 'PostgreSQL — 5.5. Constraints'
    url: https://www.postgresql.org/docs/current/ddl-constraints.html
  - title: 'PostgreSQL — 3.3. Foreign Keys'
    url: https://www.postgresql.org/docs/current/tutorial-fk.html
  - title: 'PostgreSQL — 5.1. Table Basics'
    url: https://www.postgresql.org/docs/current/ddl-basics.html
furtherReading:
  - book: diseno-bases-de-datos
  - book: bases-de-datos-relacionales
prerequisites:
  - sql/04-modificar-datos/04-create-table
---

## El proyecto

En este módulo construirás, de principio a fin, la base de datos de una biblioteca de
barrio: primero el **diseño**, después la **carga de datos**, luego las **consultas del día
a día** y, por último, los **reportes**. Usarás todo lo aprendido en los módulos anteriores.

Estos son los requisitos, tal como los contaría la bibliotecaria:

> Tenemos libros, y de algunos hay varios ejemplares. De cada libro nos interesa el título,
> el autor, el género y el año. De los autores guardamos el nombre y el país. Las personas
> que se hacen socias nos dan su nombre y, si quieren, su email. Cuando un socio se lleva
> un libro anotamos la fecha y la fecha límite para devolverlo, y cuando lo devuelve,
> anotamos la fecha de devolución.

## Paso 1: entidades y atributos

Una **entidad** es una "cosa" de la que se guardan datos; cada entidad será una tabla. Sus
**atributos** serán las columnas. Subraya los sustantivos del texto:

| Entidad    | Atributos                                              |
| ---------- | ------------------------------------------------------ |
| Autor      | nombre, país                                           |
| Libro      | título, género, año, número de ejemplares              |
| Socio      | nombre, email, fecha de alta                           |
| Préstamo   | fecha del préstamo, fecha límite, fecha de devolución  |

Cada tabla necesita además una **clave primaria**. Los nombres y los títulos pueden
repetirse o cambiar, así que lo habitual es agregar una columna `id`.

## Paso 2: relaciones

Ahora pregúntate cómo se relacionan las entidades, **en ambos sentidos**:

- Un autor puede tener **muchos** libros; un libro tiene **un** autor (en esta biblioteca
  simplificamos: un solo autor por libro). Es una relación de **uno a muchos**.
- Un socio puede llevarse **muchos** libros a lo largo del tiempo, y un libro puede ser
  prestado a **muchos** socios. Es una relación de **muchos a muchos**.

### Uno a muchos: la clave foránea va en el lado "muchos"

Cada libro guarda a qué autor pertenece:

```sql
autor_id INTEGER NOT NULL REFERENCES autores (id)
```

No puede ser al revés: un autor tendría que guardar una lista de libros en una sola
columna, y las columnas deben contener **un solo valor**.

### Muchos a muchos: una tabla intermedia

Ni `libros` puede guardar "sus socios" ni `socios` "sus libros". Hace falta una tabla
intermedia con una clave foránea hacia cada lado. Aquí esa tabla es `prestamos`, y además
tiene datos propios (las fechas). Es el mismo patrón que `pedido_detalle` en la tienda.

Como el mismo socio puede llevarse el mismo libro más de una vez, la pareja
`(libro_id, socio_id)` puede repetirse: por eso `prestamos` tiene su propio `id` en lugar
de una clave primaria compuesta.

## Paso 3: no repitas datos

¿Por qué no guardar el nombre y el país del autor directamente en `libros`?

| titulo               | autor                  | pais     |
| -------------------- | ---------------------- | -------- |
| Cien años de soledad | Gabriel García Márquez | Colombia |
| El amor en los…      | Gabriel Garcia Marquez | Colombia |

Porque el mismo dato quedaría escrito muchas veces, y tarde o temprano de formas
distintas (fíjate en los acentos). Corregir el nombre exigiría cambiar todas las filas, y
no se podría registrar un autor del que aún no hay libros. Con una tabla `autores`, cada
dato vive **en un solo lugar**. Este principio se llama **normalización**.

Una pista práctica: si un grupo de columnas describe otra "cosa" y se repite en muchas
filas, probablemente merece su propia tabla.

## Paso 4: tipos y restricciones

Para cada columna decide el tipo y las reglas. Hazte estas preguntas:

- ¿Es obligatoria? → `NOT NULL`. El país y el email son opcionales; el título no.
- ¿Puede repetirse? → `UNIQUE`. Dos socios no deberían compartir el mismo email.
- ¿Tiene un valor habitual? → `DEFAULT`. Lo normal es tener un ejemplar; la fecha de alta
  suele ser hoy.
- ¿Hay valores imposibles? → `CHECK`. No puede haber cero ejemplares, ni una fecha límite
  anterior a la del préstamo.

Una restricción `CHECK` que compara **varias columnas** se escribe aparte, al final de la
tabla, igual que una clave primaria compuesta:

```sql
CREATE TABLE reservas (
  id     INTEGER PRIMARY KEY,
  inicio DATE NOT NULL,
  fin    DATE NOT NULL,
  CHECK (fin >= inicio)
);
```

Para un dato que puede faltar, recuerda que una comparación con `NULL` no es ni verdadera
ni falsa, y `CHECK` solo rechaza lo que es **falso**. Aun así, es más claro decirlo de
forma explícita:

```sql
CHECK (cancelada IS NULL OR cancelada >= inicio)
```

## El diseño final

```text
autores (id, nombre, pais)
libros (id, titulo, autor_id → autores, genero, anio, ejemplares)
socios (id, nombre, email, fecha_alta)
prestamos (id, libro_id → libros, socio_id → socios,
           fecha_prestamo, fecha_limite, fecha_devolucion)
```

El orden de creación importa: una tabla solo puede referenciar a otra que ya existe.
Primero `autores`, luego `libros`; `socios` antes que `prestamos`.

## Resumen

- Cada entidad es una tabla; cada atributo, una columna; cada tabla tiene clave primaria.
- Uno a muchos: la clave foránea va en la tabla del lado "muchos".
- Muchos a muchos: tabla intermedia con dos claves foráneas.
- Cada dato debe guardarse en un solo lugar.
- Las restricciones convierten las reglas del negocio en reglas de la base de datos.
