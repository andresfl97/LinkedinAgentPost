---
name: linkedin-engagement
description: Que genera INTERACCION real en LinkedIn (2025-2026) y que solo genera impresiones. Algoritmo (dwell + comentarios), ganchos de primera linea, cierres con pregunta, formato, cadencia y trabajo de comunidad para cuentas sin audiencia. Usala al planear, escribir, publicar y medir un post.
license: MIT
compatibility: opencode
metadata:
  audience: andres
  canal: linkedin
  base: research/2026-10-12-engagement-linkedin-que-funciona.md
---

## Regla central

En LinkedIn **no se optimiza por impresiones**. El feed puntua por tiempo de lectura
(dwell) y por **contribuciones** (comentario, repost, guardado); el like es la senal
mas debil. La metrica que manda es **comentarios y reposts por post**, nunca likes
sueltos ni el conteo de seguidores.

Corolario del caso real: muchos posts con **cero reacciones y cero comentarios** pero
impresiones no es un problema de redaccion, es un problema de **distribucion y de
gancho**. Las impresiones llegan aunque el post no enganche; la interaccion no.

## Diagnostico rapido (por que hay vistas sin interaccion)

1. **Gancho vago.** LinkedIn aplica un modelo P(skip): si el lector pasa rapido, el
   post baja. En movil se decide en segundos.
2. **La red es demasiado chica.** El alcance es "network-shaped": con 0-200 seguidores
   el post se muestra a un grupo que no alcanza para que el algoritmo componga.
3. **Cierre que no invita.** Un cierre de moraleja o de metodo no da nada que responder.
4. **Sin opinion.** El contenido generico y sin punto de vista ("AI slop") es lo que
   LinkedIn dice textualmente que no distribuye.

## Reglas (las [FUERTE] tienen medicion o doc oficial)

1. [FUERTE] **Optimiza por comentarios, guardados y dwell.** Mide comentarios y reposts
   por post. Los likes no cuentan como exito.
2. [FUERTE] **Primera linea de 4 a 7 palabras** (menos de 40 caracteres). Mas de 140
   caracteres resta ~24%.
3. [FUERTE] **Abre con un numero o con algo anclado en el tiempo, NUNCA con una
   pregunta.** La pregunta de apertura es el peor gancho medido (indexa 0,88).
4. [FUERTE] **Cierra con UNA pregunta concreta y facil de responder** (+77% de
   comentarios). Nunca "¿pensamientos?" ni "¿y tu que opinas?".
5. [FUERTE] **No pidas engagement** ("like si estas de acuerdo", "comenta SI"). LinkedIn
   lo restringe y lo penaliza.
6. [FUERTE] **Un post cada 20-30 horas**; 5-7 por semana; **nunca dos el mismo dia**
   (menos de 6h entre posts resta).
7. [FUERTE] **Adjunta siempre algo visual** (imagen, carrusel/documento). El texto solo
   es el formato mas debil.
8. [FUERTE] **Comenta con sustancia (15+ palabras) en tu nicho: 8-12 al dia.** Con
   cuenta chica, esta es la palanca principal: tu comentario hereda la audiencia del
   post ajeno. El comentario corto y el "gran post" casi no cuentan.
9. [FUERTE] **Responde rapido cada comentario.** Las conversaciones encadenadas dan
   hasta 2,4x de alcance.
10. [FUERTE] **Publica cuando puedas responder la primera hora.** No existe una hora
    universal: los estudios se contradicen. Probar y medir.
11. [FUERTE] **Cero pods, cero automatizacion de comentarios, cero bots.** Penalizado.
12. [FUERTE] Con cuenta pequena, la mayor parte del esfuerzo es **comentar en posts
    ajenos**; publicar 2-3 por semana para el que visita el perfil.
13. [PRACTICA] **1-3 hashtags relevantes**; 0 tampoco penaliza; mas de 3 cuesta.
14. [PRACTICA] **900-1.700 caracteres**, parrafos cortos con espacios en blanco.
15. [FUERTE] **Espera 3-6 meses de silencio.** La senal de que funciona es engagement de
    personas que **no son tus conexiones**, no el conteo de seguidores.

## Mitos a evitar (no repetir)

- "El enlace te quita 60% de alcance": **sin fuente trazable**. No citarlo.
- "Mas enlaces = mas alcance": tampoco tiene base firme.
- "Los likes miden el exito": es la senal mas debil del algoritmo.
- "Postear mas siempre ayuda": dos veces en un dia te resta.
- "Los pods funcionan": LinkedIn los detecta y penaliza.
- "La golden hour son 60 minutos exactos": el mecanismo existe, la cifra no es publica.
- "Un buen post basta sin comunidad": la distribucion depende de tu red.
- "Preguntar al final siempre es optimo": funciona como **cierre**, no como apertura.

## Como lo aplica el pipeline (gates)

- **Angulo:** el gancho debe caber en 4-7 palabras y arrancar con un numero o un hecho,
  no con una pregunta. Si el gancho no se puede decir en 7 palabras, todavia no esta.
- **Borrador:** texto plano, parrafos cortos, 900-1.700 caracteres.
- **Cierre:** exactamente UNA pregunta concreta. El "espejo" que pide Andres esta bien
  si es respondible en una linea; nunca un cierre de metodo o de moraleja.
- **Imagen:** siempre. El titular corto (una frase) es el gancho visual.
- **Publicacion:** respetar 20-30h entre posts, y publicar cuando Andres pueda responder
  la primera hora.
- **Comunidad (fuera del pipeline, pero es la palanca):** 8-12 comentarios con sustancia
  al dia en el nicho, antes y despues de publicar.

## Que medir en cada post

Registrar por post (texto/CSV, sin capturas):

| Campo | Por que |
| --- | --- |
| impresiones | contexto, no exito |
| comentarios | metrica principal |
| reposts/guardados | metrica principal |
| reacciones | senal debil |
| comentarios de NO-conexiones | senal real de que el contenido viaja |
| respondidos en la primera hora | mide si se cumplio la regla 10 |

## Fuentes principales

- LinkedIn Engineering (dwell time) y LinkedIn Newsroom 2026-03-12 (anti engagement bait).
- Metricool 2026 (673.658 posts): pregunta al cierre +77%; alcance -10% con engagement +14%.
- NBK Social (74.119 posts): primera linea 4-7 palabras; cadencia 20-30h; 6-7 posts/semana.
- AuthoredUp / van der Blom (1,8M posts): el comentario pesa ~2x el like.
- Usera & Durham (SAGE, 2025): las menciones suben comentarios, los hashtags no.
- ContentIn / SocialInsider / LinkPost: formato visual > texto; 900-1.700 caracteres.
- Growtempo (2026): distribucion network-shaped; crecer comentando con cuenta nueva.

Detalle completo con links y fechas: `linkedin-content/research/2026-10-12-engagement-linkedin-que-funciona.md`.
