# Environment-friendly .env Configuration for t-online Email MCP Server

## Overview

The MCP server uses **exclusively** the `.env` file for all configuration settings. This offers the following advantages:

- 🔒 **Security**: Credentials remain local and are not transmitted via environment variables
- 🎯 **Simplicity**: Central configuration in one place
- ✅ **Validation**: Automatic verification of all settings at startup
- 🚀 **Portability**: Easy transfer between development and production environments

## Configuration File (.env)

```bash
# ====================================
# EMAIL CREDENTIALS (REQUIRED)
# ====================================

# Your t-online email address
EMAIL_ADDRESS=your-email@t-online.de

# App password (NOT your normal password!)
# Create an app password in the t-online customer center
EMAIL_PASSWORD=your-app-password

# ====================================
# IMAP SETTINGS (OPTIONAL)
# ====================================
# Default values are optimized for t-online

# IMAP server for t-online
IMAP_HOST=secureimap.t-online.de

# IMAP port (993 for TLS)
IMAP_PORT=993

# Enable TLS encryption
IMAP_TLS=true

# ====================================
# SMTP SETTINGS (OPTIONAL)
# ====================================
# For future email sending

# SMTP server for t-online
SMTP_HOST=securesmtp.t-online.de

# SMTP port (587 for STARTTLS)
SMTP_PORT=587

# TLS encryption for SMTP
SMTP_TLS=true

# ====================================
# SERVER SETTINGS (OPTIONAL)
# ====================================

# Name of the MCP server
MCP_SERVER_NAME=t-online-email-server

# Enable debug mode (true/false)
DEBUG=false
```

## Configuration Validation

The server automatically validates all settings at startup:

### Required Fields
- ✅ `EMAIL_ADDRESS` - Must be a valid email address
- ✅ `EMAIL_PASSWORD` - Cannot be empty

### Automatic Defaults
- 🔧 `IMAP_HOST` → `secureimap.t-online.de`
- 🔧 `IMAP_PORT` → `993`
- 🔧 `IMAP_TLS` → `true`
- 🔧 `SMTP_HOST` → `securesmtp.t-online.de`
- 🔧 `SMTP_PORT` → `587`
- 🔧 `SMTP_TLS` → `true`
- 🔧 `MCP_SERVER_NAME` → `t-online-email-server`
- 🔧 `DEBUG` → `false`

### Data Type Conversion
- 🔄 Port numbers are converted to numbers
- 🔄 Boolean values (`true`/`false`) are parsed correctly
- 🔄 Strings are trimmed

## Error Handling

With faulty configuration, you get helpful error messages:

```bash
❌ Configuration error in .env file:
  - EMAIL_ADDRESS: Valid email address required
  - EMAIL_PASSWORD: Email password required

💡 Tips:
  - Check your .env file in the project directory
  - Use .env.example as a template
  - Make sure EMAIL_ADDRESS and EMAIL_PASSWORD are set
  - For t-online you need an app password (see docs/app-password-guide.md)
```

## Security Aspects

### ✅ What's good:
- `.env` file is included in `.gitignore`
- Passwords are stored locally
- Automatic TLS encryption
- Validation prevents insecure configurations

### ⚠️ Important Notes:
- **Never** use your main password
- Create an **app password** in the t-online customer center
- Don't share the `.env` file via Git or other version control systems
- Keep secure backups of the `.env` file in a safe place

## Debug Configuration

For development and troubleshooting:

```bash
# Enable debug mode
DEBUG=true
```

With debug mode enabled, you see:
- 🔍 Detailed connection information
- 📡 IMAP configuration details
- 🔄 Tool calls and parameters
- ❌ Extended error information

## Environment-specific Configuration

### Development
```bash
# .env.development
DEBUG=true
MCP_SERVER_NAME=t-online-email-dev
```

### Production
```bash
# .env.production
DEBUG=false
MCP_SERVER_NAME=t-online-email-server
```

## Other Email Providers

The server can also be configured for other providers:

### Gmail
```bash
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=app-password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Outlook/Hotmail
```bash
EMAIL_ADDRESS=your-email@outlook.com
EMAIL_PASSWORD=app-password
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

## Backup and Migration

### Backup Configuration
```bash
# Backup your .env file
cp .env .env.backup.$(date +%Y%m%d)
```

### Migration Between Systems
```bash
# Transfer only the .env file
scp .env user@remote-server:/path/to/project/
```

## Troubleshooting

### Problem: Server doesn't start
```bash
# Check .env file existence
ls -la .env

# Test configuration
npm run dev
```

### Problem: Authentication error
```bash
# Enable debug mode
echo "DEBUG=true" >> .env
npm run dev
```

### Problem: Invalid configuration
```bash
# Use the template again
cp .env.example .env
# Edit with your data
```

---

**💡 Tip**: The `.env` file is the only place where you need to make configurations. Claude Desktop requires no additional environment variables!