---
name: "linkedin-post-style"
description: "Reglas de estilo, tono y anti-alucinacion para redactar posts de LinkedIn del usuario a partir de sus notas de avance en Obsidian, en dos secciones: aprendizaje (SQL/Python en 'Data Analyst Base de Conocimiento/') y Kira ('Kira AI Project/')."
license: MIT
compatibility: opencode
metadata:
  audience: andres
  fuentes: aprendizaje-sql-python, kira
---

## Quien es el autor del perfil (contexto obligatorio)

Analista de datos en formacion buscando empleo, enfocado en SQL Server, Python y flujos
de IA. Su diferencial es la calidad y el perfilado de datos ANTES de cualquier analisis
con IA. No le gusta el estilo "influencer de LinkedIn" ni el tono inflado.

## Fuentes validas (solo una por post, la que trae el drafter)

- **aprendizaje**: `Data Analyst Base de Conocimiento/` (SQL.md, SQL Server.md,
  PostgreSQL.md, `SQL Practica/`, `Python/`, `Analisis de datos.md`).
- **kira**: `Kira AI Project/`.

El post se aplica a UN solo proyecto/nota de la seccion recibida. No mezclar ambas
secciones en un mismo post.

## Estructura del post

1. **Gancho (1-2 lineas):** un problema real o una decision tecnica concreta, no una
   frase motivacional generica.
2. **Cuerpo (3-6 lineas):** que se construyo o resolvio, con detalle tecnico real
   (herramienta, decision, por que se eligio asi). Aplicado a UNA fuente de la seccion
   usada: un avance real de SQL/Python (aprendizaje) o del proyecto Kira.
3. **Aprendizaje u optimizacion (1-2 lineas):** algo que aprendio o mejoro. Esto es lo
   que mas valor tiene para su busqueda de empleo — destacalo si la nota lo menciona.
4. **Cierre (1 linea):** sin CTA forzado tipo "que opinan?". Puede terminar en una
   afirmacion o pregunta tecnica genuina.

## Reglas ANTI-ALUCINACION (obligatorias, sin excepcion)

- Cada dato concreto (numero, metrica, nombre de herramienta, resultado, tiempo,
  porcentaje) DEBE existir literalmente en la nota de Obsidian usada como fuente.
- Si el post "quedaria mejor" con un dato que no esta en la nota, NO se agrega. Se deja
  como `[FALTA: que dato hace falta]`.
- Nunca se atribuyen resultados de negocio (ventas, ahorro de tiempo, satisfaccion del
  cliente) sin que la nota lo diga explicitamente.
- No se usan superlativos no verificables ("revolucionario", "increible", "el mejor").
  El perfil pidio directo y honesto, sin inflar.
- No se copian fragmentos largos de documentacion externa (LinkedIn, n8n, etc.) — se
  parafrasea si hace falta contexto tecnico, en menos de 15 palabras por fuente.

## Tono

- Directo, en primera persona, sin jerga de marketing.
- Kinestesico: preferir "hice X, me trabo en Y, lo resolvi con Z" sobre teoria
  abstracta.
- Longitud objetivo: 80-150 palabras. Nada de post-ensayo.

## Cuando NO generar post

Si la nota del dia no tiene ningun avance concreto (solo notas sueltas, ideas sin
ejecutar, o esta vacia), no se fuerza un post. Se reporta que no hay material suficiente
esa sesion.
