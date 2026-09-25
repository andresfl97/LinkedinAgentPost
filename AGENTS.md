# AGENTS.md — LinkedinAgentPost

Pipeline de posts de LinkedIn para Andres. Este archivo es la fuente de verdad del
proceso; las reglas de estilo viven en `skills/linkedin-post-style/SKILL.md`.

## Decisiones firmes (no volver a discutir sin que las pida)

1. **El texto del post va plano.** Sin `**`, sin backticks, sin cursivas. LinkedIn no
   renderiza markdown (publica los asteriscos literales) y el nodo Telegram con parse
   mode Markdown falla con `can't parse entities`. El enfasis viene de la estructura,
   no del markdown.
2. **La imagen la genera el agente** con `scripts/generar-imagen-post.py`: dark, 1080x1350,
   sin firma ni marca lateral. No se piden capturas al usuario
   y **no se usan modelos de visión** (quedaron descartados).
3. **La imagen no lleva el nombre de Andres ni la marca.** El texto del post tampoco nombra a
   agentes, IA ni automatización.
4. **5 bullets, 1 emoji cada uno**, cierre de 1-2 líneas de impacto y hashtags al final.
5. **La imagen se sube a GitHub antes de enviar el borrador.** El `imageUrl` es una URL
   `raw.githubusercontent.com`; sin push, n8n da 404 y no publica.
6. **El webhook es el único disparador.** Insertar filas en la data table no ejecuta el
   workflow. Además exige el header `X-LinkedIn-Key`: sin él responde 403. La clave se
   lee de la variable de entorno `LINKEDIN_WEBHOOK_KEY` y nunca se escribe en el repo.

## Flujo de publicación

1. **Nota fuente** en Obsidian: `Data Analyst Base de Conocimiento/` (aprendizaje) o
   `Kira AI Project/` (kira). Sin avance concreto, no se genera post.
2. **`linkedin-drafter`** redacta el borrador en `linkedin-drafts/YYYY-MM-DD-<seccion>.md`
   con frontmatter: `seccion`, `fuente`, `fecha`, `query` (literal de la nota), `label`,
   `takeaway`, `imagen`.
3. **`linkedin-fact-checker`** valida oración por oración contra la nota y devuelve
   `VEREDICTO: OK` o `REVISAR`. Lo que no tiene respaldo va como `[FALTA: ...]`.
4. **Query real**: si es SQL, se ejecuta contra SQL Server (MCP) para obtener 5-8 filas
   reales. Nunca se inventa una grilla.
5. **Imagen**: se escribe un JSON de config y se corre el generador.
6. **Push**: `git add` + `git commit` + `git push` de la imagen en este repo.
7. **Envío** (solo con OK de Andres) al webhook `POST /linkedin-draft-v2` con
   `draftText`, `sourceNote`, `seccion`, `fecha`, `veredicto: "PENDIENTE"`, `imageUrl`,
   `chatId`.
8. **Aprobación en Telegram**: botones Publicar/Descartar o edición escribiendo en el chat.
   Publicar marca la fila como `publicado`.
9. **Auditoría**: si algo falla, revisar ejecuciones con el MCP de n8n y reportar el nodo
   exacto. Nunca editar el workflow sin OK explícito.

## Imagen dark: parámetros del generador

```bash
python scripts/generar-imagen-post.py --config <config.json> --out assets/screenshots/<slug>.png
```

Config JSON:
- `layout`: `code` (query completa arriba, grilla abajo) o `concept` (gancho, tarjetas de
  "lo que quieres / lo que obtienes", las dos opciones de arreglo y el ejemplo abajo).
  Para posts que explican un concepto o un error, `concept` retiene más.
- Comunes: `label`, `title`, `title_size`, `columns`, `rows`, `font_size`, `row_h`,
  `highlight_rows`, `takeaway`, `show_takeaway`, `footer`.
- `signature`: por defecto `false` (la imagen no lleva nombre ni marca lateral). Con
  `true` + `author` se recupera la barra vertical.
- Solo `concept`: `cards` (lista de `{label, text, tone, icon}` con tone `green|amber|red`),
  `fix` (uno o varios `{label, code}` para mostrar más de una solución), `example_label`,
  `badges` (índice de columna → `bad` o `good`, dibuja ✗/✓), `col_colors`.

Paleta: fondo `#0B0F14`, paneles `#131A22`/`#0F151C`, bordes `#243040`, texto `#E6EDF3`,
verde `#3FB950` (SQL y fila destacada), azul `#58A6FF` (takeaway). Fuentes: `consola.ttf`,
`consolab.ttf`, `segoeui.ttf`, `segoeuib.ttf`.

Ejemplo real: `assets/screenshots/ssms-seccion14.png` (query de window ranking functions
con su grilla real y la firma lateral).

## Estructura del repo

| Ruta | Qué es |
| --- | --- |
| `agents/` | drafter, fact-checker y orquestador (`linkedin_agent`) |
| `skills/linkedin-post-style/SKILL.md` | reglas de estilo, texto e imagen |
| `plugin/linkedin-trigger.ts` | hook: dispara el borrador al quedar idle y valida el formato |
| `workflows/linkedin-post-v2.template.ts` | workflow n8n (parseMode None en Telegram) |
| `scripts/generar-imagen-post.py` | generador de la imagen dark |
| `assets/screenshots/` | imágenes ya publicadas (URL estable por nombre) |

## Reglas para quien trabaje en este repo

- No inventes datos ni resultados: todo sale de la nota o de una ejecución real.
- No introduzcas `**` en borradores ni en ejemplos de texto de post.
- No introduzcas modelos de visión ni dependencias de capturas de pantalla.
- No subas valores reales de credenciales, chatId ni tokens.
- Mantén sincronizadas las copias de `agents/` y `skills/` con las de `.opencode/` del
  entorno de trabajo: el repo es la copia que se versiona.
