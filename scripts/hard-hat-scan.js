#!/usr/bin/env node
/**
 * OpenClaw Hard Hat - Safety Scanner for OpenClaw Skills
 * Run this BEFORE installing any skill
 * 
 * Usage: node hard-hat-scan.js /path/to/skill-directory
 *        node hard-hat-scan.js --daily-check
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Security patterns to detect
const THREAT_PATTERNS = {
  critical: [
    {
      pattern: /['"]\d{9,10}:[A-Za-z0-9_-]{35,}['"]/,
      name: 'Hardcoded Telegram Bot Token',
      severity: 'CRITICAL',
      fix: 'Move token to .env file, use process.env.TELEGRAM_BOT_TOKEN'
    },
    {
      pattern: /['"][ghp|gho|ghu|ghs|ghr]_[A-Za-z0-9]{36,}['"]/,
      name: 'Hardcoded GitHub Token',
      severity: 'CRITICAL', 
      fix: 'Move token to .env file'
    },
    {
      pattern: /['"]sk-[a-zA-Z0-9]{48}['"]/,
      name: 'Hardcoded OpenAI API Key',
      severity: 'CRITICAL',
      fix: 'Move key to .env file'
    },
    {
      pattern: /eval\s*\(\s*(atob|Buffer\.from|decodeURIComponent)/i,
      name: 'Code Obfuscation (eval + decode)',
      severity: 'CRITICAL',
      fix: 'Remove obfuscation - code should be readable'
    },
    {
      pattern: /["']openclaw-core["']/,
      name: 'Known Malicious Dependency (openclaw-core)',
      severity: 'CRITICAL',
      fix: 'DO NOT INSTALL - This is malware'
    },
    {
      pattern: /curl.+\|.*(bash|sh)\s*$/im,
      name: 'Pipe to Shell Pattern',
      severity: 'CRITICAL',
      fix: 'Review script before executing. Download and inspect first.'
    }
  ],
  high: [
    {
      pattern: /https?:\/\/(?!github\.com|raw\.githubusercontent|npmjs|nodejs)[^\s]+\.(zip|exe|bin|dmg)\b/i,
      name: 'Download from Untrusted Source',
      severity: 'HIGH',
      fix: 'Verify source is trustworthy before downloading'
    },
    {
      pattern: /(sudo|doas)\s+/,
      name: 'Requires Elevated Privileges',
      severity: 'HIGH',
      fix: 'Review why sudo is needed. Prefer user-level installs.'
    },
    {
      pattern: /(rm\s+-rf|del\s+\/f|format\s*:)\s+["']?\//,
      name: 'Destructive File Operation',
      severity: 'HIGH',
      fix: 'Verify paths are correct. Ensure backups exist.'
    },
    {
      pattern: /child_process|exec\s*\(|spawn\s*\(/,
      name: 'System Command Execution',
      severity: 'HIGH',
      fix: 'Review all system calls. Ensure input sanitization.'
    }
  ],
  medium: [
    {
      pattern: /fetch\s*\(\s*['"`][^'"`]+['"`]/,
      name: 'External Network Request',
      severity: 'MEDIUM',
      fix: 'Verify URLs are legitimate and necessary'
    },
    {
      pattern: /require\s*\(\s*['"`][^'"`]+['"`]\s*\)/,
      name: 'External Dependency',
      severity: 'MEDIUM',
      fix: 'Review npm package for security issues'
    },
    {
      pattern: /fs\.unlink|fs\.rmdir|fs\.rm/,
      name: 'File Deletion Operations',
      severity: 'MEDIUM',
      fix: 'Ensure proper path validation'
    }
  ]
};

// Safe patterns (things that look suspicious but are okay)
const SAFE_PATTERNS = [
  { pattern: /process\.env\.[A-Z_]+/, reason: 'Environment variable usage' },
  { pattern: /require\s*\(\s*['"]fs['"]\s*\)/, reason: 'Standard file system module' },
  { pattern: /require\s*\(\s*['"]path['"]\s*\)/, reason: 'Standard path module' }
];

class HardHatScanner {
  constructor(targetPath) {
    this.targetPath = targetPath;
    this.findings = [];
    this.filesScanned = 0;
    this.linesScanned = 0;
  }

  scan() {
    console.log('🔒 OPENCLAW HARD HAT');
    console.log('====================');
    console.log(`Scanning: ${this.targetPath}`);
    console.log(`Started: ${new Date().toISOString()}\n`);

    if (!fs.existsSync(this.targetPath)) {
      this.fail(`Path not found: ${this.targetPath}`);
      return;
    }

    this.scanDirectory(this.targetPath);
    this.printReport();
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (file === 'node_modules' || file.startsWith('.')) continue;
        this.scanDirectory(fullPath);
      } else {
        this.scanFile(fullPath);
      }
    }
  }

  scanFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const codeExts = ['.js', '.ts', '.py', '.sh', '.bash', '.json', '.md'];
    
    if (!codeExts.includes(ext)) return;
    
    this.filesScanned++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      this.linesScanned += lines.length;
      
      const relativePath = path.relative(this.targetPath, filePath);
      
      lines.forEach((line, idx) => {
        this.checkLine(line, relativePath, idx + 1);
      });
      
    } catch (err) {
      this.findings.push({
        severity: 'WARNING',
        file: filePath,
        line: 0,
        issue: `Could not read file: ${err.message}`,
        fix: 'Check file permissions'
      });
    }
  }

  checkLine(line, file, lineNum) {
    // Check critical patterns
    for (const check of THREAT_PATTERNS.critical) {
      if (check.pattern.test(line)) {
        // Check if it's actually safe (false positive check)
        if (this.isFalsePositive(line, check)) continue;
        
        this.findings.push({
          severity: check.severity,
          file,
          line: lineNum,
          issue: check.name,
          code: line.trim().substring(0, 80),
          fix: check.fix
        });
      }
    }
    
    // Check high patterns
    for (const check of THREAT_PATTERNS.high) {
      if (check.pattern.test(line)) {
        if (this.isFalsePositive(line, check)) continue;
        
        this.findings.push({
          severity: check.severity,
          file,
          line: lineNum,
          issue: check.name,
          code: line.trim().substring(0, 80),
          fix: check.fix
        });
      }
    }
    
    // Check medium patterns
    for (const check of THREAT_PATTERNS.medium) {
      if (check.pattern.test(line)) {
        if (this.isFalsePositive(line, check)) continue;
        
        this.findings.push({
          severity: check.severity,
          file,
          line: lineNum,
          issue: check.name,
          code: line.trim().substring(0, 80),
          fix: check.fix
        });
      }
    }
  }

  isFalsePositive(line, check) {
    // Check if line matches a safe pattern
    for (const safe of SAFE_PATTERNS) {
      if (safe.pattern.test(line)) {
        return true;
      }
    }
    
    // Specific false positive checks
    if (check.name.includes('Hardcoded') && line.includes('process.env')) {
      return true; // It's using env var, not hardcoded
    }
    
    if (check.name.includes('Pipe to Shell') && line.includes('githubusercontent')) {
      return true; // GitHub raw content is generally safe
    }
    
    return false;
  }

  printReport() {
    const critical = this.findings.filter(f => f.severity === 'CRITICAL').length;
    const high = this.findings.filter(f => f.severity === 'HIGH').length;
    const medium = this.findings.filter(f => f.severity === 'MEDIUM').length;
    const warnings = this.findings.filter(f => f.severity === 'WARNING').length;
    
    console.log('\n📊 SCAN SUMMARY');
    console.log('================');
    console.log(`Files scanned: ${this.filesScanned}`);
    console.log(`Lines scanned: ${this.linesScanned.toLocaleString()}`);
    console.log(`\nFindings: ${critical} Critical, ${high} High, ${medium} Medium, ${warnings} Warnings\n`);
    
    if (this.findings.length === 0) {
      console.log('✅ NO THREATS DETECTED');
      console.log('🟢 This skill appears safe to install');
      console.log('\n⚠️  Remember: No scanner is perfect. Always review code yourself.');
      this.exitCode = 0;
    } else {
      console.log('🚨 SECURITY FINDINGS');
      console.log('====================\n');
      
      // Sort by severity
      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'WARNING': 3 };
      this.findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      
      for (const finding of this.findings) {
        const icon = finding.severity === 'CRITICAL' ? '🔴' :
                     finding.severity === 'HIGH' ? '🟠' :
                     finding.severity === 'MEDIUM' ? '🟡' : '⚪';
        
        console.log(`${icon} ${finding.severity}`);
        console.log(`   File: ${finding.file}${finding.line ? `:${finding.line}` : ''}`);
        console.log(`   Issue: ${finding.issue}`);
        if (finding.code) console.log(`   Code: ${finding.code}`);
        console.log(`   Fix: ${finding.fix}\n`);
      }
      
      if (critical > 0) {
        console.log('❌ INSTALLATION BLOCKED');
        console.log('Critical threats detected. DO NOT install this skill.');
        console.log('\nIf you believe this is a false positive:');
        console.log('1. Review the code manually');
        console.log('2. Check with the community');
        console.log('3. Report to OpenClaw security team');
        this.exitCode = 1;
      } else if (high > 0) {
        console.log('⚠️  HIGH RISK');
        console.log('Review carefully before installing.');
        this.exitCode = 1;
      } else {
        console.log('⚡ REVIEW RECOMMENDED');
        console.log('Medium-risk findings. Understand before installing.');
        this.exitCode = 0;
      }
    }
    
    console.log('\n📚 Resources:');
    console.log('- Security best practices: docs/SECURITY_GUIDE.md');
    console.log('- Report issues: https://github.com/innergclaw/openclaw-hard-hat/issues');
    console.log(`\nScan completed: ${new Date().toISOString()}`);
  }

  fail(message) {
    console.error(`❌ ERROR: ${message}`);
    this.exitCode = 1;
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
OpenClaw Hard Hat - Safety Scanner

Usage:
  node hard-hat-scan.js /path/to/skill        Scan a skill directory
  node hard-hat-scan.js --daily-check         Run daily security check
  node hard-hat-scan.js --help               Show this help

Examples:
  node hard-hat-scan.js ./telegram-topic-manager
  node hard-hat-scan.js ~/Downloads/suspicious-skill

Exit codes:
  0 - No critical/high threats (or review recommended)
  1 - Critical/high threats detected

Always review code manually even if scan passes.
`);
    process.exit(0);
  }
  
  if (args[0] === '--daily-check') {
    console.log('Running daily security check...');
    // Check installed skills
    const workspace = process.env.HOME + '/.openclaw/workspace/.agent/skills';
    if (fs.existsSync(workspace)) {
      const skills = fs.readdirSync(workspace);
      for (const skill of skills) {
        if (skill.startsWith('.')) continue;
        console.log(`\n--- Checking: ${skill} ---`);
        const scanner = new HardHatScanner(path.join(workspace, skill));
        scanner.scan();
      }
    }
    process.exit(0);
  }
  
  const targetPath = path.resolve(args[0]);
  const scanner = new HardHatScanner(targetPath);
  scanner.scan();
  process.exit(scanner.exitCode || 0);
}

main();
