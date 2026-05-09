/* ================================================================
   AvlokAI Ops — App Deployment Main Module
   Renders the full page, handles API calls, admin uploads
   ================================================================ */

import './style.css';
import logoUrl from '/logo.jpeg?url';
import { icons } from './icons.js';

// ── Config ────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE || window.location.origin;
const API_PREFIX = '/api/releases';

// ── State ─────────────────────────────────────────────────────────
let latestRelease = null;
let adminToken = null;

// ── Render Page ───────────────────────────────────────────────────
export function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="bg-particles" id="bgParticles"></div>

    <main class="container">
      <!-- Hero -->
      <section class="hero" id="hero">
        <div class="hero-glow"></div>
        <div class="app-icon-wrapper">
          <img src="${logoUrl}" alt="AvlokAI Ops" class="app-icon" id="appIcon" />
          <div class="icon-ring"></div>
          <div class="icon-ring icon-ring--delayed"></div>
        </div>
        <h1 class="hero-title" id="heroTitle">AvlokAI <span class="accent">Ops</span></h1>
        <p class="hero-subtitle">Internal Operations Suite</p>
        <div class="version-badge" id="versionBadge">
          <span class="version-dot"></span>
          <span id="versionText">Checking for updates...</span>
        </div>
      </section>

      <!-- Download Card -->
      <section class="download-card" id="downloadCard">
        <div class="card-glass">
          <div class="card-header">
            <div class="card-icon">${icons.download}</div>
            <div>
              <h2 class="card-title">Download Latest Version</h2>
              <p class="card-desc" id="releaseDate">—</p>
            </div>
          </div>
          <div class="release-info" id="releaseInfo">
            <div class="info-row"><span class="info-label">Version</span><span class="info-value" id="infoVersion">—</span></div>
            <div class="info-row"><span class="info-label">Build Code</span><span class="info-value" id="infoBuildCode">—</span></div>
            <div class="info-row"><span class="info-label">File Size</span><span class="info-value" id="infoSize">—</span></div>
            <div class="info-row"><span class="info-label">Min Android</span><span class="info-value" id="infoMinSdk">—</span></div>
            <div class="info-row"><span class="info-label">Downloads</span><span class="info-value" id="infoDownloads">—</span></div>
          </div>
          <button class="download-btn" id="downloadBtn" disabled>
            ${icons.downloadSmall}
            <span id="downloadBtnText">Loading...</span>
          </button>
          <div class="mandatory-badge hidden" id="mandatoryBadge">
            ${icons.warning}
            <span>Mandatory Update — Please install this version</span>
          </div>
        </div>
      </section>

      <!-- Release Notes -->
      <section class="release-notes" id="releaseNotes">
        <div class="card-glass">
          <h3 class="notes-title">${icons.document} What's New</h3>
          <div class="notes-body" id="notesBody">
            <p class="notes-placeholder">No release notes available.</p>
          </div>
        </div>
      </section>

      <!-- Version History -->
      <section class="version-history" id="versionHistory">
        <div class="card-glass">
          <h3 class="notes-title">${icons.clock} Version History</h3>
          <div class="history-list" id="historyList">
            <p class="notes-placeholder">Loading...</p>
          </div>
        </div>
      </section>

      <!-- Install Guide -->
      <section class="install-guide">
        <div class="card-glass">
          <h3 class="notes-title">${icons.help} How to Install</h3>
          <div class="steps">
            <div class="step"><div class="step-number">1</div><div class="step-content"><h4>Download the APK</h4><p>Tap the download button above.</p></div></div>
            <div class="step"><div class="step-number">2</div><div class="step-content"><h4>Allow Unknown Sources</h4><p>Go to Settings → Security → Install Unknown Apps.</p></div></div>
            <div class="step"><div class="step-number">3</div><div class="step-content"><h4>Install & Open</h4><p>Open the file and tap Install. Sign in with your credentials.</p></div></div>
          </div>
        </div>
      </section>

      <footer class="footer"><p>© 2026 AvlokAI Technologies Pvt Ltd.</p></footer>
    </main>

    <!-- Admin Upload Modal -->
    <div class="modal-overlay hidden" id="adminModal">
      <div class="modal card-glass">
        <div class="modal-header">
          <h3>Upload New Release</h3>
          <button class="modal-close" id="modalClose">${icons.close}</button>
        </div>
        <form id="uploadForm" enctype="multipart/form-data">
          <div class="form-group"><label for="uploadVersionName">Version Name</label><input type="text" id="uploadVersionName" placeholder="e.g. 1.2.0" required /></div>
          <div class="form-group"><label for="uploadVersionCode">Version Code</label><input type="number" id="uploadVersionCode" placeholder="e.g. 3" min="1" required /></div>
          <div class="form-group"><label for="uploadReleaseNotes">Release Notes</label><textarea id="uploadReleaseNotes" rows="4" placeholder="What's new..."></textarea></div>
          <div class="form-group"><label for="uploadMinSdk">Min Android SDK</label><input type="number" id="uploadMinSdk" value="24" min="21" /></div>
          <div class="form-group checkbox-group"><input type="checkbox" id="uploadMandatory" /><label for="uploadMandatory">Mandatory update</label></div>
          <div class="form-group"><label>APK File</label>
            <div class="file-drop" id="fileDrop">
              ${icons.upload}
              <p>Drag & drop APK or <span class="file-browse">browse</span></p>
              <p class="file-name" id="fileName"></p>
              <input type="file" id="uploadApk" accept=".apk" hidden />
            </div>
          </div>
          <button type="submit" class="download-btn upload-btn" id="uploadBtn"><span>Upload Release</span></button>
          <div class="upload-progress hidden" id="uploadProgress">
            <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
            <p class="progress-text" id="progressText">Uploading... 0%</p>
          </div>
        </form>
      </div>
    </div>

    <!-- Admin FAB -->
    <button class="admin-fab hidden" id="adminFab" title="Upload new release">${icons.plus}</button>

    <!-- Toast -->
    <div class="toast hidden" id="toast"><span id="toastMsg"></span></div>
  `;
}

// ── DOM Helpers ────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);

// ── Utilities ─────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0, size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function sdkToAndroidVersion(sdk) {
  const map = {
    21:'5.0',22:'5.1',23:'6.0',24:'7.0',25:'7.1',26:'8.0',27:'8.1',
    28:'9',29:'10',30:'11',31:'12',32:'12L',33:'13',34:'14',35:'15',36:'16'
  };
  return map[sdk] || `API ${sdk}`;
}

function showToast(msg, duration = 3000) {
  const toast = $('#toast');
  const toastMsg = $('#toastMsg');
  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, duration);
}

// ── Particles ─────────────────────────────────────────────────────
function initParticles() {
  const container = $('#bgParticles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.width = p.style.height = `${Math.random() * 4 + 2}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 12}s`;
    p.style.animationDuration = `${8 + Math.random() * 8}s`;
    container.appendChild(p);
  }
}

// ── API ───────────────────────────────────────────────────────────
async function fetchLatestRelease() {
  try {
    const res = await fetch(`${API_BASE}${API_PREFIX}/latest`);
    if (!res.ok) throw new Error('No releases');
    return await res.json();
  } catch { return null; }
}

async function fetchAllReleases() {
  try {
    const res = await fetch(`${API_BASE}${API_PREFIX}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.releases || [];
  } catch { return []; }
}

// ── Render Data ───────────────────────────────────────────────────
function renderLatest(release) {
  if (!release) {
    $('#versionText').textContent = 'No releases yet';
    $('#downloadBtnText').textContent = 'No APK Available';
    $('#notesBody').innerHTML = '<p class="notes-placeholder">No release notes available.</p>';
    return;
  }

  latestRelease = release;
  $('#versionText').textContent = `v${release.version_name} (Build ${release.version_code})`;
  $('#releaseDate').textContent = `Released ${formatDate(release.created_at)}`;
  $('#infoVersion').textContent = `v${release.version_name}`;
  $('#infoBuildCode').textContent = release.version_code;
  $('#infoSize').textContent = formatBytes(release.apk_size_bytes);
  $('#infoMinSdk').textContent = `Android ${sdkToAndroidVersion(release.min_android_sdk)}+`;
  $('#infoDownloads').textContent = release.download_count?.toLocaleString() || '0';

  $('#downloadBtn').disabled = false;
  $('#downloadBtnText').textContent = `Download APK (${formatBytes(release.apk_size_bytes)})`;

  if (release.is_mandatory) {
    $('#mandatoryBadge').classList.remove('hidden');
  }

  if (release.release_notes) {
    const body = $('#notesBody');
    body.innerHTML = '';
    body.textContent = release.release_notes;
  }
}

function renderHistory(releases) {
  const list = $('#historyList');
  if (!releases.length) {
    list.innerHTML = '<p class="notes-placeholder">No version history.</p>';
    return;
  }
  list.innerHTML = releases.map((r, i) => `
    <div class="history-item">
      <div class="history-dot ${i > 0 ? 'history-dot--old' : ''}"></div>
      <div class="history-meta">
        <div class="history-version">v${r.version_name} — Build ${r.version_code}</div>
        <div class="history-date">${formatDate(r.created_at)}</div>
      </div>
      <div class="history-size">${formatBytes(r.apk_size_bytes)}</div>
    </div>
  `).join('');
}

// ── Download ──────────────────────────────────────────────────────
function handleDownload() {
  if (!latestRelease) return;
  window.location.href = `${API_BASE}${API_PREFIX}/${latestRelease.id}/download`;
}

// ── Admin Auth ────────────────────────────────────────────────────
function checkAdminAccess() {
  adminToken = localStorage.getItem('avlokai_admin_token');
  if (adminToken) $('#adminFab').classList.remove('hidden');

  let clickCount = 0, clickTimer = null;
  const title = $('#heroTitle');
  if (title) {
    title.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clickCount = 0; }, 600);
      if (clickCount >= 3) { clickCount = 0; promptAdminLogin(); }
    });
  }
}

async function promptAdminLogin() {
  if (adminToken) { $('#adminFab').classList.remove('hidden'); showToast('Admin mode already active'); return; }
  const email = prompt('Admin email:');
  if (!email) return;
  const password = prompt('Admin password:');
  if (!password) return;

  try {
    const res = await fetch(`https://crm-api.avlokai.com/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.user?.role !== 'admin') throw new Error('Admin access required');
    adminToken = data.accessToken;
    localStorage.setItem('avlokai_admin_token', adminToken);
    $('#adminFab').classList.remove('hidden');
    showToast('Admin mode activated ✓');
  } catch (err) { showToast(`Login failed: ${err.message}`); }
}

// ── Admin Upload ──────────────────────────────────────────────────
function initAdminUpload() {
  const fab = $('#adminFab');
  const modal = $('#adminModal');
  const close = $('#modalClose');
  const form = $('#uploadForm');
  const drop = $('#fileDrop');
  const apkInput = $('#uploadApk');
  const fileNameEl = $('#fileName');
  const progress = $('#uploadProgress');
  const progressFill = $('#progressFill');
  const progressTextEl = $('#progressText');

  fab.addEventListener('click', () => modal.classList.remove('hidden'));
  close.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

  drop.addEventListener('click', () => apkInput.click());
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragging'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('dragging'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault(); drop.classList.remove('dragging');
    if (e.dataTransfer.files.length) {
      apkInput.files = e.dataTransfer.files;
      fileNameEl.textContent = e.dataTransfer.files[0].name;
    }
  });
  apkInput.addEventListener('change', () => {
    if (apkInput.files.length) fileNameEl.textContent = apkInput.files[0].name;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!apkInput.files.length) { showToast('Please select an APK file'); return; }

    const fd = new FormData();
    fd.append('apk', apkInput.files[0]);
    fd.append('versionName', $('#uploadVersionName').value);
    fd.append('versionCode', $('#uploadVersionCode').value);
    fd.append('releaseNotes', $('#uploadReleaseNotes').value);
    fd.append('minAndroidSdk', $('#uploadMinSdk').value);
    fd.append('isMandatory', $('#uploadMandatory').checked);

    const btn = $('#uploadBtn');
    btn.disabled = true;
    progress.classList.remove('hidden');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${API_PREFIX}`);
    xhr.setRequestHeader('Authorization', `Bearer ${adminToken}`);

    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.round((ev.loaded / ev.total) * 100);
        progressFill.style.width = `${pct}%`;
        progressTextEl.textContent = `Uploading... ${pct}%`;
      }
    });

    xhr.addEventListener('load', async () => {
      btn.disabled = false;
      if (xhr.status >= 200 && xhr.status < 300) {
        showToast('Release uploaded successfully ✓');
        modal.classList.add('hidden');
        form.reset(); fileNameEl.textContent = '';
        progress.classList.add('hidden'); progressFill.style.width = '0%';
        await loadData();
      } else {
        const data = JSON.parse(xhr.responseText);
        showToast(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    });

    xhr.addEventListener('error', () => { btn.disabled = false; showToast('Upload failed: Network error'); });
    xhr.send(fd);
  });
}

// ── Load Data ─────────────────────────────────────────────────────
async function loadData() {
  const [latest, all] = await Promise.all([fetchLatestRelease(), fetchAllReleases()]);
  renderLatest(latest);
  renderHistory(all);
}

// ── Init ──────────────────────────────────────────────────────────
renderApp();
initParticles();
checkAdminAccess();
initAdminUpload();
$('#downloadBtn').addEventListener('click', handleDownload);
loadData();
