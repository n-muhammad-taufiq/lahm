const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = 4040;
const ROOT_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Get the local LAN IP for phone connection
function getLocalIp() {
  const nets = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        // prioritize Wi-Fi or Ethernet
        if (/wi-fi|wireless|wlan/i.test(name)) {
          return net.address;
        }
        candidates.push(net.address);
      }
    }
  }
  return candidates[0] || '127.0.0.1';
}

const localIp = getLocalIp();

const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Lahm -> Antigravity Bridge</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .header {
      text-align: center;
      margin-bottom: 8px;
    }
    .header h1 {
      font-size: 1.4rem;
      color: #38bdf8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .header p {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-top: 4px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 18px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .dropzone {
      border: 2px dashed #475569;
      border-radius: 12px;
      padding: 24px 16px;
      text-align: center;
      cursor: pointer;
      background: #0f172a;
      transition: all 0.2s;
    }
    .dropzone.has-image {
      border-color: #38bdf8;
      background: #1e293b;
    }
    .dropzone svg {
      width: 48px;
      height: 48px;
      fill: #38bdf8;
      margin-bottom: 8px;
    }
    .preview-container {
      margin-top: 12px;
      display: none;
      border-radius: 8px;
      overflow: hidden;
      max-height: 240px;
      border: 1px solid #475569;
    }
    .preview-container img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
      background: #000;
    }
    textarea {
      width: 100%;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 10px;
      color: #f8fafc;
      padding: 12px;
      font-size: 0.9rem;
      resize: vertical;
      min-height: 80px;
      margin-top: 8px;
    }
    textarea:focus {
      outline: none;
      border-color: #38bdf8;
    }
    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e1;
    }
    button {
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 16px;
      font-size: 1rem;
      font-weight: 700;
      width: 100%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(37,99,235,0.4);
      transition: opacity 0.2s;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .status-msg {
      padding: 12px;
      border-radius: 10px;
      font-size: 0.88rem;
      text-align: center;
      display: none;
      animation: fadeIn 0.3s ease;
    }
    .status-success {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #34d399;
    }
    .status-error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #f87171;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .badge {
      font-size: 0.75rem;
      background: #334155;
      padding: 4px 8px;
      border-radius: 20px;
      color: #94a3b8;
      display: inline-block;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Phone ➔ Antigravity</h1>
      <p>Send screenshots & logs directly to your PC clipboard</p>
      <div class="badge">Connected to PC: ${localIp}</div>
    </div>

    <div class="card">
      <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        <p style="font-weight:600;">Tap to Choose or Snap Screenshot</p>
        <p style="font-size:0.75rem; color:#64748b; margin-top:4px;">Supports camera, photos, or paste</p>
      </div>
      <input type="file" id="fileInput" accept="image/*" style="display:none;" onchange="handleFile(this.files[0])">

      <div class="preview-container" id="previewContainer">
        <img id="previewImage" alt="Preview">
      </div>
    </div>

    <div class="card">
      <label for="errorText">Error Description / Log (optional):</label>
      <textarea id="errorText" placeholder="Paste error message, stack trace, or describe the UI bug..."></textarea>
    </div>

    <button id="sendBtn" onclick="uploadData()">
      <span>📤 Send to Antigravity PC</span>
    </button>

    <div id="statusMsg" class="status-msg"></div>
  </div>

  <script>
    let selectedBase64 = null;

    function handleFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedBase64 = e.target.result;
        document.getElementById('previewImage').src = selectedBase64;
        document.getElementById('previewContainer').style.display = 'block';
        document.getElementById('dropzone').classList.add('has-image');
        document.getElementById('dropzone').querySelector('p').textContent = 'Tap to change screenshot (' + (file.size / 1024).toFixed(0) + ' KB)';
      };
      reader.readAsDataURL(file);
    }

    // Support clipboard paste directly on mobile page
    window.addEventListener('paste', (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          handleFile(blob);
          break;
        }
      }
    });

    async function uploadData() {
      const btn = document.getElementById('sendBtn');
      const text = document.getElementById('errorText').value.trim();
      const status = document.getElementById('statusMsg');

      if (!selectedBase64 && !text) {
        showStatus('Please select a screenshot or type an error message.', false);
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span>⏳ Sending to PC...</span>';
      status.style.display = 'none';

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: selectedBase64, text: text })
        });
        const data = await res.json();
        if (data.ok) {
          showStatus('✅ Received on PC! It is now on your PC clipboard. Just press Ctrl + V in Antigravity chat!', true);
          // Reset
          selectedBase64 = null;
          document.getElementById('previewContainer').style.display = 'none';
          document.getElementById('dropzone').classList.remove('has-image');
          document.getElementById('dropzone').querySelector('p').textContent = 'Tap to Choose or Snap Screenshot';
          document.getElementById('errorText').value = '';
          document.getElementById('fileInput').value = '';
        } else {
          showStatus('❌ Error: ' + (data.error || 'Upload failed'), false);
        }
      } catch (err) {
        showStatus('❌ Failed to connect to PC. Ensure phone & PC are on the same Wi-Fi.', false);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>📤 Send to Antigravity PC</span>';
      }
    }

    function showStatus(msg, isSuccess) {
      const s = document.getElementById('statusMsg');
      s.textContent = msg;
      s.className = 'status-msg ' + (isSuccess ? 'status-success' : 'status-error');
      s.style.display = 'block';
    }
  </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_PAGE);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/upload') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // limit max payload to 25MB
      if (body.length > 25 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'File too large' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        let imageSaved = false;
        let latestImagePath = null;

        if (data.image && data.image.startsWith('data:image/')) {
          const matches = data.image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const filename = `screenshot_${timestamp}.${ext}`;
            const filePath = path.join(REPORTS_DIR, filename);
            latestImagePath = path.join(REPORTS_DIR, `latest.${ext}`);

            fs.writeFileSync(filePath, buffer);
            fs.writeFileSync(latestImagePath, buffer);
            imageSaved = true;
          }
        }

        if (data.text) {
          const textFilename = `error_${timestamp}.txt`;
          fs.writeFileSync(path.join(REPORTS_DIR, textFilename), data.text, 'utf8');
          fs.writeFileSync(path.join(REPORTS_DIR, 'latest-error.txt'), data.text, 'utf8');
        }

        // Copy to Windows clipboard via PowerShell
        if (imageSaved && latestImagePath) {
          const psCommand = `powershell -NoProfile -Command "Set-Clipboard -Path '${latestImagePath}'"`;
          exec(psCommand, (err) => {
            if (err) {
              console.warn('[!] Could not set clipboard:', err.message);
            } else {
              console.log('\x1b[32m%s\x1b[0m', `[✔] Screenshot received & COPIED TO WINDOWS CLIPBOARD!`);
              console.log('\x1b[36m%s\x1b[0m', `[i] Ready: Simply press Ctrl + V in Antigravity chat.\n`);
            }
          });
        } else if (data.text) {
          const cleanText = data.text.replace(/'/g, "''");
          const psCommand = `powershell -NoProfile -Command "Set-Clipboard -Value '${cleanText}'"`;
          exec(psCommand, () => {
            console.log('\x1b[32m%s\x1b[0m', `[✔] Error text received & COPIED TO WINDOWS CLIPBOARD!`);
          });
        }

        console.log(`[+] Report received at ${new Date().toLocaleTimeString()} (saved in reports/)`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error('[-] Error handling upload:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.clear();
  console.log('=====================================================================');
  console.log('              PHONE -> ANTIGRAVITY BRIDGE SERVER');
  console.log('=====================================================================');
  console.log('');
  console.log(' 📱 On your phone browser (Safari / Chrome), open:');
  console.log('');
  console.log(`    👉  http://${localIp}:${PORT}`);
  console.log('');
  console.log(' 💡 Tip: Tap "Add to Home Screen" on your phone to use it like an app.');
  console.log(' 💡 When you tap upload on your phone:');
  console.log('    It automatically copies the screenshot to your PC Clipboard.');
  console.log('    Then just press Ctrl + V in Antigravity chat!');
  console.log('=====================================================================');
  console.log(' Waiting for incoming screenshots/errors...\n');
});

