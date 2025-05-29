#!/bin/bash

# T-Online E-Mail MCP Server Setup Script

echo "🚀 T-Online E-Mail MCP Server Setup"
echo "===================================="

# Überprüfe Node.js Installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installiere Node.js zuerst."
    exit 1
fi

# Überprüfe npm Installation
if ! command -v npm &> /dev/null; then
    echo "❌ npm ist nicht installiert. Bitte installiere npm zuerst."
    exit 1
fi

echo "✅ Node.js $(node --version) gefunden"
echo "✅ npm $(npm --version) gefunden"

# Wechsle ins Projektverzeichnis
cd "$(dirname "$0")"

# Installiere Abhängigkeiten
echo ""
echo "📦 Installiere Abhängigkeiten..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Fehler beim Installieren der Abhängigkeiten"
    exit 1
fi

# Erstelle .env-Datei falls nicht vorhanden
if [ ! -f .env ]; then
    echo ""
    echo "📝 Erstelle .env-Datei..."
    cp .env.example .env
    echo "✅ .env-Datei erstellt. Bitte bearbeite sie mit deinen t-online Zugangsdaten."
fi

# Kompiliere TypeScript
echo ""
echo "🔨 Kompiliere TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Fehler beim Kompilieren"
    exit 1
fi

echo ""
echo "✅ Setup erfolgreich abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Bearbeite die .env-Datei mit deinen t-online Zugangsdaten"
echo "2. Erstelle ein App-Passwort in deinem t-online Kundencenter"
echo "3. Teste den Server: npm run dev"
echo "4. Konfiguriere Claude Desktop (siehe claude-desktop-config.json)"
echo ""
echo "⚙️  WICHTIG: Alle Konfiguration erfolgt über die .env-Datei!"
echo "   Keine Umgebungsvariablen in Claude Desktop erforderlich."
echo ""
echo "📖 Weitere Informationen findest du in der README.md"