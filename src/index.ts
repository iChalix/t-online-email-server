#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { EmailClient } from './email-client.js';
import { SearchParamsSchema } from './types.js';
import { config, debugLog } from './config/index.js';
import { z } from 'zod';

class TOnlineEmailMCPServer {
  private server: Server;
  private emailClient: EmailClient;

  constructor() {
    debugLog('Initialisiere MCP-Server', { name: config.server.name });
    
    this.server = new Server(
      {
        name: config.server.name,
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.emailClient = new EmailClient();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // Liste verfügbarer Tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_emails',
            description: 'Durchsuche E-Mails nach verschiedenen Kriterien',
            inputSchema: {
              type: 'object',
              properties: {
                folder: { type: 'string', default: 'INBOX' },
                from: { type: 'string' },
                to: { type: 'string' },
                subject: { type: 'string' },
                body: { type: 'string' },
                since: { type: 'string' },
                before: { type: 'string' },
                seen: { type: 'boolean' },
                flagged: { type: 'boolean' },
                limit: { type: 'number', default: 50 },
              },
            },
          },
          {
            name: 'get_email_stats',
            description: 'Zeige detaillierte Statistiken über das E-Mail-Konto an',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_folders',
            description: 'Liste alle verfügbaren E-Mail-Ordner auf',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_folder',
            description: 'Erstelle einen neuen E-Mail-Ordner',
            inputSchema: {
              type: 'object',
              properties: {
                folderName: { type: 'string' },
              },
              required: ['folderName'],
            },
          },
          {
            name: 'delete_folder',
            description: 'Lösche einen E-Mail-Ordner',
            inputSchema: {
              type: 'object',
              properties: {
                folderName: { type: 'string' },
              },
              required: ['folderName'],
            },
          },
          {
            name: 'move_email',
            description: 'Verschiebe eine E-Mail zwischen Ordnern',
            inputSchema: {
              type: 'object',
              properties: {
                uid: { type: 'number' },
                fromFolder: { type: 'string' },
                toFolder: { type: 'string' },
              },
              required: ['uid', 'fromFolder', 'toFolder'],
            },
          },
          {
            name: 'mark_as_read',
            description: 'Markiere eine E-Mail als gelesen',
            inputSchema: {
              type: 'object',
              properties: {
                uid: { type: 'number' },
                folder: { type: 'string', default: 'INBOX' },
              },
              required: ['uid'],
            },
          },
          {
            name: 'mark_as_unread',
            description: 'Markiere eine E-Mail als ungelesen',
            inputSchema: {
              type: 'object',
              properties: {
                uid: { type: 'number' },
                folder: { type: 'string', default: 'INBOX' },
              },
              required: ['uid'],
            },
          },
          {
            name: 'delete_email',
            description: 'Lösche eine E-Mail permanent',
            inputSchema: {
              type: 'object',
              properties: {
                uid: { type: 'number' },
                folder: { type: 'string', default: 'INBOX' },
              },
              required: ['uid'],
            },
          },
          {
            name: 'batch_delete_emails',
            description: 'Lösche mehrere E-Mails permanent (effizient für große Mengen)',
            inputSchema: {
              type: 'object',
              properties: {
                uids: { 
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Array von E-Mail UIDs zum Löschen'
                },
                folder: { type: 'string', default: 'INBOX' },
              },
              required: ['uids'],
            },
          },
        ] as Tool[],
      };
    });

    // Tool-Ausführung
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      debugLog(`Tool-Aufruf: ${name}`, args);

      try {
        if (!this.emailClient) {
          throw new Error('E-Mail-Client ist nicht initialisiert');
        }
        
        await this.emailClient.connect();

        switch (name) {
          case 'search_emails': {
            const params = SearchParamsSchema.parse(args);
            const emails = await this.emailClient.searchEmails(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(emails, null, 2),
                },
              ],
            };
          }

          case 'get_email_stats': {
            const stats = await this.emailClient.getEmailStats();
            // Formatiere kompakte Ausgabe für weniger Token
            const summary = `📧 E-Mail Statistiken:
📊 Gesamt: ${stats.totalEmails} E-Mails
📬 Ungelesen: ${stats.unreadEmails}
✅ Gelesen: ${stats.readEmails}

📁 Ordner (${stats.folders.length}):
${stats.folders.map(f => `• ${f.name}: ${f.totalCount} (${f.unreadCount} ungelesen)`).join('\n')}`;
            
            return {
              content: [
                {
                  type: 'text',
                  text: summary,
                },
              ],
            };
          }

          case 'get_folders': {
            const folders = await this.emailClient.getFolders();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(folders, null, 2),
                },
              ],
            };
          }

          case 'create_folder': {
            const { folderName } = z.object({ folderName: z.string() }).parse(args);
            await this.emailClient.createFolder(folderName);
            return {
              content: [
                {
                  type: 'text',
                  text: `Ordner "${folderName}" wurde erfolgreich erstellt.`,
                },
              ],
            };
          }
          case 'delete_folder': {
            const { folderName } = z.object({ folderName: z.string() }).parse(args);
            await this.emailClient.deleteFolder(folderName);
            return {
              content: [
                {
                  type: 'text',
                  text: `Ordner "${folderName}" wurde erfolgreich gelöscht.`,
                },
              ],
            };
          }

          case 'move_email': {
            const { uid, fromFolder, toFolder } = z.object({
              uid: z.number(),
              fromFolder: z.string(),
              toFolder: z.string(),
            }).parse(args);
            await this.emailClient.moveEmail(uid, fromFolder, toFolder);
            return {
              content: [
                {
                  type: 'text',
                  text: `E-Mail (UID: ${uid}) wurde von "${fromFolder}" nach "${toFolder}" verschoben.`,
                },
              ],
            };
          }

          case 'mark_as_read': {
            const { uid, folder = 'INBOX' } = z.object({
              uid: z.number(),
              folder: z.string().default('INBOX'),
            }).parse(args);
            await this.emailClient.markAsRead(uid, folder);
            return {
              content: [
                {
                  type: 'text',
                  text: `E-Mail (UID: ${uid}) wurde als gelesen markiert.`,
                },
              ],
            };
          }

          case 'mark_as_unread': {
            const { uid, folder = 'INBOX' } = z.object({
              uid: z.number(),
              folder: z.string().default('INBOX'),
            }).parse(args);
            await this.emailClient.markAsUnread(uid, folder);
            return {
              content: [
                {
                  type: 'text',
                  text: `E-Mail (UID: ${uid}) wurde als ungelesen markiert.`,
                },
              ],
            };
          }
          case 'delete_email': {
            const { uid, folder = 'INBOX' } = z.object({
              uid: z.number(),
              folder: z.string().default('INBOX'),
            }).parse(args);
            await this.emailClient.deleteEmail(uid, folder);
            return {
              content: [
                {
                  type: 'text',
                  text: `E-Mail (UID: ${uid}) wurde permanent gelöscht.`,
                },
              ],
            };
          }

          case 'batch_delete_emails': {
            const { uids, folder = 'INBOX' } = z.object({
              uids: z.array(z.number()),
              folder: z.string().default('INBOX'),
            }).parse(args);
            await this.emailClient.batchDeleteEmails(uids, folder);
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ ${uids.length} E-Mails wurden permanent gelöscht.`,
                },
              ],
            };
          }

          default:
            throw new Error(`Unbekanntes Tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        debugLog(`Tool-Fehler bei ${name}`, error);
        
        // Stelle sicher, dass Verbindung getrennt wird bei Fehlern
        try {
          if (this.emailClient) {
            await this.emailClient.disconnect();
          }
        } catch (disconnectError) {
          debugLog('Fehler beim Trennen der Verbindung', disconnectError);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Fehler: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    debugLog('Starte MCP-Server...');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`${config.server.name} gestartet`);
  }
}

// Server starten
debugLog('Lade Konfiguration und starte Server...');
const server = new TOnlineEmailMCPServer();
server.run().catch((error) => {
  debugLog('Server-Start-Fehler', error);
  console.error('Fehler beim Starten des Servers:', error);
  process.exit(1);
});