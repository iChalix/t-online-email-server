# MCP Server Testing Guide

## Local Tests

### 1. Start Server
```bash
# Development mode
npm run dev

# Or compiled
npm run build && npm start
```

### 2. Test Connection
The server should show the following output:
```
T-Online Email MCP Server started
```

### 3. Test Tools

#### List Email Folders
```bash
echo '{"method": "tools/list"}' | node dist/index.js
```

#### Search Emails
```bash
echo '{
  "method": "tools/call",
  "params": {
    "name": "search_emails",
    "arguments": {
      "folder": "INBOX",
      "limit": 5
    }
  }
}' | node dist/index.js
```

## Integration with Claude Desktop

### 1. Add Configuration
Add the configuration from `claude-desktop-config.json` to your Claude Desktop MCP configuration.

### 2. Restart Claude Desktop
After configuration, Claude Desktop must be restarted.

### 3. Test Functionality
In Claude Desktop you should now be able to use the following commands:

```
Show me my latest emails
Search for emails from example@domain.com
Create a new folder called "Projects"
Move email with UID 12345 to the Archive folder
```

## Debugging

### Server Logs
```bash
# With debug output
DEBUG=true npm run dev
```

### Common Problems

#### 1. Authentication Error
```
Error: Invalid credentials
```

**Solution:**
- Check email address and app password in `.env`
- Make sure IMAP is enabled
- Use app password, not main password

#### 2. Connection Error
```
Error: Connection timeout
```

**Solution:**
- Check network connection
- Check firewall settings
- Test IMAP server reachability: `telnet secureimap.t-online.de 993`

#### 3. SSL/TLS Error
```
Error: SSL handshake failed
```

**Solution:**
- In `email-client.ts` add:
```typescript
tlsOptions: {
  rejectUnauthorized: false,
  minVersion: 'TLSv1.2'
}
```

### Network Testing
```bash
# Test IMAP server
telnet secureimap.t-online.de 993

# Test SMTP server  
telnet securesmtp.t-online.de 587
```

## Performance Monitoring

### Monitor Memory Usage
```bash
# With Node.js memory usage
node --max-old-space-size=4096 dist/index.js
```

### Optimize IMAP Connection
```typescript
// In email-client.ts
keepalive: {
  interval: 10000,
  idleInterval: 300000,
  forceNoop: true
}
```

## Advanced Tests

### 1. Load Test
```bash
# Multiple simultaneous requests
for i in {1..10}; do
  echo "Test $i"
  # Execute MCP request
done
```

### 2. Memory Leak Test
```bash
# Long-running test
timeout 300 npm run dev
```

### 3. Folder Structure Test
```typescript
// Test complex folder structures
const folders = await emailClient.getFolders();
console.log('Found folders:', folders.length);
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Test MCP Server
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
    env:
      EMAIL_ADDRESS: ${{ secrets.TEST_EMAIL }}
      EMAIL_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

### Test Environment Setup
```bash
# Separate test account recommended
EMAIL_ADDRESS=test@t-online.de
EMAIL_PASSWORD=test-app-password
```