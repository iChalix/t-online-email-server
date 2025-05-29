# T-Online E-Mail MCP Server

Ein Model Context Protocol (MCP) Server für die Verwaltung von t-online E-Mails.

## Features

- 📧 **E-Mail-Suche**: Durchsuche E-Mails nach Absender, Empfänger, Betreff, Inhalt und Datum
- 📁 **Ordner-Verwaltung**: Erstelle, lösche und verwalte E-Mail-Ordner
- ↔️ **E-Mail-Verschiebung**: Verschiebe E-Mails zwischen Ordnern
- 👁️ **Status-Verwaltung**: Markiere E-Mails als gelesen/ungelesen
- 🗑️ **E-Mail-Löschung**: Lösche E-Mails permanent
- 🔒 **Sichere Verbindung**: Nutzt sichere IMAP/SMTP-Verbindungen zu t-online
- ⚙️ **Konfiguration über .env**: Alle Einstellungen werden aus der .env-Datei geladen

## Installation

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Konfiguration erstellen:**
   ```bash
   cp .env.example .env
   ```
   
   Bearbeite die `.env`-Datei mit deinen t-online Zugangsdaten:
   ```
   EMAIL_ADDRESS=deine-email@t-online.de
   EMAIL_PASSWORD=dein-app-passwort
   ```
   
   **Wichtig:** Der Server nutzt ausschließlich die `.env`-Datei für die Konfiguration. Alle Einstellungen müssen dort gesetzt werden.

3. **Projekt kompilieren:**
   ```bash
   npm run build
   ```

## Konfiguration (.env-Datei)

Der MCP-Server verwendet **ausschließlich** die `.env`-Datei für alle Konfigurationseinstellungen:

```bash
# E-Mail-Zugangsdaten (ERFORDERLICH)
EMAIL_ADDRESS=deine-email@t-online.de
EMAIL_PASSWORD=dein-app-passwort

# IMAP-Einstellungen (optional, Standardwerte für t-online)
IMAP_HOST=secureimap.t-online.de
IMAP_PORT=993
IMAP_TLS=true

# SMTP-Einstellungen (optional, für zukünftige Features)
SMTP_HOST=securesmtp.t-online.de
SMTP_PORT=587
SMTP_TLS=true

# Server-Einstellungen (optional)
MCP_SERVER_NAME=t-online-email-server
DEBUG=false
```

**Alle Konfiguration erfolgt über die .env-Datei** - keine Umgebungsvariablen in der Shell oder Claude Desktop-Konfiguration erforderlich!tige ID der E-Mail
- `folder` (string, optional): Ordner der E-Mail (Standard: "INBOX")

### `delete_email`
Lösche eine E-Mail permanent.

**Parameter:**
- `uid` (number, erforderlich): Eindeutige ID der E-Mail
- `folder` (string, optional): Ordner der E-Mail (Standard: "INBOX")

## Verwendung

### Entwicklung
```bash
npm run dev
```

### Produktion
```bash
npm start
```

### Debug-Modus aktivieren
```bash
# In .env-Datei:
DEBUG=true
```

### Mit Claude Desktop konfigurieren

Füge folgende Konfiguration zu deiner Claude Desktop MCP-Einstellungen hinzu:

```json
{
  "mcpServers": {
    "t-online-email": {
      "command": "node",
      "args": ["/Users/jens/Projects/MCP/t-online-email-server/dist/index.js"]
    }
  }
}
```

**Wichtig:** Die gesamte Konfiguration erfolgt über die `.env`-Datei. Claude Desktop benötigt keine Umgebungsvariablen!

## Beispiele

### E-Mails von einem bestimmten Absender suchen
```javascript
await searchEmails({
  from: "beispiel@domain.de",
  limit: 10
});
```

### Neue E-Mails (ungelesen) anzeigen
```javascript
await searchEmails({
  seen: false,
  folder: "INBOX"
});
```

### E-Mail in einen anderen Ordner verschieben
```javascript
await moveEmail({
  uid: 12345,
  fromFolder: "INBOX",
  toFolder: "Archiv"
});
```

### Neuen Ordner erstellen
```javascript
await createFolder({
  folderName: "Projekte/MCP"
});
```

## Konfigurationsvalidierung

Der Server validiert automatisch alle `.env`-Einstellungen beim Start:

- ✅ **E-Mail-Format** wird überprüft
- ✅ **Erforderliche Felder** werden kontrolliert
- ✅ **Port-Nummern** werden validiert
- ✅ **Boolean-Werte** werden korrekt geparst
- ❌ **Fehlerhafte Konfiguration** stoppt den Server mit hilfreichen Tipps

## Sicherheit

- ✅ Verwende immer App-Passwörter, niemals dein Haupt-Passwort
- ✅ Speichere Zugangsdaten sicher in der `.env`-Datei
- ✅ Nutze TLS-verschlüsselte Verbindungen (standardmäßig aktiviert)
- ✅ Teste zunächst mit einem separaten Test-Account
- ✅ `.env`-Datei ist in `.gitignore` enthalten

## Fehlerbehebung

### Konfigurationsfehler
```
❌ Konfigurationsfehler in .env-Datei:
  - EMAIL_ADDRESS: Gültige E-Mail-Adresse erforderlich
```

**Lösung:**
- Überprüfe deine `.env`-Datei im Projektverzeichnis
- Verwende `.env.example` als Vorlage
- Stelle sicher, dass EMAIL_ADDRESS und EMAIL_PASSWORD gesetzt sind

### Verbindungsfehler
- Überprüfe deine t-online Zugangsdaten in der `.env`-Datei
- Stelle sicher, dass IMAP in deinem t-online Account aktiviert ist
- Verwende ein gültiges App-Passwort

### IMAP-Einstellungen für t-online
- **IMAP Server**: secureimap.t-online.de
- **Port**: 993
- **Verschlüsselung**: TLS/SSL
- **SMTP Server**: securesmtp.t-online.de
- **Port**: 587
- **Verschlüsselung**: STARTTLS

## Entwicklung

### Projekt-Struktur
```
src/
├── index.ts              # Haupt-MCP-Server
├── email-client.ts       # IMAP/E-Mail-Client
├── types.ts              # TypeScript-Typen und Schemas
└── config/
    └── index.ts          # Konfigurationsmanagement und Validierung
```

### Erweiterungen

Du kannst den Server einfach erweitern:

1. **Neue Tools hinzufügen**: Erweitere die `setupToolHandlers()` Methode
2. **Zusätzliche E-Mail-Provider**: Anpassung der IMAP-Konfiguration in `config/index.ts`
3. **Erweiterte Suchfunktionen**: Neue Suchkriterien in `SearchParamsSchema`
4. **E-Mail-Versendung**: Integration von nodemailer für SMTP

### Konfiguration erweitern

Neue Konfigurationsoptionen hinzufügen:

1. **In `.env.example`** neue Variable hinzufügen
2. **In `config/index.ts`** Schema erweitern:
   ```typescript
   const EnvSchema = z.object({
     // ... bestehende Felder
     NEW_SETTING: z.string().default('default-value'),
   });
   ```
3. **In `config/index.ts`** Export erweitern

### Tests
```bash
# Unit-Tests ausführen (wenn implementiert)
npm test

# Linting
npm run lint
```

## Lizenz

MIT License - siehe LICENSE-Datei für Details.

## Support

Bei Problemen oder Fragen:
1. Überprüfe die `.env`-Datei auf Vollständigkeit
2. Aktiviere Debug-Modus mit `DEBUG=true`
3. Kontrolliere die Server-Logs für detaillierte Fehlermeldungen
4. Siehe `docs/` für erweiterte Anleitungen

---

**Hinweis**: Dieser MCP-Server nutzt die `.env`-Datei für die komplette Konfiguration. Für andere E-Mail-Provider können Anpassungen der IMAP/SMTP-Einstellungen in der `.env`-Datei erforderlich sein.