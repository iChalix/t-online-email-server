import dotenv from 'dotenv';
import { z } from 'zod';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Bestimme den Projektordner
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

// Lade .env-Datei
dotenv.config({ path: join(projectRoot, '.env') });

// Schema für Umgebungsvariablen-Validierung
const EnvSchema = z.object({
  EMAIL_ADDRESS: z.string().email('Gültige E-Mail-Adresse erforderlich'),
  EMAIL_PASSWORD: z.string().min(1, 'E-Mail-Passwort erforderlich'),
  IMAP_HOST: z.string().default('secureimap.t-online.de'),
  IMAP_PORT: z.string().transform(val => parseInt(val)).pipe(z.number().positive()).default('993'),
  IMAP_TLS: z.string().transform(val => val.toLowerCase() === 'true').default('true'),
  SMTP_HOST: z.string().default('securesmtp.t-online.de'),
  SMTP_PORT: z.string().transform(val => parseInt(val)).pipe(z.number().positive()).default('587'),
  SMTP_TLS: z.string().transform(val => val.toLowerCase() === 'true').default('true'),
  MCP_SERVER_NAME: z.string().default('t-online-email-server'),
  DEBUG: z.string().transform(val => val.toLowerCase() === 'true').default('false'),
});

// Validiere und parse Umgebungsvariablen
function loadConfig() {
  try {
    const env = EnvSchema.parse(process.env);
    
    return {
      email: {
        address: env.EMAIL_ADDRESS,
        password: env.EMAIL_PASSWORD,
        imapHost: env.IMAP_HOST,
        imapPort: env.IMAP_PORT,
        imapTls: env.IMAP_TLS,
        smtpHost: env.SMTP_HOST,
        smtpPort: env.SMTP_PORT,
        smtpTls: env.SMTP_TLS,
      },
      server: {
        name: env.MCP_SERVER_NAME,
        debug: env.DEBUG,
      }
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Konfigurationsfehler in .env-Datei:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      
      // Hilfreiche Tipps ausgeben
      console.error('\n💡 Tipps:');
      console.error('  - Überprüfe deine .env-Datei im Projektverzeichnis');
      console.error('  - Verwende .env.example als Vorlage');
      console.error('  - Stelle sicher, dass EMAIL_ADDRESS und EMAIL_PASSWORD gesetzt sind');
      console.error('  - Für t-online benötigst du ein App-Passwort (siehe docs/app-password-guide.md)');
      
      process.exit(1);
    }
    throw error;
  }
}

// Lade und exportiere Konfiguration
export const config = loadConfig();

// Hilfsfunktion für Debug-Ausgaben
export function debugLog(message: string, data?: any) {
  if (config.server.debug) {
    console.error(`[DEBUG] ${message}`, data ? data : '');
  }
}