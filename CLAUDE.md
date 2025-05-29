# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server for t-online email management. The server provides email search, folder management, and email manipulation capabilities through IMAP connections.

## Development Commands

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Watch mode during development
npm run watch
```

## Configuration Requirements

**CRITICAL**: This project uses ONLY the `.env` file for configuration. No environment variables are passed through Claude Desktop or shell environments.

1. Copy `.env.example` to `.env`
2. Configure with actual t-online credentials:
   - `EMAIL_ADDRESS`: Valid t-online email address
   - `EMAIL_PASSWORD`: App password (NOT main password)
3. All other settings have sensible defaults for t-online

Debug mode can be enabled by setting `DEBUG=true` in `.env`.

## Architecture

### Core Components

- **`src/index.ts`**: Main MCP server that handles tool registration and request routing
- **`src/email-client.ts`**: IMAP client wrapper with connection state management
- **`src/config/index.ts`**: Configuration loading and validation using Zod schemas
- **`src/types.ts`**: TypeScript types and Zod schemas for data validation

### Key Architectural Decisions

1. **Connection Management**: IMAP connections are opened per request but reused when already connected (tracked via `isConnected` state)
2. **Configuration Strategy**: Centralized `.env` file loading with strict validation at startup
3. **Error Handling**: Comprehensive error handling with connection cleanup on failures
4. **Schema Validation**: All inputs validated using Zod schemas for type safety

### MCP Tool Implementation

The server exposes 8 tools through the MCP protocol:
- `search_emails`: Email search with multiple criteria
- `get_folders`: List email folders
- `create_folder`/`delete_folder`: Folder management
- `move_email`: Email organization
- `mark_as_read`/`mark_as_unread`: Status management
- `delete_email`: Permanent deletion

## Common Issues and Solutions

### IMAP Connection Problems
- Verify `.env` file exists and contains valid credentials
- Ensure IMAP is enabled in t-online account settings
- Use app passwords, never main account passwords

### Email Address Parsing
The `extractEmails` function in `searchEmails` handles the complex structure of parsed email addresses using the mailparser library's AddressObject format.

### Search Criteria Construction
IMAP search criteria are built dynamically based on provided parameters. Empty criteria defaults to 'ALL' emails.

## t-online Specific Settings

Default IMAP settings optimized for t-online:
- Host: `secureimap.t-online.de`
- Port: `993` (TLS)
- Encryption: `true`

These can be overridden in `.env` if needed for other providers.

## Testing

Basic functionality can be tested by:
1. Running `npm run dev` to start the server
2. Using the test commands from `docs/testing-guide.md`
3. Integrating with Claude Desktop using the provided configuration

When troubleshooting, enable debug mode with `DEBUG=true` in `.env` for detailed logging.