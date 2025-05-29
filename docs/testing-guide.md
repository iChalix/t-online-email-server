# MCP Server Testing Guide

## Lokale Tests

### 1. Server starten
```bash
# Entwicklungsmodus
npm run dev

# Oder kompiliert
npm run build && npm start
```

### 2. Verbindung testen
Der Server sollte folgende Ausgabe zeigen:
```
T-Online E-Mail MCP Server gestartet
```

### 3. Tools testen

#### E-Mail-Ordner auflisten
```bash
echo '{"method": "tools/list"}' | node dist/index.js
```

#### E-Mails durchsuchen
```bash
echo '{
  "method": "tools/call",
  "params": {
    "name": "search_emails",
    "arguments": {
      "folder": "INBOX",
      "limit": 5
    }
  }
}' | node dist/index.js
```

## Integration mit Claude Desktop

### 1. Konfiguration hinzufügen
Füge die Konfiguration aus `claude-desktop-config.json` zu deiner Claude Desktop MCP-Konfiguration hinzu.

### 2. Claude Desktop neustarten
Nach der Konfiguration muss Claude Desktop neugestartet werden.

### 3. Funktionalität testen
In Claude Desktop solltest du jetzt folgende Befehle verwenden können:

```
Zeige mir meine neuesten E-Mails
Suche nach E-Mails von beispiel@domain.de
Erstelle einen neuen Ordner namens "Projekte"
Verschiebe E-Mail mit UID 12345 in den Archiv-Ordner
```

## Debugging

### Server-Logs
```bash
# Mit Debug-Ausgabe
DEBUG=true npm run dev
```

### Häufige Probleme

#### 1. Authentifizierungsfehler
```
Fehler: Invalid credentials
```

**Lösung:**
- Überprüfe E-Mail-Adresse und App-Passwort in `.env`
- Stelle sicher, dass IMAP aktiviert ist
- Verwende App-Passwort, nicht Haupt-Passwort

#### 2. Verbindungsfehler
```
Fehler: Connection timeout
```

**Lösung:**
- Überprüfe Netzwerkverbindung
- Prüfe Firewall-Einstellungen
- Teste IMAP-Server-Erreichbarkeit: `telnet secureimap.t-online.de 993`

#### 3. SSL/TLS-Fehler
```
Fehler: SSL handshake failed
```

**Lösung:**
- In `email-client.ts` füge hinzu:
```typescript
tlsOptions: {
  rejectUnauthorized: false,
  minVersion: 'TLSv1.2'
}
```

### Network Testing
```bash
# IMAP-Server testen
telnet secureimap.t-online.de 993

# SMTP-Server testen  
telnet securesmtp.t-online.de 587
```

## Performance Monitoring

### Speicherverbrauch überwachen
```bash
# Mit Node.js memory usage
node --max-old-space-size=4096 dist/index.js
```

### IMAP-Verbindung optimieren
```typescript
// In email-client.ts
keepalive: {
  interval: 10000,
  idleInterval: 300000,
  forceNoop: true
}
```

## Erweiterte Tests

### 1. Lasttest
```bash
# Mehrere gleichzeitige Anfragen
for i in {1..10}; do
  echo "Test $i"
  # Führe MCP-Anfrage aus
done
```

### 2. Speicher-Leak-Test
```bash
# Länger laufender Test
timeout 300 npm run dev
```

### 3. Ordner-Struktur-Test
```typescript
// Teste komplexe Ordnerstrukturen
const folders = await emailClient.getFolders();
console.log('Gefundene Ordner:', folders.length);
```

## CI/CD Integration

### GitHub Actions Beispiel
```yaml
name: Test MCP Server
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
    env:
      EMAIL_ADDRESS: ${{ secrets.TEST_EMAIL }}
      EMAIL_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

### Testumgebung Setup
```bash
# Separater Test-Account empfohlen
EMAIL_ADDRESS=test@t-online.de
EMAIL_PASSWORD=test-app-password
```