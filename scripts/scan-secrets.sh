#!/usr/bin/env bash
# ============================================================================
# scan-secrets.sh - Escaner de secretos GENERICO para repos de OpenCode+n8n.
#
# Previene subir: JWTs, Bearer tokens, API keys, passwords, private keys,
# GitHub PATs, claves de cloud y tarjetas.
#
# Uso:
#   scripts/scan-secrets.sh                 # escanea los archivos STAGED
#   scripts/scan-secrets.sh <archivo|dir>   # escanea un archivo/carpeta
#   scripts/scan-secrets.sh --ci            # escanea todo el arbol (CI)
#
# Nota: este escaner detecta PATRONES (clases de secretos), no valores reales.
# La regla de oro del repo sigue siendo: en repos publicos solo placeholders
# (YOUR_*), nunca configuracion local ni datos personales.
# ============================================================================
set -euo pipefail

PATTERNS=(
  'eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}'           # JWT
  'Bearer[ ][A-Za-z0-9._-]{20,}'                                          # Bearer token
  'Authorization[[:space:]]*:'                                            # cabecera auth
  '(api[_-]?key|x-api-key)[[:space:]]*[:=]'                                # API keys
  'password[[:space:]]*[:=]'                                              # password
  'secret[[:space:]]*[:=]'                                                # secret
  'access[_-]?token[[:space:]]*[:=]'                                      # access token
  '(ghp_|gho_|ghu_|ghs_|github_pat_)[A-Za-z0-9]+'                         # GitHub PATs
  'AKIA[0-9A-Z]{16}'                                                      # AWS
  '-----BEGIN (RSA|OPENSSH|EC|PGP|DSA) PRIVATE KEY'                        # llaves
  'sk_live_[A-Za-z0-9]{10,}'                                              # Stripe live
  'sk-[A-Za-z0-9]{20,}'                                                   # OpenAI
)

read_args() {
  if [[ "${1:-}" == "--ci" ]]; then
    mapfile -t FILES < <(git ls-files)
  elif [[ "$#" -gt 0 ]]; then
    FILES=("$@")
  else
    mapfile -t FILES < <(git diff --cached --name-only --diff-filter=ACM)
  fi
}

SELF="$(basename "$0")"
# Documentacion que describe patrones o plantillas de config: se permiten
# mencionar "Authorization", "Bearer <placeholder>", etc. sin ser secretos.
IGNORED=( "opencode.json.example" "SECURITY.md" "README.md" )
read_args "$@"
FOUND=0

for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || continue
  [[ "$(basename "$f")" == "$SELF" ]] && continue   # el propio script se excluye
  for ign in "${IGNORED[@]}"; do
    [[ "$(basename "$f")" == "$ign" ]] && continue 2
  done
  for p in "${PATTERNS[@]}"; do
    if grep -nE "$p" "$f" >/dev/null 2>&1; then
      echo "[SECRETO]  $f"
      echo "           coincide con el patron: ${p}"
      grep -nE "$p" "$f" | head -3 | sed 's/^/           /'
      FOUND=1
    fi
  done
done

if [[ "$FOUND" -eq 1 ]]; then
  echo ""
  echo "!! Se detectaron posibles secretos en los archivos de arriba."
  echo "!! Reemplaza los valores reales por placeholders (YOUR_*) antes de commitear."
  exit 1
fi
echo "OK: sin secretos detectados en ${#FILES[@]} archivo(s)."