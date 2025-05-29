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
    debugLog('Initializing MCP Server', { name: config.server.name });
    
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
    // List of available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_emails',
            description: 'Search emails by various criteria',
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
            description: 'Show detailed statistics about the email account',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_folders',
            description: 'List all available email folders',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_folder',
            description: 'Create a new email folder',
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
            description: 'Delete an email folder',
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
            description: 'Move an email between folders',
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
            description: 'Mark an email as read',
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
            description: 'Mark an email as unread',
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
            description: 'Delete an email permanently',
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
            description: 'Delete multiple emails permanently (efficient for large batches)',
            inputSchema: {
              type: 'object',
              properties: {
                uids: { 
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Array of email UIDs to delete'
                },
                folder: { type: 'string', default: 'INBOX' },
              },
              required: ['uids'],
            },
          },
        ] as Tool[],
      };
    });

    // Tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      debugLog(`Tool call: ${name}`, args);

      try {
        if (!this.emailClient) {
          throw new Error('Email client is not initialized');
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
            // Format compact output for fewer tokens
            const summary = `📧 Email Statistics:
📊 Total: ${stats.totalEmails} emails
📬 Unread: ${stats.unreadEmails}
✅ Read: ${stats.readEmails}

📁 Folders (${stats.folders.length}):
${stats.folders.map(f => `• ${f.name}: ${f.totalCount} (${f.unreadCount} unread)`).join('\n')}`;
            
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
                  text: `Folder "${folderName}" created successfully.`,
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
                  text: `Folder "${folderName}" deleted successfully.`,
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
                  text: `Email (UID: ${uid}) moved from "${fromFolder}" to "${toFolder}".`,
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
                  text: `Email (UID: ${uid}) marked as read.`,
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
                  text: `Email (UID: ${uid}) marked as unread.`,
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
                  text: `Email (UID: ${uid}) permanently deleted.`,
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
                  text: `✅ ${uids.length} emails permanently deleted.`,
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        debugLog(`Tool error in ${name}`, error);
        
        // Ensure connection is closed on errors
        try {
          if (this.emailClient) {
            await this.emailClient.disconnect();
          }
        } catch (disconnectError) {
          debugLog('Error disconnecting', disconnectError);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    debugLog('Starting MCP Server...');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`${config.server.name} started`);
  }
}

// Start server
debugLog('Loading configuration and starting server...');
const server = new TOnlineEmailMCPServer();
server.run().catch((error) => {
  debugLog('Server startup error', error);
  console.error('Error starting server:', error);
  process.exit(1);
});