# T-Online App-Passwort Anleitung

## Was ist ein App-Passwort?

Ein App-Passwort ist ein spezielles Passwort, das du für Anwendungen wie E-Mail-Clients verwendest, anstatt dein Haupt-Passwort zu nutzen. Dies erhöht die Sicherheit deines Accounts.

## Schritt-für-Schritt Anleitung

### 1. T-Online Kundencenter aufrufen
- Gehe zu [kundencenter.t-online.de](https://kundencenter.t-online.de)
- Logge dich mit deinen normalen Zugangsdaten ein

### 2. Sicherheitseinstellungen öffnen
- Klicke auf "Mein Account" oder "Einstellungen"
- Navigiere zu "Sicherheit" oder "Passwort & Sicherheit"

### 3. App-Passwort erstellen
- Suche nach "App-Passwörter" oder "Anwendungspasswörter"
- Klicke auf "Neues App-Passwort erstellen"
- Wähle "E-Mail-Client" als Anwendungstyp
- Vergib einen Namen wie "MCP Email Server"

### 4. App-Passwort notieren
- Das generierte Passwort wird nur einmal angezeigt
- Kopiere es sofort und speichere es sicher
- Dieses Passwort verwendest du in der `.env`-Datei

### 5. IMAP aktivieren (falls nicht aktiv)
- Stelle sicher, dass IMAP in deinen E-Mail-Einstellungen aktiviert ist
- Dies findest du meist unter "E-Mail-Einstellungen" > "IMAP/POP3"

## Wichtige Hinweise

⚠️ **Sicherheit:**
- Verwende niemals dein Haupt-Passwort für E-Mail-Clients
- App-Passwörter können jederzeit widerrufen werden
- Jede Anwendung sollte ein eigenes App-Passwort haben

✅ **Vorteile:**
- Höhere Sicherheit
- Einfache Verwaltung
- Können einzeln deaktiviert werden

## Fehlerbehebung

### Problem: "Authentifizierung fehlgeschlagen"
- Überprüfe, ob du das App-Passwort (nicht das Haupt-Passwort) verwendest
- Stelle sicher, dass IMAP aktiviert ist
- Prüfe die Server-Einstellungen

### Problem: "Verbindung abgelehnt"
- Überprüfe die IMAP-Server-Adresse: `secureimap.t-online.de`
- Port sollte 993 sein
- TLS/SSL sollte aktiviert sein

### Problem: App-Passwort vergessen
- Erstelle einfach ein neues App-Passwort
- Lösche das alte in den Einstellungen
- Aktualisiere die `.env`-Datei

## Alternative E-Mail-Provider

Falls du einen anderen Provider verwendest, hier die gängigen Einstellungen:

### Gmail
- IMAP: `imap.gmail.com:993` (SSL)
- SMTP: `smtp.gmail.com:587` (STARTTLS)
- Benötigt App-Passwort bei aktivierter 2FA

### Outlook/Hotmail
- IMAP: `outlook.office365.com:993` (SSL)
- SMTP: `smtp-mail.outlook.com:587` (STARTTLS)

### Yahoo
- IMAP: `imap.mail.yahoo.com:993` (SSL)
- SMTP: `smtp.mail.yahoo.com:587` (STARTTLS)

## Support

Bei Problemen mit t-online spezifischen Einstellungen:
- T-Online Kundensupport: 0800 33 01000
- Online-Hilfe: [hilfe.t-online.de](https://hilfe.t-online.de)