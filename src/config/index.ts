import dotenv from 'dotenv';
import { z } from 'zod';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Determine project directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

// Load .env file
dotenv.config({ path: join(projectRoot, '.env') });

// Schema for environment variable validation
const EnvSchema = z.object({
  EMAIL_ADDRESS: z.string().email('Valid email address required'),
  EMAIL_PASSWORD: z.string().min(1, 'Email password required'),
  IMAP_HOST: z.string().default('secureimap.t-online.de'),
  IMAP_PORT: z.string().transform(val => parseInt(val)).pipe(z.number().positive()).default('993'),
  IMAP_TLS: z.string().transform(val => val.toLowerCase() === 'true').default('true'),
  SMTP_HOST: z.string().default('securesmtp.t-online.de'),
  SMTP_PORT: z.string().transform(val => parseInt(val)).pipe(z.number().positive()).default('587'),
  SMTP_TLS: z.string().transform(val => val.toLowerCase() === 'true').default('true'),
  MCP_SERVER_NAME: z.string().default('t-online-email-server'),
  DEBUG: z.string().transform(val => val.toLowerCase() === 'true').default('false'),
});

// Validate and parse environment variables
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
      console.error('❌ Configuration error in .env file:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      
      // Show helpful tips
      console.error('\n💡 Tips:');
      console.error('  - Check your .env file in the project directory');
      console.error('  - Use .env.example as a template');
      console.error('  - Make sure EMAIL_ADDRESS and EMAIL_PASSWORD are set');
      console.error('  - For t-online you need an app password (see docs/app-password-guide.md)');
      
      process.exit(1);
    }
    throw error;
  }
}

// Load and export configuration
export const config = loadConfig();

// Helper function for debug output
export function debugLog(message: string, data?: any) {
  if (config.server.debug) {
    console.error(`[DEBUG] ${message}`, data ? data : '');
  }
}