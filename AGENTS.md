# AGENTS.md — LinkedinAgentPost

Pipeline de posts de LinkedIn para Andres. Este archivo es la fuente de verdad del
proceso; las reglas de estilo viven en `skills/linkedin-post-style/SKILL.md`.

## Decisiones firmes (no volver a discutir sin que las pida)

1. **El texto del post va plano.** Sin `**`, sin backticks, sin cursivas. LinkedIn no
   renderiza markdown (publica los asteriscos literales) y el nodo Telegram con parse
   mode Markdown falla con `can't parse entities`. El enfasis viene de la estructura,
   no del markdown.
2. **La imagen la genera el agente** con `scripts/generar-imagen-post.py`: dark, 1080x1350,
   con la firma `KIRA AI` en la barra lateral vertical. No se piden capturas al usuario
   y **no se usan modelos de visión** (quedaron descartados).
3. **La firma `KIRA AI` solo existe en la imagen.** El texto del post nunca nombra a
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

Config JSON: `label`, `title`, `query` (array de líneas), `columns`, `rows`,
`highlight_rows` (índices), `takeaway`.

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
