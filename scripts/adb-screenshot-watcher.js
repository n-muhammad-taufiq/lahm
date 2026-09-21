const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function getAdbPath() {
  const localSdk = path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', 'adb.exe');
  if (fs.existsSync(localSdk)) {
    return `"${localSdk}"`;
  }
  return 'adb';
}

const ADB = getAdbPath();

console.clear();
console.log('=====================================================================');
console.log('       AUTOMATIC PHONE SCREENSHOT WATCHER -> CLIPBOARD');
console.log('=====================================================================');
console.log('');
console.log(' How it works:');
console.log('   1. Connect your phone via USB or Wireless ADB.');
console.log('   2. Take a screenshot on your phone (Power + Volume Down).');
console.log('   3. The screenshot is AUTOMATICALLY copied to your PC clipboard!');
console.log('   4. Simply press Ctrl + V in Antigravity chat. Zero clicks required.');
console.log('=====================================================================');
console.log('Checking for connected devices...\n');

let lastKnownFile = null;
let isFirstCheck = true;
let isPulling = false;

// Folders where Android saves screenshots
const SCREENSHOT_DIRS = [
  '/sdcard/Pictures/Screenshots',
  '/sdcard/DCIM/Screenshots',
  '/sdcard/Screenshots'
];

function checkDeviceAndWatch() {
  exec(`${ADB} devices`, (err, stdout) => {
    if (err) {
      console.error('[!] ADB Error:', err.message);
      setTimeout(checkDeviceAndWatch, 3000);
      return;
    }

    const lines = stdout.trim().split('\n').slice(1);
    const devices = lines.filter(l => l.includes('\tdevice'));

    if (devices.length === 0) {
      process.stdout.write('\r[⏳] Waiting for Android device to be connected via USB or Wi-Fi...   ');
      setTimeout(checkDeviceAndWatch, 2000);
      return;
    }

    // Found device, check latest screenshot
    checkNewScreenshot();
  });
}

function checkNewScreenshot() {
  if (isPulling) {
    setTimeout(checkNewScreenshot, 1000);
    return;
  }

  // Query latest file across screenshot directories
  const cmd = `${ADB} shell "ls -t /sdcard/Pictures/Screenshots /sdcard/DCIM/Screenshots /sdcard/Screenshots 2>/dev/null | head -n 1"`;

  exec(cmd, (err, stdout) => {
    if (err) {
      setTimeout(checkDeviceAndWatch, 2000);
      return;
    }

    const latestFile = stdout.trim();

    if (!latestFile || latestFile.includes('No such file') || latestFile.includes('directory:')) {
      setTimeout(checkNewScreenshot, 1000);
      return;
    }

    if (isFirstCheck) {
      lastKnownFile = latestFile;
      isFirstCheck = false;
      console.log(`\n[✔] Connected to Android phone!`);
      console.log(`[i] Listening for new screenshots... (take one now to test!)\n`);
      setTimeout(checkNewScreenshot, 1000);
      return;
    }

    if (latestFile !== lastKnownFile) {
      // New screenshot detected!
      lastKnownFile = latestFile;
      pullScreenshot(latestFile);
    } else {
      setTimeout(checkNewScreenshot, 1000);
    }
  });
}

function pullScreenshot(remoteFileName) {
  isPulling = true;
  console.log(`[📸 ${new Date().toLocaleTimeString()}] New screenshot detected: ${remoteFileName}`);

  // Find exact remote path
  const findCmd = `${ADB} shell "find /sdcard/Pictures/Screenshots /sdcard/DCIM/Screenshots /sdcard/Screenshots -name '${remoteFileName}' 2>/dev/null | head -n 1"`;

  exec(findCmd, (findErr, findStdout) => {
    const remotePath = findStdout.trim();
    if (findErr || !remotePath) {
      console.error('[!] Could not locate remote path for:', remoteFileName);
      isPulling = false;
      setTimeout(checkNewScreenshot, 1000);
      return;
    }

    const ext = path.extname(remoteFileName) || '.png';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const localDest = path.join(REPORTS_DIR, `screenshot_${timestamp}${ext}`);
    const latestPath = path.join(REPORTS_DIR, `latest${ext}`);

    exec(`${ADB} pull "${remotePath}" "${localDest}"`, (pullErr) => {
      if (pullErr) {
        console.error('[!] Failed to pull screenshot:', pullErr.message);
        isPulling = false;
        setTimeout(checkNewScreenshot, 1000);
        return;
      }

      // Copy to latest.png
      try {
        fs.copyFileSync(localDest, latestPath);
      } catch(e) {}

      // Copy to Windows Clipboard
      const psCmd = `powershell -NoProfile -Command "Set-Clipboard -Path '${latestPath}'"`;
      exec(psCmd, (clipErr) => {
        isPulling = false;
        if (clipErr) {
          console.warn('[!] Could not set clipboard:', clipErr.message);
        } else {
          // Play standard Windows console beep
          process.stdout.write('\x07');
          console.log('\x1b[32m%s\x1b[0m', `[✔] COPIED DIRECTLY TO WINDOWS CLIPBOARD!`);
          console.log('\x1b[36m%s\x1b[0m', `👉 Just press Ctrl + V in Antigravity chat to paste.\n`);
        }
        setTimeout(checkNewScreenshot, 1000);
      });
    });
  });
}

// Start watching
checkDeviceAndWatch();
