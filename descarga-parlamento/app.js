const CLOUD_RUN_BACKEND = "https://descarga-parlamento-811896322472.europe-west1.run.app";
const BACKEND_BASE = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://127.0.0.1:8045"
  : CLOUD_RUN_BACKEND;

const state = {
  streams: [],
  liveRecorders: new Map(),
  vodDownloader: null,
  wakeLock: null,
};

class HLSDownloader {
  constructor({ live = false } = {}) {
    this.live = live;
    this.abortController = null;
    this.stopped = false;
    this.writer = null;
    this.seenSegments = new Set();
  }

  async start(manifestUrl, fileHandle, onProgress, onComplete) {
    this.abortController = new AbortController();
    this.stopped = false;
    this.writer = await fileHandle.createWritable();
    const startedAt = Date.now();
    let bytes = 0;
    let segmentsDone = 0;
    let segmentsTotal = 0;

    try {
      do {
        const mediaPlaylistUrl = await this.resolveMediaPlaylist(manifestUrl);
        const playlist = await this.fetchPlaylist(mediaPlaylistUrl);
        const segments = playlist.segments.filter((segment) => !this.seenSegments.has(segment.url));
        segmentsTotal = this.live ? segmentsTotal + segments.length : playlist.segments.length;

        for (const segment of segments) {
          if (this.stopped) break;
          const chunk = await this.fetchSegmentWithRetry(segment.url);
          await this.writer.write(chunk);
          this.seenSegments.add(segment.url);
          bytes += chunk.byteLength;
          segmentsDone += 1;
          onProgress?.({
            bytes,
            duration: Math.floor((Date.now() - startedAt) / 1000),
            segmentsTotal,
            segmentsDone,
          });
        }

        if (!this.live || this.stopped) break;
        await sleep(4000, this.abortController.signal);
      } while (!this.stopped);

      await this.writer.close();
      onComplete?.({ bytes, stopped: this.stopped });
    } catch (error) {
      if (this.writer) {
        try {
          await this.writer.close();
        } catch (_) {
          await this.writer.abort();
        }
      }
      if (!this.stopped) throw error;
    }
  }

  stop() {
    this.stopped = true;
    this.abortController?.abort();
  }

  async resolveMediaPlaylist(manifestUrl) {
    const text = await fetchText(manifestUrl, this.abortController.signal);
    const parsed = parseM3U8(text, manifestUrl);
    if (parsed.segments.length) return manifestUrl;
    if (parsed.variants.length) return parsed.variants[0];
    throw new Error("El manifest HLS no contiene vídeos descargables.");
  }

  async fetchPlaylist(url) {
    const text = await fetchText(url, this.abortController.signal);
    const parsed = parseM3U8(text, url);
    if (!parsed.segments.length) throw new Error("El chunklist no contiene segmentos.");
    return parsed;
  }

  async fetchSegmentWithRetry(url) {
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(url, { signal: this.abortController.signal });
        if (!response.ok) throw new Error(`Segmento ${response.status}`);
        return await response.arrayBuffer();
      } catch (error) {
        lastError = error;
        if (attempt < 3) await sleep(500 * attempt, this.abortController.signal);
      }
    }
    throw lastError;
  }
}

function parseM3U8(text, baseUrl) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const variants = [];
  const segments = [];
  let pendingDuration = null;

  for (const line of lines) {
    if (line.startsWith("#EXT-X-STREAM-INF")) {
      pendingDuration = "variant";
      continue;
    }
    if (line.startsWith("#EXTINF:")) {
      pendingDuration = Number.parseFloat(line.slice(8).split(",")[0]) || null;
      continue;
    }
    if (line.startsWith("#")) continue;
    const absolute = new URL(line, baseUrl).href;
    if (pendingDuration === "variant") {
      variants.push(absolute);
    } else {
      segments.push({ url: absolute, duration: pendingDuration });
    }
    pendingDuration = null;
  }
  return { variants, segments };
}

async function fetchText(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status} al leer ${url}`);
  return response.text();
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Abortado", "AbortError"));
    }, { once: true });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("streams-grid")) return;
  renderBrowserWarning();
  loadStreams();
  loadRecents();
  document.getElementById("refresh-recents").addEventListener("click", loadRecents);
  document.getElementById("custom-download").addEventListener("click", downloadFromCustomUrl);
});

function renderBrowserWarning() {
  if (!supportsLocalDownloads()) {
    const warning = document.getElementById("browser-warning");
    warning.textContent = "Esta función requiere Chrome, Edge u otro navegador basado en Chromium.";
    warning.classList.remove("hidden");
  }
}

async function loadStreams() {
  const container = document.getElementById("streams-grid");
  try {
    const data = await apiGet("/streams");
    state.streams = data.streams || [];
    container.innerHTML = "";
    state.streams.forEach((stream, index) => container.appendChild(renderStreamCard(stream, index + 1)));
  } catch (error) {
    container.innerHTML = `<div class="notice">No se han podido cargar los directos: ${escapeHtml(error.message)}</div>`;
  }
}

function renderStreamCard(stream, number) {
  const card = document.createElement("article");
  card.className = "stream-card stack";
  card.innerHTML = `
    <div class="stream-head">
      <div>
        <h3 class="recording-title">${escapeHtml(stream.name)}</h3>
        <p class="meta">${escapeHtml(stream.id)}</p>
      </div>
      <span class="status" id="status-${stream.id}">COMPROBANDO</span>
    </div>
    <video id="video-${stream.id}" controls muted playsinline></video>
    <div class="row">
      <button type="button" id="record-${stream.id}" ${supportsLocalDownloads() ? "" : "disabled"}>Grabar en mi ordenador</button>
    </div>
    <div class="progress-text" id="progress-${stream.id}"></div>
  `;
  const video = card.querySelector("video");
  setupPreview(video, stream.url);
  checkLiveStatus(stream.url, card.querySelector(".status"));
  card.querySelector("button").addEventListener("click", () => toggleLiveRecording(stream, number, card));
  return card;
}

function setupPreview(video, url) {
  if (window.Hls?.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
  }
}

async function checkLiveStatus(manifestUrl, badge) {
  try {
    const mediaUrl = await resolveMediaUrlForStatus(manifestUrl);
    const playlistText = await fetchText(mediaUrl);
    const hasSegments = parseM3U8(playlistText, mediaUrl).segments.length > 0;
    badge.textContent = hasSegments ? "EN EMISIÓN" : "SIN SEÑAL";
    badge.classList.toggle("live", hasSegments);
    badge.classList.toggle("off", !hasSegments);
  } catch (_) {
    badge.textContent = "NO VERIFICADO";
  }
}

async function resolveMediaUrlForStatus(manifestUrl) {
  const master = await fetchText(manifestUrl);
  const parsed = parseM3U8(master, manifestUrl);
  return parsed.variants[0] || manifestUrl;
}

async function toggleLiveRecording(stream, number, card) {
  if (state.liveRecorders.has(stream.id)) {
    state.liveRecorders.get(stream.id).stop();
    state.liveRecorders.delete(stream.id);
    setRecordButton(card, "Grabar en mi ordenador", false);
    return;
  }
  try {
    await requestWakeLock();
    const fileHandle = await pickFile(`parlamento_canal${number}_${stampForFile()}.ts`);
    const downloader = new HLSDownloader({ live: true });
    state.liveRecorders.set(stream.id, downloader);
    setRecordButton(card, "Detener", true);
    const progress = card.querySelector(".progress-text");
    downloader.start(
      stream.url,
      fileHandle,
      (info) => { progress.textContent = formatProgress(info); },
      () => {
        state.liveRecorders.delete(stream.id);
        setRecordButton(card, "Grabar en mi ordenador", false);
      },
    ).catch((error) => {
      progress.textContent = `Descarga fallida: ${error.message}`;
      state.liveRecorders.delete(stream.id);
      setRecordButton(card, "Grabar en mi ordenador", false);
    });
  } catch (error) {
    card.querySelector(".progress-text").textContent = error.message;
  }
}

function setRecordButton(card, text, recording) {
  const button = card.querySelector("button");
  button.textContent = text;
  button.classList.toggle("btn-danger", recording);
}

async function loadRecents() {
  const status = document.getElementById("recents-status");
  const list = document.getElementById("recents-list");
  status.textContent = "Cargando grabaciones...";
  list.innerHTML = "";
  try {
    const data = await apiGet("/recents?limit=20");
    status.classList.add("hidden");
    (data.items || []).forEach((item) => list.appendChild(renderRecordingCard(item)));
  } catch (error) {
    status.classList.remove("hidden");
    status.textContent = `No se han podido cargar las grabaciones: ${error.message}`;
  }
}

function renderRecordingCard(item) {
  const card = document.createElement("article");
  card.className = "recording-card";
  card.innerHTML = `
    <img class="poster" src="${escapeAttr(item.poster_url)}" alt="">
    <div class="stack">
      <div class="recording-head">
        <div class="stack-tight">
          <h3 class="recording-title">${escapeHtml(item.title)}</h3>
          <div class="meta-grid">
            <span>${escapeHtml(formatDate(item.date))}</span>
            <span>${escapeHtml(formatDuration(item.duration_seconds))}</span>
            <span>${escapeHtml(item.code || "")}</span>
            <span>${escapeHtml(item.organ || "")}</span>
          </div>
        </div>
      </div>
      <div class="tags">${(item.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="row">
        <button type="button" class="download">Descargar</button>
        <button type="button" class="markers btn-secondary">Ver intervenciones</button>
      </div>
      <div class="progress-text"></div>
    </div>
    <div class="marker-panel hidden"></div>
  `;
  card.querySelector(".download").addEventListener("click", () => downloadRecording(item, card));
  card.querySelector(".markers").addEventListener("click", () => toggleMarkers(item, card));
  return card;
}

async function downloadRecording(item, card) {
  const progress = card.querySelector(".progress-text");
  try {
    const resolved = await apiGet(`/resolve?subject_id=${encodeURIComponent(item.subject_id)}`);
    await downloadVod(resolved.manifest_url, `${safeFileName(item.code || "parlamento")}_${(item.date || "").replaceAll("-", "")}.ts`, progress);
  } catch (error) {
    progress.textContent = `Descarga fallida: ${error.message}`;
  }
}

async function toggleMarkers(item, card) {
  const panel = card.querySelector(".marker-panel");
  const button = card.querySelector(".markers");
  if (!panel.classList.contains("hidden")) {
    panel.classList.add("hidden");
    button.textContent = "Ver intervenciones";
    return;
  }
  panel.textContent = "Cargando intervenciones...";
  panel.classList.remove("hidden");
  try {
    const resolved = await apiGet(`/resolve?subject_id=${encodeURIComponent(item.subject_id)}`);
    panel.innerHTML = renderMarkers(resolved.markers || []);
    button.textContent = "Ocultar intervenciones";
  } catch (error) {
    panel.textContent = `No se han podido cargar los marcadores: ${error.message}`;
  }
}

function renderMarkers(markers) {
  const sections = markers.filter((marker) => marker.type === "section");
  const speeches = markers.filter((marker) => marker.type === "speech");
  const annotations = markers.filter((marker) => marker.type === "annotation");
  return [
    markerGroup("Secciones", sections),
    markerGroup("Intervenciones", speeches),
    markerGroup("Anotaciones", annotations),
  ].join("");
}

function markerGroup(title, markers) {
  if (!markers.length) return "";
  return `
    <div class="marker-group">
      <strong>${escapeHtml(title)}</strong>
      ${markers.map((marker) => `
        <div class="marker-row">
          <span class="marker-time">${formatTime(marker.start)} - ${formatTime(marker.end)}</span>
          <span>
            ${escapeHtml(marker.text || "")}
            ${marker.speaker ? `<br><span class="meta">${escapeHtml([marker.speaker.politics, marker.speaker.position].filter(Boolean).join(" · "))}</span>` : ""}
          </span>
        </div>
      `).join("")}
    </div>
  `;
}

// TODO: en próxima iteración, permitir descargar segmento individual.
function downloadMarker(marker) {
  console.debug("Descarga de marcador pendiente", marker);
}

async function downloadFromCustomUrl() {
  const status = document.getElementById("custom-status");
  const value = document.getElementById("custom-url").value.trim();
  if (!value) {
    status.textContent = "Introduce una URL o identificador.";
    return;
  }
  try {
    status.textContent = "Resolviendo...";
    const resolved = await apiPost("/resolve-url", { url: value });
    await downloadVod(resolved.manifest_url, `parlamento_${stampForFile()}.ts`, status);
  } catch (error) {
    status.textContent = `Descarga fallida: ${error.message}`;
  }
}

async function downloadVod(manifestUrl, suggestedName, progressNode) {
  if (!supportsLocalDownloads()) throw new Error("Esta función requiere Chrome, Edge u otro navegador basado en Chromium.");
  const fileHandle = await pickFile(suggestedName);
  const downloader = new HLSDownloader({ live: false });
  state.vodDownloader = downloader;
  await downloader.start(
    manifestUrl,
    fileHandle,
    (info) => { progressNode.textContent = formatProgress(info); },
    (info) => { progressNode.textContent = `Descarga completada: ${formatBytes(info.bytes)}.`; },
  );
}

async function apiGet(path) {
  const response = await fetch(`${BACKEND_BASE}${path}`);
  return parseApiResponse(response);
}

async function apiPost(path, payload) {
  const response = await fetch(`${BACKEND_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response);
}

async function parseApiResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
  return data;
}

function supportsLocalDownloads() {
  return "showSaveFilePicker" in window;
}

async function pickFile(suggestedName) {
  return window.showSaveFilePicker({
    suggestedName,
    types: [{ description: "Transport Stream", accept: { "video/MP2T": [".ts"] } }],
  });
}

async function requestWakeLock() {
  if ("wakeLock" in navigator && !state.wakeLock) {
    try {
      state.wakeLock = await navigator.wakeLock.request("screen");
    } catch (_) {
      state.wakeLock = null;
    }
  }
}

function formatProgress(info) {
  const total = info.segmentsTotal ? ` / ${info.segmentsTotal}` : "";
  return `${formatBytes(info.bytes)} · ${formatTime(info.duration)} · segmentos ${info.segmentsDone}${total}`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDuration(seconds) {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}min` : `${minutes} min.`;
}

function formatTime(seconds) {
  if (seconds == null) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function stampForFile() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function safeFileName(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
