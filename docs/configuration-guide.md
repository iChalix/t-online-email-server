# Umweltfreundliche .env-Konfiguration für t-online E-Mail MCP Server

## Übersicht

Der MCP-Server nutzt **ausschließlich** die `.env`-Datei für alle Konfigurationseinstellungen. Dies bietet folgende Vorteile:

- 🔒 **Sicherheit**: Zugangsdaten bleiben lokal und werden nicht über Umgebungsvariablen übertragen
- 🎯 **Einfachheit**: Zentrale Konfiguration an einem Ort
- ✅ **Validierung**: Automatische Überprüfung aller Einstellungen beim Start
- 🚀 **Portabilität**: Einfache Übertragung zwischen Entwicklungs- und Produktionsumgebungen

## Konfigurationsdatei (.env)

```bash
# ====================================
# E-MAIL ZUGANGSDATEN (ERFORDERLICH)
# ====================================

# Deine t-online E-Mail-Adresse
EMAIL_ADDRESS=deine-email@t-online.de

# App-Passwort (NICHT das normale Passwort!)
# Erstelle ein App-Passwort im t-online Kundencenter
EMAIL_PASSWORD=dein-app-passwort

# ====================================
# IMAP EINSTELLUNGEN (OPTIONAL)
# ====================================
# Standardwerte sind für t-online optimiert

# IMAP-Server für t-online
IMAP_HOST=secureimap.t-online.de

# IMAP-Port (993 für TLS)
IMAP_PORT=993

# TLS-Verschlüsselung aktivieren
IMAP_TLS=true

# ====================================
# SMTP EINSTELLUNGEN (OPTIONAL)
# ====================================
# Für zukünftige E-Mail-Versendung

# SMTP-Server für t-online
SMTP_HOST=securesmtp.t-online.de

# SMTP-Port (587 für STARTTLS)
SMTP_PORT=587

# TLS-Verschlüsselung für SMTP
SMTP_TLS=true

# ====================================
# SERVER EINSTELLUNGEN (OPTIONAL)
# ====================================

# Name des MCP-Servers
MCP_SERVER_NAME=t-online-email-server

# Debug-Modus aktivieren (true/false)
DEBUG=false
```

## Konfigurationsvalidierung

Der Server validiert alle Einstellungen automatisch beim Start:

### Erforderliche Felder
- ✅ `EMAIL_ADDRESS` - Muss gültige E-Mail-Adresse sein
- ✅ `EMAIL_PASSWORD` - Darf nicht leer sein

### Automatische Defaults
- 🔧 `IMAP_HOST` → `secureimap.t-online.de`
- 🔧 `IMAP_PORT` → `993`
- 🔧 `IMAP_TLS` → `true`
- 🔧 `SMTP_HOST` → `securesmtp.t-online.de`
- 🔧 `SMTP_PORT` → `587`
- 🔧 `SMTP_TLS` → `true`
- 🔧 `MCP_SERVER_NAME` → `t-online-email-server`
- 🔧 `DEBUG` → `false`

### Datentyp-Konvertierung
- 🔄 Port-Nummern werden zu Zahlen konvertiert
- 🔄 Boolean-Werte (`true`/`false`) werden korrekt geparst
- 🔄 Strings werden getrimmt

## Fehlerbehandlung

Bei fehlerhafter Konfiguration erhältst du hilfreiche Fehlermeldungen:

```bash
❌ Konfigurationsfehler in .env-Datei:
  - EMAIL_ADDRESS: Gültige E-Mail-Adresse erforderlich
  - EMAIL_PASSWORD: E-Mail-Passwort erforderlich

💡 Tipps:
  - Überprüfe deine .env-Datei im Projektverzeichnis
  - Verwende .env.example als Vorlage
  - Stelle sicher, dass EMAIL_ADDRESS und EMAIL_PASSWORD gesetzt sind
  - Für t-online benötigst du ein App-Passwort (siehe docs/app-password-guide.md)
```

## Sicherheitsaspekte

### ✅ Was gut ist:
- `.env`-Datei ist in `.gitignore` enthalten
- Passwörter werden lokal gespeichert
- Automatische TLS-Verschlüsselung
- Validierung verhindert unsichere Konfigurationen

### ⚠️ Wichtige Hinweise:
- Verwende **niemals** dein Haupt-Passwort
- Erstelle ein **App-Passwort** im t-online Kundencenter
- Teile die `.env`-Datei nicht über Git oder andere Versionskontrollsysteme
- Sichere Backups der `.env`-Datei an einem sicheren Ort

## Debug-Konfiguration

Für Entwicklung und Fehlerbehebung:

```bash
# Debug-Modus aktivieren
DEBUG=true
```

Mit aktiviertem Debug-Modus siehst du:
- 🔍 Detaillierte Verbindungsinformationen
- 📡 IMAP-Konfigurationsdetails
- 🔄 Tool-Aufrufe und Parameter
- ❌ Erweiterte Fehlerinformationen

## Umgebungsspezifische Konfiguration

### Entwicklung
```bash
# .env.development
DEBUG=true
MCP_SERVER_NAME=t-online-email-dev
```

### Produktion
```bash
# .env.production
DEBUG=false
MCP_SERVER_NAME=t-online-email-server
```

## Andere E-Mail-Provider

Der Server kann auch für andere Provider konfiguriert werden:

### Gmail
```bash
EMAIL_ADDRESS=deine-email@gmail.com
EMAIL_PASSWORD=app-passwort
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Outlook/Hotmail
```bash
EMAIL_ADDRESS=deine-email@outlook.com
EMAIL_PASSWORD=app-passwort
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

## Backup und Migration

### Konfiguration sichern
```bash
# Sichere deine .env-Datei
cp .env .env.backup.$(date +%Y%m%d)
```

### Migration zwischen Systemen
```bash
# Übertrage nur die .env-Datei
scp .env user@remote-server:/path/to/project/
```

## Troubleshooting

### Problem: Server startet nicht
```bash
# Überprüfe .env-Datei Existenz
ls -la .env

# Teste Konfiguration
npm run dev
```

### Problem: Authentifizierungsfehler
```bash
# Aktiviere Debug-Modus
echo "DEBUG=true" >> .env
npm run dev
```

### Problem: Ungültige Konfiguration
```bash
# Verwende die Vorlage neu
cp .env.example .env
# Bearbeite mit deinen Daten
```

---

**💡 Tipp**: Die `.env`-Datei ist der einzige Ort, wo du Konfigurationen vornehmen musst. Claude Desktop benötigt keine zusätzlichen Umgebungsvariablen!