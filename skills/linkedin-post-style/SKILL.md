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
- Emojis: el cuerpo va en parrafos, no en bullets. Como maximo UN emoji en todo el post y
  nunca en los hashtags. Si hace falta, va al final de la frase que resume el error.
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
  verde `#3FB950` (acento y resultado correcto), azul `#58A6FF` (takeaway) y
  rojo `#F85149` (lo que miente).
- Jerarquia tipografica (no negociar): el TITULO va grande, 58-60px. Las etiquetas de las
  tarjetas ("lo que quieres / lo que obtienes") y las opciones de codigo van tambien
  grandes: 21px y 24px, porque ahi esta lo interesante del post. La grilla es lo unico
  que puede bajar a 26px con 6 filas. Letra chica en las tarjetas o en el codigo se
  ve como documento; letra grande en la tabla se ve como dashboard.
- Layout, de arriba hacia abajo:
  1. Etiqueta corta con motor y tema (ej: "SQL Server · Window ranking functions").
  2. Titulo = la pregunta de negocio que responde el query.
  3. Panel SQL con resaltado, numeros de linea y la query completa (si no cabe, se
     corta con `...` al final; nunca al principio).
  4. Grilla de resultados con 5-8 filas REALES, la primera resaltada en verde.
  5. Caja TAKEAWAY con una sola idea de criterio/decision.
- Sin firma en la imagen: no lleva nombre ni marca lateral. Andres lo pidió así. Si un
  post necesita identidad, se activa con `signature: true` + `author`.
- El takeaway es opcional, pero SOLO en el layout `concept`: `show_takeaway: false` lo
  quita y deja pie de fuente con `footer`. En el layout `code` la caja TAKEAWAY se dibuja
  siempre, porque el generador la pinta sin condicion, asi que un post que no quiere
  takeaway tiene que ir con `concept`. Para posts que ya tienen gancho + ejemplo,
  quitarlo suele retener mejor: `concept` con las tarjetas de "lo que esta mal / lo que
  esta bien", las dos opciones de sintaxis y la grilla real abajo llena el lienzo mejor
  que `code` con el takeaway.
- Dos layouts, según el post:
  - `code`: etiqueta, título, panel SQL con la query completa, grilla de resultados y
    takeaway. Para posts donde lo interesante es la query.
  - `concept`: gancho grande, dos tarjetas ("lo que quieres" / "lo que obtienes"), el
    arreglo en SQL y abajo el ejemplo real. Para posts que explican un concepto o un
    error: retiene más que la query sola.
- En `concept` la grilla tiene que contrastar DOS numeros: la columna que miente con badge
  `bad` (✗) y la que sale bien con badge `good` (✓). Si en los datos reales las dos dan
  practicamente el mismo valor, la imagen no comunica nada: se cambia de caso antes de
  publicar, no se maquilla.
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

1. **Gancho: el sintoma, en primera persona (1-2 lineas).** Arranca con el momento en que
   el dato no cuadraba, en voz de alguien que esta mirando el reporte: "Revisaba un
   reporte y me encontre una columna que no daba lo que deberia". Va con el numero o el
   sintoma concreto adentro, no antes.
   - **PROHIBIDO** abrir con pregunta de negocio generica ("Que empresas tienen...",
     "Como saber si..."): es el formato de manual, no de alguien que encontro el problema.
   - **PROHIBIDO** abrir con lista de bullets: el cuerpo va en parrafos.
2. **Cuerpo: 3-4 parrafos cortos (80-150 palabras en total).** Narrativo, no enumerativo.
   Parrafo 1: que se estaba revisando y que se vio mal. Parrafo 2: por que pasaba, con lo
   tecnico de la funcion o la sintaxis. Parrafo 3: como se resuelve y cual era la
   alternativa. Parrafo 4 (opcional): que decision queda habilitada.
   - Nada de "tips y consejos", nada de 5 bullets con emojis, nada de explicar la funcion
     como si fuera el manual ("Con X se calcula..."). Se cuenta como se lo contarias a un
     colega que esta mirando la misma pantalla.
3. **Cierre nada mas (1-2 lineas):** el impacto concreto que habilita el query. Sin
   lista, sin moraleja, sin CTA.
4. **Hashtags al final:** #SQL #DataAnalytics #AnalisisDeDatos (+ opcionales).

## Caso de uso real (obligatorio)

- Cada post responde UNA decision que alguien tomaria manana en un trabajo. Antes de
  redactar, el drafter elige de la nota el ejercicio que mas se acerca a esa decision y lo
  **ejecuta contra la base**: si el caso elegido no produce un contraste visible con los
  datos reales, se descarta y se prueba otro ejercicio de la misma nota.
- El criterio para descartar: si la columna "correcta" y la "que miente" dan practicamente
  el mismo numero en los datos reales, la imagen no comunica nada y ese caso no sirve.
  Con datos sinteticos hay que verificar el contraste, no asumirlo.
- El post cuenta una sola historia: el caso que se ejecuto. No se anuncian otros
  ejercicios de la nota aunque existan.

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
