# T-Online Email MCP Server

A Model Context Protocol (MCP) server for managing t-online emails.

## Features

- 📧 **Email Search**: Search emails by sender, recipient, subject, content, and date
- 📁 **Folder Management**: Create, delete, and manage email folders
- ↔️ **Email Movement**: Move emails between folders
- 👁️ **Status Management**: Mark emails as read/unread
- 🗑️ **Email Deletion**: Delete emails permanently
- 🔒 **Secure Connection**: Uses secure IMAP/SMTP connections to t-online
- ⚙️ **Configuration via .env**: All settings are loaded from the .env file

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your t-online credentials:
   ```
   EMAIL_ADDRESS=your-email@t-online.de
   EMAIL_PASSWORD=your-app-password
   ```
   
   **Important:** The server uses exclusively the `.env` file for configuration. All settings must be set there.

3. **Compile project:**
   ```bash
   npm run build
   ```

## Configuration (.env file)

The MCP server uses **exclusively** the `.env` file for all configuration settings:

```bash
# Email credentials (REQUIRED)
EMAIL_ADDRESS=your-email@t-online.de
EMAIL_PASSWORD=your-app-password

# IMAP settings (optional, defaults for t-online)
IMAP_HOST=secureimap.t-online.de
IMAP_PORT=993
IMAP_TLS=true

# SMTP settings (optional, for future features)
SMTP_HOST=securesmtp.t-online.de
SMTP_PORT=587
SMTP_TLS=true

# Server settings (optional)
MCP_SERVER_NAME=t-online-email-server
DEBUG=false
```

**All configuration is done via the .env file** - no environment variables in shell or Claude Desktop configuration required!

## MCP Tools

### `search_emails`
Search emails by various criteria.

**Parameters:**
- `folder` (string, optional): Email folder to search (default: "INBOX")
- `from` (string, optional): Sender email address
- `to` (string, optional): Recipient email address
- `subject` (string, optional): Subject search term
- `body` (string, optional): Body content search term
- `since` (string, optional): Date since (YYYY-MM-DD format)
- `before` (string, optional): Date before (YYYY-MM-DD format)
- `seen` (boolean, optional): Read status (true = read, false = unread)
- `limit` (number, optional): Maximum number of results (default: 50)

### `get_email_stats`
Show detailed statistics about the email account.

**Returns:** Comprehensive overview of total emails, unread count, and folder statistics.

### `get_folders`
List all available email folders.

**Returns:** Array of all folders with their paths and attributes.

### `create_folder`
Create a new email folder.

**Parameters:**
- `folderName` (string, required): Name of the folder to create (can include hierarchy with "/")

### `delete_folder`
Delete an email folder.

**Parameters:**
- `folderName` (string, required): Name of the folder to delete

### `move_email`
Move an email between folders.

**Parameters:**
- `uid` (number, required): Unique ID of the email
- `fromFolder` (string, required): Source folder name
- `toFolder` (string, required): Destination folder name

### `mark_as_read`
Mark an email as read.

**Parameters:**
- `uid` (number, required): Unique ID of the email
- `folder` (string, optional): Email folder (default: "INBOX")

### `mark_as_unread`
Mark an email as unread.

**Parameters:**
- `uid` (number, required): Unique ID of the email
- `folder` (string, optional): Email folder (default: "INBOX")

### `delete_email`
Delete an email permanently.

**Parameters:**
- `uid` (number, required): Unique ID of the email
- `folder` (string, optional): Email folder (default: "INBOX")

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Enable debug mode
```bash
# In .env file:
DEBUG=true
```

### Configure with Claude Desktop

Add the following configuration to your Claude Desktop MCP settings:

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

**Important:** All configuration is done via the `.env` file. Claude Desktop requires no environment variables!

## Examples

### Search emails from a specific sender
```javascript
await searchEmails({
  from: "example@domain.com",
  limit: 10
});
```

### Show new emails (unread)
```javascript
await searchEmails({
  seen: false,
  folder: "INBOX"
});
```

### Move email to another folder
```javascript
await moveEmail({
  uid: 12345,
  fromFolder: "INBOX",
  toFolder: "Archive"
});
```

### Create new folder
```javascript
await createFolder({
  folderName: "Projects/MCP"
});
```

## Configuration Validation

The server automatically validates all `.env` settings at startup:

- ✅ **Email format** is checked
- ✅ **Required fields** are controlled
- ✅ **Port numbers** are validated
- ✅ **Boolean values** are parsed correctly
- ❌ **Faulty configuration** stops the server with helpful tips

## Security

- ✅ Always use app passwords, never your main password
- ✅ Store credentials securely in the `.env` file
- ✅ Use TLS-encrypted connections (enabled by default)
- ✅ Test first with a separate test account
- ✅ `.env` file is included in `.gitignore`

## Troubleshooting

### Configuration errors
```
❌ Configuration error in .env file:
  - EMAIL_ADDRESS: Valid email address required
```

**Solution:**
- Check your `.env` file in the project directory
- Use `.env.example` as a template
- Make sure EMAIL_ADDRESS and EMAIL_PASSWORD are set

### Connection errors
- Check your t-online credentials in the `.env` file
- Make sure IMAP is enabled in your t-online account
- Use a valid app password

### IMAP settings for t-online
- **IMAP Server**: secureimap.t-online.de
- **Port**: 993
- **Encryption**: TLS/SSL
- **SMTP Server**: securesmtp.t-online.de
- **Port**: 587
- **Encryption**: STARTTLS

## Development

### Project Structure
```
src/
├── index.ts              # Main MCP server
├── email-client.ts       # IMAP/Email client
├── types.ts              # TypeScript types and schemas
└── config/
    └── index.ts          # Configuration management and validation
```

### Extensions

You can easily extend the server:

1. **Add new tools**: Extend the `setupToolHandlers()` method
2. **Additional email providers**: Adapt IMAP configuration in `config/index.ts`
3. **Extended search functions**: New search criteria in `SearchParamsSchema`
4. **Email sending**: Integration of nodemailer for SMTP

### Extend configuration

Add new configuration options:

1. **In `.env.example`** add new variable
2. **In `config/index.ts`** extend schema:
   ```typescript
   const EnvSchema = z.object({
     // ... existing fields
     NEW_SETTING: z.string().default('default-value'),
   });
   ```
3. **In `config/index.ts`** extend export

### Tests
```bash
# Run unit tests (if implemented)
npm test

# Linting
npm run lint
```

## License

MIT License - see LICENSE file for details.

## Support

For problems or questions:
1. Check the `.env` file for completeness
2. Enable debug mode with `DEBUG=true`
3. Check server logs for detailed error messages
4. See `docs/` for extended guides

---

**Note**: This MCP server uses the `.env` file for complete configuration. For other email providers, adjustments to IMAP/SMTP settings in the `.env` file may be required.