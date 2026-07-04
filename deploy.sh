#!/usr/bin/env bash
#
# Deploy-Skript für die Kathodik-Webseite auf dem Hostinger VPS.
# Wird von der GitHub Action per SSH ausgeführt, kann aber auch
# manuell auf dem Server gestartet werden:
#
#   bash deploy.sh
#
# Erwartet, dass dieses Repository bereits auf dem VPS geklont ist
# und die App dort läuft (frontend/.env und backend/.env vorhanden).

set -euo pipefail

# ---------------------------------------------------------------
# Konfiguration – bei Bedarf anpassen
# ---------------------------------------------------------------
# Verzeichnis, in das der fertige Frontend-Build kopiert wird
# (z. B. das nginx-Webroot). Leer lassen, wenn nginx direkt auf
# frontend/build zeigt.
FRONTEND_DEPLOY_DIR="${FRONTEND_DEPLOY_DIR:-}"

# Befehl, um das Backend neu zu starten. Leer lassen für
# automatische Erkennung (docker compose / systemd / pm2 / supervisor).
RESTART_CMD="${RESTART_CMD:-}"

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "==> Deployment gestartet in $APP_DIR"

# ---------------------------------------------------------------
# 1. Neuesten Code holen
# ---------------------------------------------------------------
echo "==> Hole neuesten Code (git pull)"
git fetch origin main
git reset --hard origin/main

# ---------------------------------------------------------------
# 2. Frontend bauen
# ---------------------------------------------------------------
if [ ! -f frontend/.env ]; then
  echo "WARNUNG: frontend/.env fehlt (REACT_APP_BACKEND_URL). Der Build"
  echo "         funktioniert, aber API-Aufrufe zeigen dann ins Leere."
fi

echo "==> Baue Frontend"
cd frontend
if command -v yarn >/dev/null 2>&1; then
  yarn install
  yarn build
else
  npm install --legacy-peer-deps --no-audit --no-fund
  # npm hoistet ajv@6, react-scripts 5 braucht aber ajv@8 zur Build-Zeit
  npm install --no-save --legacy-peer-deps --no-audit --no-fund ajv@^8
  npm run build
fi
cd "$APP_DIR"

if [ -n "$FRONTEND_DEPLOY_DIR" ]; then
  echo "==> Kopiere Frontend-Build nach $FRONTEND_DEPLOY_DIR"
  mkdir -p "$FRONTEND_DEPLOY_DIR"
  rsync -a --delete frontend/build/ "$FRONTEND_DEPLOY_DIR/"
fi

# ---------------------------------------------------------------
# 3. Backend-Abhängigkeiten aktualisieren
# ---------------------------------------------------------------
echo "==> Aktualisiere Backend-Abhängigkeiten"
# emergentintegrations liegt nicht auf PyPI, sondern im Emergent-eigenen Index
PIP_ARGS="--extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/"
if [ -f backend/venv/bin/pip ]; then
  backend/venv/bin/pip install -r backend/requirements.txt $PIP_ARGS --quiet
elif [ -f venv/bin/pip ]; then
  venv/bin/pip install -r backend/requirements.txt $PIP_ARGS --quiet
else
  pip3 install -r backend/requirements.txt $PIP_ARGS --quiet
fi

# ---------------------------------------------------------------
# 4. Dienste neu starten
# ---------------------------------------------------------------
echo "==> Starte Dienste neu"
if [ -n "$RESTART_CMD" ]; then
  eval "$RESTART_CMD"
elif [ -f docker-compose.yml ] || [ -f compose.yml ]; then
  docker compose up -d --build
elif systemctl list-units --type=service 2>/dev/null | grep -qiE 'kathodik|uvicorn|fastapi|backend'; then
  SERVICE=$(systemctl list-units --type=service --no-legend 2>/dev/null \
    | grep -iE 'kathodik|uvicorn|fastapi|backend' | awk '{print $1}' | head -1)
  echo "    systemd-Dienst gefunden: $SERVICE"
  sudo systemctl restart "$SERVICE"
elif command -v pm2 >/dev/null 2>&1 && pm2 list 2>/dev/null | grep -qiE 'backend|server|kathodik'; then
  pm2 restart all
elif command -v supervisorctl >/dev/null 2>&1; then
  sudo supervisorctl restart all
else
  echo "WARNUNG: Konnte den Backend-Dienst nicht automatisch erkennen."
  echo "         Bitte RESTART_CMD in deploy.sh setzen, z. B.:"
  echo "         RESTART_CMD='sudo systemctl restart mein-backend'"
  exit 1
fi

echo "==> Deployment erfolgreich abgeschlossen ✔"
