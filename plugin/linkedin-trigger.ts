import type { Plugin } from "@opencode-ai/plugin"
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { homedir } from "node:os"

// ============================================================================
// Este plugin NO contiene rutas reales de ningun usuario: se configuran por
// entorno. Solo se activa si las dos variables estan definidas.
//
//   LINKEDIN_PROJECT_DIR     : carpeta del proyecto donde viven los borradores
//                              (destino de "opencode run --dir").
//   LINKEDIN_TRACKED_DIRS    : rutas absolutas (separadas por ";" o ",") desde
//                              las cuales SI quieres que se dispare el borrador
//                              al quedar inactiva la sesion. Si la carpeta actual
//                              no esta dentro de una de estas, no hace nada.
//
// Ejemplo (Git Bash / .bashrc):
//   export LINKEDIN_PROJECT_DIR="/ruta/a/tu/proyecto-linkedin"
//   export LINKEDIN_TRACKED_DIRS="/ruta/al/vault-de-obsidian;/ruta/a/tu/proyecto"
// ============================================================================

const LINKEDIN_DIR = process.env.LINKEDIN_PROJECT_DIR ?? ""
const TRACKED_DIRS = (process.env.LINKEDIN_TRACKED_DIRS ?? "")
  .split(/[;,]/)
  .map((s) => s.trim())
  .filter(Boolean)
const DRAFTS_DIR = LINKEDIN_DIR ? join(LINKEDIN_DIR, "linkedin-drafts") : ""

// Marca temporal por dia ("YYYY-MM-DD") para no regenerar dos borradores el
// mismo dia si la sesion queda idle varias veces.
const MARKER = join(homedir(), ".config", "opencode", ".linkedin-last-run")

// Formato del post: texto plano. El markdown de enfasis se publica literal en
// LinkedIn y rompe el nodo Telegram, asi que aqui se avisa.
const TEXT_BANNED = [
  { re: /\*\*/, label: "negrita markdown (**)" },
  { re: /`/, label: "backtick de codigo" },
]

const latestDraft = () => {
  if (!DRAFTS_DIR || !existsSync(DRAFTS_DIR)) return null
  const files = readdirSync(DRAFTS_DIR).filter((f) => f.endsWith(".md"))
  if (files.length === 0) return null
  return files
    .map((f) => join(DRAFTS_DIR, f))
    .map((p) => ({ p, mtime: statSync(p).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0].p
}

const checkDraft = () => {
  const path = latestDraft()
  if (!path) return { ok: true, issues: [] as string[] }
  const text = readFileSync(path, "utf-8")
  const issues: string[] = []
  for (const { re, label } of TEXT_BANNED) {
    if (re.test(text)) issues.push(`draft usa ${label}`)
  }
  if (!/^---/m.test(text)) issues.push("draft sin frontmatter (falta query/label/takeaway)")
  if (!/^query:/m.test(text)) issues.push("draft sin bloque query (la imagen lo necesita)")
  if (/Kira AI|KIRA AI|ChatGPT|Claude|agente/.test(text)) {
    issues.push("el texto del post nombra a un agente/IA (solo va en la imagen)")
  }
  return { ok: issues.length === 0, issues }
}

export const LinkedInTrigger: Plugin = async ({ directory, $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type !== "session.idle") return
      if (!LINKEDIN_DIR || TRACKED_DIRS.length === 0) return

      const isTracked = TRACKED_DIRS.some((dir) => directory.startsWith(dir))
      if (!isTracked) return

      const today = new Date().toISOString().slice(0, 10)
      const lastRun = existsSync(MARKER) ? readFileSync(MARKER, "utf-8").trim() : ""
      if (lastRun === today) return // ya se genero un borrador hoy, no repetir

      const prompt =
        `Revisa mis notas de Obsidian de hoy (${today}) en ambas secciones — ` +
        `aprendizaje (SQL/Python en "Data Analyst Base de Conocimiento/") y kira ` +
        `("Kira AI Project/") — y genera un borrador de post de LinkedIn para la seccion ` +
        `con avance concreto, siguiendo estrictamente la skill linkedin-post-style. ` +
        `Prefiere aprendizaje si ambas tienen material. Si ninguna tiene avance concreto ` +
        `hoy, dilo y no generes nada. ` +
        `El texto va plano: nunca uses ** ni backticks. Elige UN query de la nota y ` +
        `dejalo literal en el frontmatter (query, label, takeaway, imagen). No uses ` +
        `modelos de vision ni pidas capturas.`

      // Ejecuta el flujo y SOLO marca el dia como generado si el run termino OK
      // y el borrador respeta el formato, asi un fallo se puede reintentar.
      const result = await $`opencode run --agent linkedin_agent --dir "${LINKEDIN_DIR}" --auto ${prompt}`
        .quiet()
        .nothrow()

      const check = checkDraft()
      if (result.exitCode === 0 && check.ok) {
        mkdirSync(dirname(MARKER), { recursive: true })
        writeFileSync(MARKER, today)
      } else {
        const issues = check.issues.length ? `: ${check.issues.join("; ")}` : ""
        console.log(`[linkedin-trigger] run=${result.exitCode}, sin marcar el dia${issues}`)
      }
    },
  }
}
