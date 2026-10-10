/**
 * Unified Mobile Viewport Capture Tool for Project Lahm
 * 
 * Works identically for both Local Agent and Remote Agent.
 * Priority order:
 *  1. If an ADB Android device/emulator is connected locally, captures directly via `adb exec-out screencap -p`.
 *  2. If Expo web is running, captures the mobile viewport (390x844) via Playwright/Puppeteer.
 *  3. Fallbacks to the latest image in `reports/` (sent via Phone Bridge or ADB watcher).
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'latest-screen.png');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Port mapping for Expo apps
const APP_PORTS = {
  customer: 8081,
  delivery: 8082,
  merchant: 8083,
};

function parseArgs() {
  const args = process.argv.slice(2);
  let app = 'customer';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--app' && args[i + 1]) {
      app = args[i + 1].toLowerCase();
    }
  }
  return { app };
}

// 1. Try capturing from connected ADB device/emulator
function tryAdbCapture() {
  try {
    const devicesOutput = execSync('adb devices', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const hasDevice = devicesOutput.split('\n').slice(1).some(line => line.includes('\tdevice'));
    if (hasDevice) {
      execSync(`adb exec-out screencap -p > "${OUTPUT_FILE}"`, { stdio: 'ignore' });
      if (fs.existsSync(OUTPUT_FILE) && fs.statSync(OUTPUT_FILE).size > 1000) {
        console.log(`[✔] Captured live screenshot from Android device/emulator via ADB: ${OUTPUT_FILE}`);
        return true;
      }
    }
  } catch (e) {
    // ADB not available or no device connected
  }
  return false;
}

// 2. Try capturing from Expo Web via Playwright CLI
function tryPlaywrightCapture(port) {
  try {
    const url = `http://localhost:${port}`;
    console.log(`[i] Attempting headless capture from Expo web at ${url}...`);
    execSync(`npx --yes playwright screenshot --viewport-size="390,844" "${url}" "${OUTPUT_FILE}"`, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 15000,
    });
    if (fs.existsSync(OUTPUT_FILE) && fs.statSync(OUTPUT_FILE).size > 1000) {
      console.log(`[✔] Captured mobile viewport screenshot via Playwright: ${OUTPUT_FILE}`);
      return true;
    }
  } catch (e) {
    // Playwright not installed or server not up
  }
  return false;
}

// 3. Check for recent Phone Bridge uploads in reports/
function tryRecentReport() {
  const candidates = ['latest.png', 'latest.jpg', 'latest.jpeg'];
  for (const name of candidates) {
    const candidatePath = path.join(REPORTS_DIR, name);
    if (fs.existsSync(candidatePath)) {
      fs.copyFileSync(candidatePath, OUTPUT_FILE);
      console.log(`[✔] Using latest screenshot from Phone Bridge: ${OUTPUT_FILE}`);
      return true;
    }
  }
  return false;
}

function main() {
  const { app } = parseArgs();
  const port = APP_PORTS[app] || 8081;

  console.log(`[Lahm Visual Capture] Target App: ${app} (Port ${port})`);

  // Step 1: Check ADB
  if (tryAdbCapture()) return;

  // Step 2: Check Playwright / Expo Web
  if (tryPlaywrightCapture(port)) return;

  // Step 3: Check Phone Bridge fallback
  if (tryRecentReport()) return;

  console.error(`[!] Could not capture live screen automatically.`);
  console.log(`[i] To enable visual capture:`);
  console.log(`    1. Connect an Android phone/emulator via ADB, OR`);
  console.log(`    2. Run 'npm run start:${app}' with Expo Web enabled, OR`);
  console.log(`    3. Upload a screenshot to the Phone Bridge at http://localhost:4040`);
  process.exit(1);
}

main();
