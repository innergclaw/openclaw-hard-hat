# Beginner's Security Checklist

**New to OpenClaw? Start here.**

This checklist walks you through installing your first skill safely.

---

## 🎯 Before You Start

### 1. Understand What OpenClaw Is
- [ ] Your AI agent runs on YOUR computer
- [ ] It can execute code, control browser, access files
- [ ] You're giving it significant power — use it wisely

### 2. Set Up Basic Security
- [ ] Keep your system updated
- [ ] Use strong passwords
- [ ] Enable 2FA on important accounts
- [ ] Have backups of important data

---

## 📋 Installing Your First Skill

### Step 1: Find a Skill
- [ ] Look for skills on GitHub (not random downloads)
- [ ] Check when it was last updated (recent = better)
- [ ] Look for stars/forks (community validation)
- [ ] Read the README thoroughly

### Step 2: Download It
```bash
# Good: Clone from GitHub
git clone https://github.com/username/skill-name.git

# Bad: Download from random website
wget https://suspicious-site.com/skill.zip  # ← DON'T DO THIS
```

### Step 3: Run Hard Hat Scanner
```bash
cd openclaw-hard-hat
node scripts/hard-hat-scan.js /path/to/downloaded-skill
```

**What to look for:**
- [ ] No CRITICAL findings
- [ ] No suspicious URLs
- [ ] No hardcoded secrets
- [ ] Clear documentation

### Step 4: Review the Code
Even if scan passes, check these files:

**Start here:**
- [ ] `README.md` — What does it do?
- [ ] `package.json` — What dependencies?
- [ ] `install.sh` or setup scripts

**Red flags in code:**
```javascript
// STOP if you see these:
eval(atob("..."))              // Obfuscated code
const TOKEN = "123456..."      // Hardcoded secret
curl ... | bash               // Pipe to shell
require("openclaw-core")      // Known malware
```

### Step 5: Install Safely
```bash
# Good: Regular user install
npm install

# Suspicious: Requires sudo
sudo npm install  # ← Ask why this is needed
```

### Step 6: Test First
- [ ] Test in isolated environment if possible
- [ ] Start with non-critical tasks
- [ ] Monitor what it does
- [ ] Check logs for unexpected behavior

---

## 🚨 Emergency: Something Went Wrong

### If You Installed Something Suspicious:
1. **Disconnect from internet** (if worried about data exfiltration)
2. **Don't panic** — most malware isn't immediately destructive
3. **Document what happened** — screenshots, commands run
4. **Check running processes:**
   ```bash
   ps aux | grep suspicious-process
   ```
5. **Remove the skill:**
   ```bash
   rm -rf ~/.openclaw/workspace/.agent/skills/suspicious-skill
   ```
6. **Scan your system:**
   ```bash
   # macOS
   clamscan -r ~/.openclaw
   
   # Or use your antivirus
   ```
7. **Change passwords** if you entered any
8. **Report it** to help others

---

## ✅ Daily Habits

### Check Installed Skills Weekly
```bash
# List all installed skills
ls ~/.openclaw/workspace/.agent/skills/

# Run daily scan
node hard-hat-scan.js --daily-check
```

### Keep Updated
- [ ] Check for skill updates weekly
- [ ] Review changelogs before updating
- [ ] Update OpenClaw itself regularly

### Stay Informed
- [ ] Follow OpenClaw security announcements
- [ ] Join community discussions
- [ ] Share knowledge with others

---

## 🎓 Learning Path

### Week 1: Basics
- [ ] Install Hard Hat
- [ ] Scan your first skill
- [ ] Read SECURITY.md examples

### Week 2: Understanding
- [ ] Learn to read JavaScript basics
- [ ] Understand what `eval()` does
- [ ] Practice spotting suspicious patterns

### Week 3: Advanced
- [ ] Review complex skills manually
- [ ] Learn about dependency vulnerabilities
- [ ] Contribute security improvements

---

## 💡 Pro Tips

1. **When in doubt, don't install** — Wait for community review
2. **Start simple** — Use well-known skills first
3. **Ask questions** — Community is here to help
4. **Share knowledge** — Help others stay safe
5. **Trust your gut** — If something feels off, investigate

---

## 📞 Getting Help

**Stuck or worried?**
- Ask in OpenClaw community channels
- Check if others have reviewed the skill
- Start a discussion on GitHub
- DM trusted community members

**Remember:** No question is too basic when it comes to security.

---

**You're now ready to use OpenClaw safely. Welcome to the community!** 🛡️
