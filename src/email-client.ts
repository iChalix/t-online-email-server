import Imap from 'imap';
import { simpleParser, AddressObject } from 'mailparser';
import { EmailMessage, EmailFolder, SearchParams, EmailStats } from './types.js';
import { config as appConfig, debugLog } from './config/index.js';

export class EmailClient {
  private imap: any;
  private isConnected: boolean = false;

  constructor() {
    debugLog('Initialisiere E-Mail-Client mit Konfiguration aus .env');
    
    this.imap = new Imap({
      user: appConfig.email.address,
      password: appConfig.email.password,
      host: appConfig.email.imapHost,
      port: appConfig.email.imapPort,
      tls: appConfig.email.imapTls,
      tlsOptions: {
        rejectUnauthorized: false
      }
    });
    
    debugLog('IMAP-Client konfiguriert', {
      host: appConfig.email.imapHost,
      port: appConfig.email.imapPort,
      user: appConfig.email.address,
      tls: appConfig.email.imapTls
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      debugLog('IMAP-Verbindung bereits vorhanden');
      return;
    }
    
    debugLog('Verbinde mit IMAP-Server...');
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        debugLog('IMAP-Verbindung erfolgreich hergestellt');
        this.isConnected = true;
        resolve();
      });
      this.imap.once('error', (err: Error) => {
        debugLog('IMAP-Verbindungsfehler', err);
        this.isConnected = false;
        reject(err);
      });
      this.imap.once('end', () => {
        debugLog('IMAP-Verbindung beendet');
        this.isConnected = false;
      });
      this.imap.connect();
    });
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      debugLog('IMAP-Verbindung bereits getrennt');
      return;
    }
    
    debugLog('Trenne IMAP-Verbindung...');
    return new Promise((resolve) => {
      this.imap.once('end', () => {
        debugLog('IMAP-Verbindung getrennt');
        this.isConnected = false;
        resolve();
      });
      this.imap.end();
    });
  }

  async getFolders(): Promise<EmailFolder[]> {
    return new Promise((resolve, reject) => {
      this.imap.getBoxes((err: Error | null, boxes: any) => {
        if (err) return reject(err);
        
        const folders: EmailFolder[] = [];
        const parseBoxes = (boxObj: any, prefix = '') => {
          for (const [name, box] of Object.entries(boxObj)) {
            const folder: EmailFolder = {
              name,
              path: prefix + name,
              delimiter: (box as any).delimiter || '/',
              attributes: (box as any).attribs || [],
            };
            folders.push(folder);
            
            if ((box as any).children) {
              parseBoxes((box as any).children, prefix + name + (box as any).delimiter);
            }
          }
        };
        
        parseBoxes(boxes);
        resolve(folders);
      });
    });
  }
  async createFolder(folderName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.addBox(folderName, (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async deleteFolder(folderName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.delBox(folderName, (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async searchEmails(params: SearchParams): Promise<EmailMessage[]> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(params.folder, false, (err: Error | null) => {
        if (err) return reject(err);

        // Erstelle Suchkriterien
        const criteria: any[] = [];
        if (params.from) criteria.push(['FROM', params.from]);
        if (params.to) criteria.push(['TO', params.to]);
        if (params.subject) criteria.push(['SUBJECT', params.subject]);
        if (params.body) criteria.push(['BODY', params.body]);
        if (params.since) criteria.push(['SINCE', params.since]);
        if (params.before) criteria.push(['BEFORE', params.before]);
        if (params.seen !== undefined) {
          criteria.push(params.seen ? 'SEEN' : 'UNSEEN');
        }
        if (params.flagged !== undefined) {
          criteria.push(params.flagged ? 'FLAGGED' : 'UNFLAGGED');
        }

        // Wenn keine Kriterien angegeben, suche alle E-Mails
        const searchCriteria = criteria.length > 0 ? criteria : ['ALL'];
        
        this.imap.search(searchCriteria, (err: Error | null, results?: number[]) => {
          if (err) return reject(err);
          if (!results || results.length === 0) return resolve([]);

          // Begrenze Ergebnisse
          const limitedResults = results.slice(0, params.limit);
          
          const fetch = this.imap.fetch(limitedResults, {
            bodies: '',
            struct: true
          });

          const emails: EmailMessage[] = [];
          
          fetch.on('message', (msg: any, seqno: number) => {
            let uid: number;
            let attrs: any;
            
            msg.on('attributes', (attribs: any) => {
              attrs = attribs;
              uid = attribs.uid;
            });

            msg.on('body', (stream: any) => {
              let buffer = '';
              stream.on('data', (chunk: any) => buffer += chunk.toString());
              stream.once('end', async () => {
                try {
                  const parsed = await simpleParser(buffer);
                  
                  // Helper function to extract email addresses
                  const extractEmails = (addressField: AddressObject | AddressObject[] | undefined): string[] => {
                    if (!addressField) return [];
                    if (Array.isArray(addressField)) {
                      return addressField.flatMap(addr => 
                        addr.value ? addr.value.map(v => v.address || '').filter(Boolean) : []
                      );
                    }
                    return addressField.value ? addressField.value.map(v => v.address || '').filter(Boolean) : [];
                  };
                  
                  const email: EmailMessage = {
                    uid,
                    subject: parsed.subject || '',
                    from: parsed.from?.text || '',
                    to: extractEmails(parsed.to),
                    date: parsed.date?.toISOString() || '',
                    body: parsed.text || parsed.html || '',
                    folder: params.folder,
                    seen: attrs.flags.includes('\\Seen'),
                    flagged: attrs.flags.includes('\\Flagged'),
                  };
                  emails.push(email);
                } catch (parseErr) {
                  console.error('Fehler beim Parsen der E-Mail:', parseErr);
                }
              });
            });
          });

          fetch.once('error', reject);
          fetch.once('end', () => resolve(emails));
        });
      });
    });
  }
  async moveEmail(uid: number, fromFolder: string, toFolder: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(fromFolder, false, (err: Error | null) => {
        if (err) return reject(err);

        this.imap.move(uid, toFolder, (err: Error | null) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  async markAsRead(uid: number, folder: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(folder, false, (err: Error | null) => {
        if (err) return reject(err);

        this.imap.addFlags(uid, '\\Seen', (err: Error | null) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  async markAsUnread(uid: number, folder: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(folder, false, (err: Error | null) => {
        if (err) return reject(err);

        this.imap.delFlags(uid, '\\Seen', (err: Error | null) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  async deleteEmail(uid: number, folder: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(folder, false, (err: Error | null) => {
        if (err) return reject(err);

        this.imap.addFlags(uid, '\\Deleted', (err: Error | null) => {
          if (err) return reject(err);
          
          this.imap.expunge((err: Error | null) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
    });
  }

  async batchDeleteEmails(uids: number[], folder: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(folder, false, (err: Error | null) => {
        if (err) return reject(err);

        // Verwende UID-Range für effiziente Batch-Operation
        this.imap.addFlags(uids, '\\Deleted', (err: Error | null) => {
          if (err) return reject(err);
          
          this.imap.expunge((err: Error | null) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
    });
  }

  async getEmailStats(): Promise<EmailStats> {
    return new Promise(async (resolve, reject) => {
      try {
        debugLog('Lade E-Mail-Statistiken (optimiert)...');
        
        // Hole nur wichtige Ordner (INBOX, Sent, etc.)
        const folders = await this.getFolders();
        const importantFolders = folders.filter(f => 
          f.name.toLowerCase().includes('inbox') ||
          f.name.toLowerCase().includes('sent') ||
          f.name.toLowerCase().includes('draft') ||
          f.name.toLowerCase().includes('trash')
        ).slice(0, 5); // Maximal 5 Ordner
        
        const stats: EmailStats = {
          totalEmails: 0,
          unreadEmails: 0,
          readEmails: 0,
          flaggedEmails: 0,
          folders: [],
          topSenders: [],
          emailsLast30Days: 0,
          emailsLast7Days: 0,
          averageEmailsPerDay: 0,
        };

        // Analysiere nur wichtige Ordner
        for (const folder of importantFolders) {
          try {
            await new Promise<void>((resolveFolder) => {
              this.imap.openBox(folder.path, true, (err: Error | null, box: any) => {
                if (err) {
                  debugLog(`Überspringe Ordner ${folder.path}`, err);
                  resolveFolder();
                  return;
                }

                const folderStats = {
                  name: folder.name,
                  path: folder.path,
                  totalCount: box.messages.total || 0,
                  unreadCount: box.messages.unseen || 0,
                  recentCount: box.messages.recent || 0,
                };

                stats.folders.push(folderStats);
                stats.totalEmails += folderStats.totalCount;
                stats.unreadEmails += folderStats.unreadCount;
                stats.readEmails += (folderStats.totalCount - folderStats.unreadCount);

                resolveFolder();
              });
            });
          } catch (folderErr) {
            debugLog(`Fehler bei Ordner ${folder.path}`, folderErr);
            continue;
          }
        }

        debugLog('E-Mail-Statistiken erfolgreich geladen (optimiert)', {
          totalEmails: stats.totalEmails,
          folders: stats.folders.length
        });

        resolve(stats);
      } catch (error) {
        debugLog('Fehler beim Laden der E-Mail-Statistiken', error);
        reject(error);
      }
    });
  }
}