# T-Online App Password Guide

## What is an App Password?

An app password is a special password that you use for applications like email clients instead of using your main password. This increases the security of your account.

## Step-by-Step Guide

### 1. Access T-Online Customer Center
- Go to [kundencenter.t-online.de](https://kundencenter.t-online.de)
- Log in with your normal credentials

### 2. Open Security Settings
- Click on "Mein Account" (My Account) or "Einstellungen" (Settings)
- Navigate to "Sicherheit" (Security) or "Passwort & Sicherheit" (Password & Security)

### 3. Create App Password
- Look for "App-Passwörter" (App Passwords) or "Anwendungspasswörter" (Application Passwords)
- Click on "Neues App-Passwort erstellen" (Create New App Password)
- Select "E-Mail-Client" as application type
- Give it a name like "MCP Email Server"

### 4. Note the App Password
- The generated password is displayed only once
- Copy it immediately and store it securely
- Use this password in the `.env` file

### 5. Enable IMAP (if not active)
- Make sure IMAP is enabled in your email settings
- This can usually be found under "E-Mail-Einstellungen" (Email Settings) > "IMAP/POP3"

## Important Notes

⚠️ **Security:**
- Never use your main password for email clients
- App passwords can be revoked at any time
- Each application should have its own app password

✅ **Benefits:**
- Higher security
- Easy management
- Can be disabled individually

## Troubleshooting

### Problem: "Authentication failed"
- Check that you're using the app password (not the main password)
- Make sure IMAP is enabled
- Verify server settings

### Problem: "Connection refused"
- Check the IMAP server address: `secureimap.t-online.de`
- Port should be 993
- TLS/SSL should be enabled

### Problem: App password forgotten
- Simply create a new app password
- Delete the old one in settings
- Update the `.env` file

## Alternative Email Providers

If you're using a different provider, here are common settings:

### Gmail
- IMAP: `imap.gmail.com:993` (SSL)
- SMTP: `smtp.gmail.com:587` (STARTTLS)
- Requires app password with 2FA enabled

### Outlook/Hotmail
- IMAP: `outlook.office365.com:993` (SSL)
- SMTP: `smtp-mail.outlook.com:587` (STARTTLS)

### Yahoo
- IMAP: `imap.mail.yahoo.com:993` (SSL)
- SMTP: `smtp.mail.yahoo.com:587` (STARTTLS)

## Support

For problems with t-online specific settings:
- T-Online Customer Support: 0800 33 01000
- Online Help: [hilfe.t-online.de](https://hilfe.t-online.de)