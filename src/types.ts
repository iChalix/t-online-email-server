import { z } from 'zod';

// Schema für E-Mail-Nachrichten
export const EmailMessageSchema = z.object({
  uid: z.number(),
  subject: z.string(),
  from: z.string(),
  to: z.array(z.string()),
  date: z.string(),
  body: z.string(),
  folder: z.string(),
  seen: z.boolean(),
  flagged: z.boolean(),
});

// Schema für Ordner
export const EmailFolderSchema = z.object({
  name: z.string(),
  path: z.string(),
  delimiter: z.string(),
  children: z.array(z.string()).optional(),
  attributes: z.array(z.string()).optional(),
});

// Schema für Suchparameter
export const SearchParamsSchema = z.object({
  folder: z.string().default('INBOX'),
  from: z.string().optional(),
  to: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  since: z.string().optional(),
  before: z.string().optional(),
  seen: z.boolean().optional(),
  flagged: z.boolean().optional(),
  limit: z.number().default(50),
});

// Schema für E-Mail-Statistiken
export const EmailStatsSchema = z.object({
  totalEmails: z.number(),
  unreadEmails: z.number(),
  readEmails: z.number(),
  flaggedEmails: z.number(),
  folders: z.array(z.object({
    name: z.string(),
    path: z.string(),
    totalCount: z.number(),
    unreadCount: z.number(),
    recentCount: z.number(),
  })),
  topSenders: z.array(z.object({
    email: z.string(),
    count: z.number(),
  })),
  emailsLast30Days: z.number(),
  emailsLast7Days: z.number(),
  averageEmailsPerDay: z.number(),
});

export type EmailMessage = z.infer<typeof EmailMessageSchema>;
export type EmailFolder = z.infer<typeof EmailFolderSchema>;
export type SearchParams = z.infer<typeof SearchParamsSchema>;
export type EmailStats = z.infer<typeof EmailStatsSchema>;