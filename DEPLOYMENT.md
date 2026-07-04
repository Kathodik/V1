# Deployment auf den Hostinger VPS

Dieses Repository enthält ein automatisches Deployment per **GitHub Actions**:
Bei jedem Push auf `main` (oder manuell per Knopfdruck) verbindet sich GitHub
per SSH mit dem VPS und führt dort `deploy.sh` aus. Das Skript holt den
neuesten Code, baut das Frontend, aktualisiert die Backend-Abhängigkeiten und
startet die Dienste neu.

## Einmalige Einrichtung

### 1. SSH-Schlüssel für GitHub erstellen

Auf deinem **VPS** (per SSH einloggen, wie bisher):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N "" -C "github-actions-deploy"
cat ~/.ssh/github-deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/github-deploy    # <- privaten Schlüssel anzeigen, wird gleich gebraucht
```

### 2. Secrets im GitHub-Repository hinterlegen

Im Repo **kathodik/v1** auf GitHub: `Settings` → `Secrets and variables` →
`Actions` → `New repository secret`. Folgende Secrets anlegen:

| Secret         | Wert                                                                 |
| -------------- | -------------------------------------------------------------------- |
| `VPS_HOST`     | IP-Adresse oder Hostname deines VPS (z. B. `123.45.67.89`)           |
| `VPS_USER`     | SSH-Benutzer, mit dem du dich bisher eingeloggt hast (z. B. `root`)  |
| `VPS_SSH_KEY`  | Der **komplette private Schlüssel** aus Schritt 1 (`cat ~/.ssh/github-deploy`), inkl. der `-----BEGIN/END-----`-Zeilen |
| `VPS_APP_DIR`  | Pfad zum Repository auf dem VPS (z. B. `/root/V1` oder `/var/www/V1`) |
| `VPS_PORT`     | *(optional)* SSH-Port, falls nicht 22                                 |

Den Pfad für `VPS_APP_DIR` findest du auf dem VPS z. B. mit:

```bash
find / -maxdepth 4 -name "deploy.sh" -path "*/V1/*" 2>/dev/null
# oder, falls das Repo noch den alten Stand hat:
find / -maxdepth 4 -type d -name ".git" 2>/dev/null
```

### 3. Repo auf dem VPS auf `main` stellen

Das Deploy-Skript zieht immer den Branch `main`. Einmalig auf dem VPS prüfen:

```bash
cd /pfad/zum/repo
git remote -v          # muss auf github.com/kathodik/v1 zeigen
git checkout main
```

Falls das Repo auf dem VPS über HTTPS geklont wurde und der Pull nach
Anmeldedaten fragt, entweder einen [Personal Access Token](https://github.com/settings/tokens)
verwenden oder das Remote auf SSH umstellen.

## Deployment auslösen

- **Automatisch:** Jeder Push/Merge auf `main` deployt die Seite.
- **Manuell:** Auf GitHub unter `Actions` → `Deploy auf Hostinger VPS` →
  `Run workflow`.

## Anpassungen (falls nötig)

`deploy.sh` versucht, den Backend-Dienst automatisch zu erkennen
(docker compose, systemd, PM2 oder supervisor). Falls die Erkennung
fehlschlägt, oben in `deploy.sh` die Variablen setzen:

- `RESTART_CMD` – der Befehl, mit dem du das Backend bisher manuell neu
  gestartet hast (z. B. `sudo systemctl restart kathodik-backend`).
- `FRONTEND_DEPLOY_DIR` – nur nötig, wenn nginx **nicht** direkt auf
  `frontend/build` zeigt, sondern der Build in ein anderes Verzeichnis
  kopiert werden muss (z. B. `/var/www/html`).

## Wichtige Hinweise

- `frontend/.env` (mit `REACT_APP_BACKEND_URL`) und `backend/.env` liegen
  nur auf dem VPS und werden vom Deployment **nicht** verändert.
- Der Frontend-Build braucht Node.js + Yarn (oder npm) auf dem VPS — das ist
  bereits vorhanden, wenn du bisher manuell gebaut hast.
