#!/usr/bin/env node
/**
 * Setup daily security checks for OpenClaw
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 OpenClaw Hard Hat - Daily Check Setup');
console.log('========================================\n');

const hardHatDir = __dirname;
const logDir = path.join(hardHatDir, '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create the daily check script
const dailyScript = `#!/bin/bash
# OpenClaw Hard Hat - Daily Security Check
# Generated: ${new Date().toISOString()}

HARDHAT_DIR="${hardHatDir}"
LOG_DIR="${logDir}"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/daily-check-$DATE.log"

echo "========================================" >> "$LOG_FILE"
echo "Daily Security Check - $DATE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

cd "$HARDHAT_DIR"
node scripts/hard-hat-scan.js --daily-check >> "$LOG_FILE" 2>&1

echo "" >> "$LOG_FILE"
echo "Completed: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Keep only last 30 days of logs
find "$LOG_DIR" -name "daily-check-*.log" -mtime +30 -delete
`;

const scriptPath = path.join(hardHatDir, 'daily-check.sh');
fs.writeFileSync(scriptPath, dailyScript);
fs.chmodSync(scriptPath, 0o755);

console.log('✅ Created daily-check.sh');

// Detect OS and provide instructions
const platform = process.platform;

console.log('\n📅 Schedule Options:\n');

if (platform === 'darwin') {
  console.log('macOS - Option 1: Using launchd');
  console.log('----------------------------');
  
  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.hardhat.dailycheck</string>
    <key>ProgramArguments</key>
    <array>
        <string>${scriptPath}</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>${logDir}/launchd-out.log</string>
    <key>StandardErrorPath</key>
    <string>${logDir}/launchd-err.log</string>
</dict>
</plist>`;

  const plistPath = path.join(process.env.HOME, 'Library/LaunchAgents/com.openclaw.hardhat.dailycheck.plist');
  fs.writeFileSync(plistPath, plistContent);
  
  console.log(`✅ Created: ${plistPath}`);
  console.log('\nTo activate:');
  console.log(`  launchctl load ${plistPath}`);
  console.log('');
  
  console.log('macOS - Option 2: Using cron');
  console.log('----------------------------');
  console.log('Add this to your crontab (run: crontab -e):');
  console.log(`  0 9 * * * ${scriptPath}`);
  
} else if (platform === 'linux') {
  console.log('Linux - Using cron');
  console.log('-------------------');
  console.log('Add this to your crontab (run: crontab -e):');
  console.log(`  0 9 * * * ${scriptPath}`);
  
} else {
  console.log('Windows - Using Task Scheduler');
  console.log('-------------------------------');
  console.log('1. Open Task Scheduler');
  console.log('2. Create Basic Task');
  console.log('3. Name: "OpenClaw Hard Hat Daily Check"');
  console.log('4. Trigger: Daily at 9:00 AM');
  console.log(`5. Action: Start Program`);
  console.log(`   Program: node`);
  console.log(`   Arguments: ${path.join(hardHatDir, 'scripts', 'hard-hat-scan.js')} --daily-check`);
}

console.log('\n📊 Logs will be saved to:');
console.log(`  ${logDir}`);

console.log('\n✨ Setup complete!');
console.log('\nTo run a check now:');
console.log(`  ${scriptPath}`);
