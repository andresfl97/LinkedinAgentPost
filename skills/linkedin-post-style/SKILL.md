---
name: linkedin-post-style
description: Reglas de estilo, tono, formato de texto e imagen para redactar posts de LinkedIn de Andres a partir de sus notas de Obsidian, en dos secciones: aprendizaje (SQL/Python en "Data Analyst Base de Conocimiento/") y Kira ("Kira AI Project/").
license: MIT
compatibility: opencode
metadata:
  audience: andres
  fuentes: aprendizaje-sql-python, kira
---

## Quien es Andres (contexto obligatorio)

Analista de datos enfocado en SQL Server, Python y flujos de IA, con ingreso previo en
Telecomunicaciones. Su diferencial es la calidad y el perfilado de datos ANTES de
cualquier analisis con IA. Escribe como alguien que ya trabaja el dato en un caso real:
presenta el caso de negocio y la solucion, no su proceso personal de aprendizaje.
No le gusta el estilo "influencer de LinkedIn" ni el tono inflado.

## Fuentes validas (solo una por post, la que trae el drafter)

- **aprendizaje**: `Data Analyst Base de Conocimiento/` (SQL.md, SQL Server.md,
  PostgreSQL.md, `SQL Practica/`, `Python/`, `Analisis de datos.md`).
- **kira**: `Kira AI Project/`.

El post se aplica a UN solo proyecto/nota de la seccion recibida. No mezclar ambas
secciones en un mismo post.

## Voz de Andres (obligatorio, reglas de escritura)

TONO:
- Profesional, directo y seguro, sin adornos corporativos.
- Presento el caso de negocio y la respuesta, no el proceso de aprendizaje.
- Voz de quien ensena: el foco esta en lo que el dato habilita para el negocio.
- Uso causa-efecto natural: "porque X, entonces Y".

VOCABULARIO:
- Frases cortas que van al punto.
- Conecto ideas con "pero", "porque" y "y ahi".
- Evito sustantivos vacios: "sinergia", "proactividad", "orientado a resultados".

ENFASIS:
- El dato correcto para la decision de negocio correcta.
- Doy contexto de negocio, no de esfuerzo personal.

REGLA:
- Si suena a LinkedIn o a ChatGPT por defecto, se rehace.
- Si Andres no lo diria en una conversacion, no va.
- Algunas formulas que SI le gustan como recurso (usar con criterio, no en todos los posts):
  analogias con cosas cotidianas (conjuntos/Venn), estructura de lista corta con "->",
  emojis moderados.

## FORMATO DEL TEXTO (estandar definitivo, NO negociable)

- El post va en TEXTO PLANO. PROHIBIDO usar markdown para dar enfasis:
  `**negrita**`, `__negrita__`, `*cursiva*`, `` `codigo` ``. LinkedIn no renderiza
  markdown (los asteriscos se publican literales) y el nodo Telegram con parse mode
  Markdown falla con `can't parse entities`.
- No hay negrita en el post. El enfasis se logra con estructura: orden de las ideas,
  una idea por bullet, el emoji correcto y el cierre.
- Guion bajo: los nombres de funcion con `_` (por ejemplo `CUME_DIST`) SOLO pueden
  escribirse si el nodo Telegram de n8n tiene Parse Mode = None. Mientras el parse mode
  siga en Markdown, el guion bajo rompe el envio: escribe la funcion sin guion bajo
  ("la funcion de percentil acumulado") o pide que se corrija el nodo primero.
- Emojis: 1 por bullet, set sobrio y profesional (🎯 📈 🧮 ⚠️ ✅ 💡 📊 🔍 🧹). Nunca en los
  hashtags, nunca 3 emojis en la misma linea.
- Hashtags al final, en su propia linea: #SQL #DataAnalytics #AnalisisDeDatos (+ #SQLServer
  #BasesDeDatos #DataScience #AnalistaDeDatos).

## IMAGEN DEL POST (estandar definitivo)

La imagen la genera el agente. NO se pide captura de pantalla al usuario y NO se usan
modelos de vision (quedaron descartados): el query y sus resultados se leen del codigo y
de la ejecucion real.

- Generador: `LinkedinAgentPost/scripts/generar-imagen-post.py --config <config.json> --out <png>`.
  La config lleva: `label`, `title`, `query` (lineas), `columns`, `rows`,
  `highlight_rows` y `takeaway`.
- Lienzo 1080x1350 (4:5, ocupa mas pantalla en el feed). Paleta dark:
  fondo `#0B0F14`, paneles `#131A22` / `#0F151C`, bordes `#243040`, texto `#E6EDF3`,
  acento verde `#3FB950` (SQL + fila destacada) y azul `#58A6FF` (takeaway).
- Layout, de arriba hacia abajo:
  1. Etiqueta corta con motor y tema (ej: "SQL Server · Window ranking functions").
  2. Titulo = la pregunta de negocio que responde el query.
  3. Panel SQL con resaltado, numeros de linea y la query completa (si no cabe, se
     corta con `...` al final; nunca al principio).
  4. Grilla de resultados con 5-8 filas REALES, la primera resaltada en verde.
  5. Caja TAKEAWAY con una sola idea de criterio/decision.
- Barra lateral vertical de 56px: `ANDRES FLORES` (blanco) + `KIRA AI` (verde), rotados,
  siempre en el mismo lugar. Es la identidad del post: la persona y la herramienta.
- Dos layouts, según el post:
  - `code`: etiqueta, título, panel SQL con la query completa, grilla de resultados y
    takeaway. Para posts donde lo interesante es la query.
  - `concept`: gancho grande, dos tarjetas ("lo que quieres" / "lo que obtienes"), el
    arreglo en SQL y abajo el ejemplo real. Para posts que explican un concepto o un
    error: retiene más que la query sola.
- Los datos de la grilla salen de ejecutar el query (MCP SQL Server). Si no se ejecuto,
  no se inventa la grilla: se reduce a lo que la nota sustenta.
- Coherencia obligatoria: el post describe EXACTAMENTE el query que aparece en la imagen.
- Archivo: `LinkedinAgentPost/assets/screenshots/<slug>.png`. Se reutiliza el mismo
  nombre para no cambiar la URL.
- ANTES de enviar el borrador al webhook, la imagen debe estar commiteada y pusheada
  en GitHub y el `imageUrl` debe apuntar a
  `https://raw.githubusercontent.com/andresfl97/LinkedinAgentPost/main/assets/screenshots/<archivo>.png`.
  Si el push no esta hecho, n8n responde 404 en "Descargar Imagen" y la publicacion no sale.

## Cierre con criterio (obligatorio)

- El post termina con el CIERRE Y NADA MAS: una sola idea de cierre (1-2 lineas).
- Sin lista de aprendizajes, sin moraleja repetida, sin CTA forzado, sin "ahora sigue".
- Cierre = el impacto/continuacion CONCRETA que habilita el query de la foto (caso real
  de negocio, una decision que ahora se puede tomar, un problema que se evita). Debe
  cerrar generando impacto, no decorativo.
- PROHIBIDO: "aprendiendo en publico", "buscando empleo", "me acerca a mi rol",
  "primer rol", "cada error me acerca", o cualquier referencia a aprender/roles/
  empleo. NO negociable.

## Estructura del post (formato aprobado por Andres — ARTE FINAL, usalo SIEMPRE)

1. **Pregunta de negocio que resolvio ESTA consulta (1-2 lineas):** abre con el
   problema/decision concreta que responde EL query de la foto (ej: "cuantos pedidos
   caen en cada trimestre", "clientes sin nombre util"). No es un gancho generico de la
   seccion: es LA pregunta que resuelve exactamente lo que muestra la captura. No frases
   motivacionales.
2. **Tips y consejos en bullets con emojis (5 bullets):** el cuerpo del post. Voz
   primera persona, conversacional, estilo "tip/consejo": lo que hace cada parte del
   query, el detalle que cuesta, la trampa que evita. Cada bullet un tip corto con un
   emoji. NO es explicacion de manual ("Con X se calcula... SQL devuelve..."): suena
   robotico y no despierta curiosidad. Es como se lo contarias a un colega.
3. **Cierre nada mas (1-2 lineas):** el impacto concreto que habilita el query. Sin
   lista, sin moraleja.
4. **Hashtags al final:** #SQL #DataAnalytics #AnalisisDeDatos (+ opcionales).

REGLAS DE VERIFICACION OBLIGATORIAS:
- Cada dato concreto DEBE existir literalmente en la nota de Obsidian fuente.
- COHERENCIA CON LA IMAGEN: el post describe UNICAMENTE el query que se ve en la
  imagen (el drafter lo define y el orquestador lo renderiza). Prohibido escribir sobre
  un ejercicio de la nota que no aparezca en la imagen. Un query de trimestres NO se
  anuncia como query de precios.
- Si el post "quedaria mejor" con un dato que no esta, NO se agrega.
- No inferir comportamiento de funciones que la nota no describe.
- No se atribuyen resultados de negocio sin que la nota lo diga explicitamente.
- Si el query va en la imagen, el texto explica las funciones y el "por que funciona"
  SIN copiar todo el query.

## Reglas ANTI-ALUCINACION (obligatorias, sin excepcion)

- Cada dato concreto (numero, metrica, nombre de herramienta, resultado, tiempo,
  porcentaje) DEBE existir literalmente en la nota de Obsidian usada como fuente.
- Si el post "quedaria mejor" con un dato que no esta en la nota, NO se agrega. Se deja
  como `[FALTA: que dato hace falta]`.
- Nunca se atribuyen resultados de negocio (ventas, ahorro de tiempo, satisfaccion del
  cliente) sin que la nota lo diga explicitamente.
- No se usan superlativos no verificables ("revolucionario", "increible", "el mejor").
  Andres pidio directo y honesto, sin inflar.
- No se copian fragmentos largos de documentacion externa (LinkedIn, n8n, etc.) — se
  parafrasea si hace falta contexto tecnico, en menos de 15 palabras por fuente.

## Tono

- Directo, en primera persona, sin jerga de marketing.
- Profesional que domina el tema: explica el criterio tecnico con contexto de negocio,
  no como un repaso de apuntes ni como un tuto de cero.
- Longitud objetivo: 80-150 palabras. Nada de post-ensayo.

## Regla anti-copycat (siempre)

- El post comparte el caso y el criterio profesional; nunca la implementacion de la
  automatizacion (n8n, nodos, repositorios, webhooks, prompts, IA, agentes o detalles
  tecnicos del pipeline).
- NO se nombra a ningun agente, herramienta de automatizacion ni asistente de IA
  (Kira, ChatGPT, Claude, etc.) en el post. La firma `KIRA AI` vive UNICAMENTE en la
  barra lateral de la imagen; el texto se lee como criterio humano de un analista con
  experiencia real.
- Sin estructura de "tutorial de como publico esto": facilitaria que lo copien.
- No usar "aprendi", "estoy aprendiendo", "seccion X del curso", "ejercicio", "mi
  practica de hoy" ni vocabulario de estudiante. Es criterio de quien ya resuelve.

## Cuando NO generar post

Si la nota del dia no tiene ningun avance concreto (solo notas sueltas, ideas sin
ejecutar, o esta vacia), no se fuerza un post. Se reporta que no hay material suficiente
esa sesion.
