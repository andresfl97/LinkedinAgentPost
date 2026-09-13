# Seguridad

Este repositorio es **público** y de lectura. Aquí **nunca** debe existir
información real de nadie: ni tus tokens, ni tus rutas, ni tus IDs personales.

## Reglas de oro

1. **Placeholders siempre.** Todo valor que en tu máquina es real va en el repo
   como `YOUR_*` (ver `opencode.json.example` y `workflows/linkedin-post-v2.template.ts`).
2. **La configuración local no se sube.** Tu `opencode.json` con el token MCP de
   n8n, tu `package.json`, tu `node_modules/` y tus `.env` quedan fuera del repo
   (`.gitignore` ya los bloquea).
3. **Nada de credenciales de aplicación.** Tokens de bots de Telegram, tokens de
   API de LinkedIn, claves de DeepSeek/OpenAI y JWTs generados por tu instancia
   de n8n se quedan en el gestor de credenciales de n8n y en tus archivos locales.
4. **Nada de datos personales.** Chat IDs, URNs de usuario, dominios privados de
   instancias, email, rutas absolutas de tu disco y capturas con info sensible
   no entran al árbol de este repo.
5. **Verifica antes de empujar.** Corre el escáner sobre los archivos staged:

   ```bash
   ./scripts/scan-secrets.sh
   ```

   Y, en CI, sobre todo el árbol: `./scripts/scan-secrets.sh --ci`.

## Qué sí vive aquí

- Agentes, skill y plugin de OpenCode **saneados** (rutas por variables de
  entorno, URLs con dominio genérico).
- Plantilla del workflow de n8n con valores `YOUR_*`.
- Scripts de seguridad, diagramas y documentación.

## Configura localmente (fuera del repo)

- Copia `opencode.json.example` → `opencode.json` y pega **tu** token MCP.
- Define las variables de entorno del plugin (`LINKEDIN_PROJECT_DIR`,
  `LINKEDIN_TRACKED_DIRS`).
- Rellena la plantilla del workflow con tus credenciales de n8n y guárdala
  localmente; no la subas con valores reales.

## Protección adicional en GitHub

Ten activados **secret scanning** y **push protection** en el repositorio
(Configuración → Code security and analysis). GitHub detecta tipos de secretos
conocidos y bloquea el push si uno se cuela: esto es un backstop, no un permiso
para subir secretos.

> Si encuentras un secreto real (aunque sea "solo una captura"), rótalo como
> sensible, rótalo del historial y revócalo. No confíes en que el backstop te
> salve: el primer control eres tú.