/* ==================================
   Ajuste Vertical · 1920×1125
   ================================== */

// Constants
const CW = 1920;
const CH = 1125;

// State
const state = {
  img: null,
  fileBaseName: "",
  fgScale: 1.0,
  bgScale: 1.0,
  fgOffsetX: 0,
  fgOffsetY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
};

// UI Elements
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fgScaleSlider = document.getElementById('fgScaleSlider');
const bgScaleSlider = document.getElementById('bgScaleSlider');
const fgScaleValue = document.getElementById('fgScaleValue');
const bgScaleValue = document.getElementById('bgScaleValue');
const exportBtn = document.getElementById('exportBtn');
const resetPosBtn = document.getElementById('resetPosBtn');
const statusMsg = document.getElementById('statusMsg');

// ===== INITIALIZATION =====
function initUI() {
  setupDnD();
  setupSliders();
  setupExport();
  setupResetPos();
  setupDragOnCanvas();
}

// ===== DRAG & DROP =====
function setupDnD() {
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      loadFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      loadFile(e.target.files[0]);
    }
  });
}

// ===== FILE LOADING =====
async function loadFile(file) {
  if (!file.type.startsWith('image/')) {
    statusMsg.textContent = '❌ Debes seleccionar una imagen.';
    return;
  }

  statusMsg.textContent = '⏳ Cargando imagen…';

  state.fileBaseName = file.name.replace(/\.[^.]+$/, '');

  try {
    // Try createImageBitmap with EXIF orientation
    try {
      state.img = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Fallback: Image + URL
      state.img = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    }

    statusMsg.textContent = '✅ Imagen cargada. Arrastra para recolocar.';
    exportBtn.disabled = false;
    resetPosBtn.disabled = false;
    state.fgOffsetX = 0;
    state.fgOffsetY = 0;
    render();
  } catch (err) {
    statusMsg.textContent = '❌ Error al cargar: ' + err.message;
  }
}

// ===== SLIDERS =====
function setupSliders() {
  fgScaleSlider.addEventListener('input', (e) => {
    state.fgScale = parseFloat(e.target.value);
    fgScaleValue.textContent = state.fgScale.toFixed(2);
    render();
  });

  bgScaleSlider.addEventListener('input', (e) => {
    state.bgScale = parseFloat(e.target.value);
    bgScaleValue.textContent = state.bgScale.toFixed(2);
    render();
  });
}

// ===== CANVAS RENDERING =====
function render() {
  if (!state.img) return;

  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CW, CH);

  // Background (blur, cover, opacity 15%)
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.filter = 'blur(12px)';
  drawCover(ctx, state.img, CW, CH, state.bgScale);
  ctx.restore();

  // Foreground (sharp, contain-by-height, opacity 100%)
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  drawContainHeight(ctx, state.img, CW, CH, state.fgScale, state.fgOffsetX, state.fgOffsetY);
  ctx.restore();
}

function drawCover(ctx, img, cw, ch, scale) {
  const imgAspect = img.width / img.height;
  const canvasAspect = cw / ch;

  let sw, sh, sx, sy;

  if (imgAspect > canvasAspect) {
    // Image is wider: fit height
    sh = img.height;
    sw = sh * canvasAspect * scale;
    sy = 0;
    sx = (img.width - sw) / 2;
  } else {
    // Image is taller: fit width
    sw = img.width;
    sh = sw / canvasAspect * scale;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}

function drawContainHeight(ctx, img, cw, ch, scale, offX, offY) {
  const imgAspect = img.width / img.height;

  // Height-based fit
  const dh = ch * scale;
  const dw = dh * imgAspect;

  const dx = (cw - dw) / 2 + offX;
  const dy = (ch - dh) / 2 + offY;

  ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
}

// ===== DRAG ON CANVAS =====
function setupDragOnCanvas() {
  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('touchstart', startDrag, { passive: false });

  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('touchmove', moveDrag, { passive: false });

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
  if (!state.img) return;

  state.isDragging = true;
  const pos = getCanvasPos(e);
  state.dragStartX = pos.x;
  state.dragStartY = pos.y;
  canvas.style.cursor = 'grabbing';
  e.preventDefault();
}

function moveDrag(e) {
  if (!state.isDragging || !state.img) return;

  const pos = getCanvasPos(e);
  const dx = pos.x - state.dragStartX;
  const dy = pos.y - state.dragStartY;

  state.fgOffsetX += dx;
  state.fgOffsetY += dy;

  state.dragStartX = pos.x;
  state.dragStartY = pos.y;

  render();
  e.preventDefault();
}

function endDrag(e) {
  if (!state.isDragging) return;
  state.isDragging = false;
  if (state.img) {
    canvas.style.cursor = 'grab';
  }
  e.preventDefault();
}

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  let clientX = e.clientX;
  let clientY = e.clientY;

  if (e.touches) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

// ===== EXPORT =====
function setupExport() {
  exportBtn.addEventListener('click', exportJpg);
}

function exportJpg() {
  if (!state.img) return;

  statusMsg.textContent = '⏳ Exportando JPG…';

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.fileBaseName}-1920x1125.jpg`;
    a.click();
    URL.revokeObjectURL(url);

    statusMsg.textContent = '✅ JPG exportado: ' + a.download;
  }, 'image/jpeg', 0.92);
}

// ===== RESET POSITION =====
function setupResetPos() {
  resetPosBtn.addEventListener('click', () => {
    state.fgOffsetX = 0;
    state.fgOffsetY = 0;
    statusMsg.textContent = '⟲ Posición reseteada.';
    render();
  });
}

// ===== START =====
document.addEventListener('DOMContentLoaded', initUI);

// Update cursor when image is loaded
const observer = new MutationObserver(() => {
  if (state.img && !state.isDragging) {
    canvas.style.cursor = 'grab';
  }
});
observer.observe(canvas, { attributes: true });
