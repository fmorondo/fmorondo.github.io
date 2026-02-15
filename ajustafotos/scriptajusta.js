const CANVAS_WIDTH = 1365;
const CANVAS_HEIGHT = 794;
const MAX_PHOTOS = 12;
const MIN_PHOTOS = 3;
const EDGE_GAP = 10;
const INNER_GAP = 10;

const colorOptions = [
  { name: "Gris claro", value: "#e6e7e9" },
  { name: "Gris cálido", value: "#d7d2c9" },
  { name: "Beige", value: "#e7dfd0" },
  { name: "Blanco roto", value: "#f3f1eb" },
  { name: "Azul apagado", value: "#d2dbe2" },
];

const state = {
  photos: [],
  layoutFrames: [],
  selectedIndex: -1,
  dragging: null,
  backgroundColor: colorOptions[0].value,
  backgroundImage: null,
};

const photoInput = document.getElementById("photoInput");
const folderInput = document.getElementById("folderInput");
const bgInput = document.getElementById("bgInput");
const dropZone = document.getElementById("dropZone");
const colorPalette = document.getElementById("colorPalette");
const zoomControl = document.getElementById("zoomControl");
const selectedInfo = document.getElementById("selectedInfo");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");
const statusEl = document.getElementById("status");

const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");

buildColorPalette();
bindEvents();
render();

function buildColorPalette() {
  colorOptions.forEach((option, index) => {
    const wrapper = document.createElement("label");
    wrapper.className = "color-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "background-color";
    input.value = option.value;
    input.checked = index === 0;

    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = option.value;
    swatch.title = option.name;

    wrapper.appendChild(input);
    wrapper.appendChild(swatch);
    colorPalette.appendChild(wrapper);

    input.addEventListener("change", () => {
      state.backgroundColor = option.value;
      render();
    });
  });
}

function bindEvents() {
  photoInput.addEventListener("change", handleFilePickerUpload);
  folderInput.addEventListener("change", handleFilePickerUpload);
  bgInput.addEventListener("change", handleBackgroundUpload);

  zoomControl.addEventListener("input", () => {
    if (state.selectedIndex < 0) return;
    const photo = state.photos[state.selectedIndex];
    photo.scale = Number(zoomControl.value) / 100;
    clampPhotoOffset(state.selectedIndex);
    render();
  });

  downloadBtn.addEventListener("click", () => {
    const suggestedName = "composicion-1365x794";
    const userName = window.prompt("Nombre del archivo (sin extensión):", suggestedName);
    if (userName === null) return;

    const cleanName = userName.trim().replace(/[\\/:*?"<>|]+/g, "_");
    const finalName = cleanName || suggestedName;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.92);
    link.download = `${finalName}.jpg`;
    link.click();
  });
  clearBtn.addEventListener("click", clearAllPhotos);

  canvas.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("mouseleave", onPointerUp);
  canvas.addEventListener("wheel", onWheelZoom, { passive: false });

  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("is-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("is-over");
  });

  dropZone.addEventListener("drop", handleDropUpload);
}

async function handleFilePickerUpload(event) {
  clearStatus();
  const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
  event.target.value = "";

  if (!files.length) {
    setStatus("No se detectaron imágenes válidas.");
    return;
  }

  await addPhotosFromFiles(files);
}

async function handleDropUpload(event) {
  event.preventDefault();
  dropZone.classList.remove("is-over");
  clearStatus();

  const files = await extractDroppedImageFiles(event.dataTransfer);
  if (!files.length) {
    setStatus("No se detectaron imágenes válidas en el contenido arrastrado.");
    return;
  }

  await addPhotosFromFiles(files);
}

async function addPhotosFromFiles(files) {
  const availableSlots = MAX_PHOTOS - state.photos.length;
  if (availableSlots <= 0) {
    setStatus("Ya tienes 12 fotos cargadas. Reinicia para cargar otras.");
    return;
  }

  const acceptedFiles = files.slice(0, availableSlots);
  const skipped = files.length - acceptedFiles.length;

  try {
    const images = await Promise.all(acceptedFiles.map(readImageFile));
    const baseIndex = state.photos.length;
    const newPhotos = images.map((img, index) => ({
      img,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      id: baseIndex + index,
    }));

    state.photos = state.photos.concat(newPhotos);
    if (state.selectedIndex < 0 && state.photos.length > 0) {
      state.selectedIndex = 0;
    }

    computeLayout();
    render();

    if (state.photos.length < MIN_PHOTOS) {
      setStatus(`Faltan ${MIN_PHOTOS - state.photos.length} fotos para habilitar la composición.`);
    } else if (skipped > 0) {
      setStatus(`Se agregaron ${acceptedFiles.length} imágenes y se omitieron ${skipped} por límite de 12.`);
    } else {
      setStatus(`${state.photos.length} fotos cargadas.`);
    }
  } catch {
    setStatus("No se pudieron cargar una o más imágenes.");
  }
}

async function handleBackgroundUpload(event) {
  clearStatus();
  const file = event.target.files?.[0];
  if (!file) {
    state.backgroundImage = null;
    render();
    return;
  }

  try {
    state.backgroundImage = await readImageFile(file);
    render();
  } catch {
    state.backgroundImage = null;
    setStatus("No se pudo cargar la imagen de fondo.");
  }
}

function computeLayout() {
  const n = state.photos.length;
  if (n < MIN_PHOTOS) {
    state.layoutFrames = [];
    return;
  }

  if (n <= 5) {
    // Regla 3-5: una única fila con margen exterior de 10 px.
    const columns = n;
    const frameWidth = (CANVAS_WIDTH - EDGE_GAP * 2 - INNER_GAP * (columns - 1)) / columns;
    const frameHeight = CANVAS_HEIGHT - EDGE_GAP * 2;
    const startX = EDGE_GAP;
    const y = EDGE_GAP;

    state.layoutFrames = state.photos.map((_, i) => ({
      x: startX + i * (frameWidth + INNER_GAP),
      y,
      width: frameWidth,
      height: frameHeight,
    }));
  } else {
    // Regla 6-12: dos filas; si es impar, la fila inferior recibe más fotos.
    const topCount = Math.floor(n / 2);
    const bottomCount = n - topCount;
    const maxCols = Math.max(topCount, bottomCount);
    const frameWidth = (CANVAS_WIDTH - EDGE_GAP * 2 - INNER_GAP * (maxCols - 1)) / maxCols;
    const frameHeight = (CANVAS_HEIGHT - EDGE_GAP * 2 - INNER_GAP) / 2;
    const topY = EDGE_GAP;
    const bottomY = topY + frameHeight + INNER_GAP;
    const topStartX = (CANVAS_WIDTH - (topCount * frameWidth + (topCount - 1) * INNER_GAP)) / 2;
    const bottomStartX =
      (CANVAS_WIDTH - (bottomCount * frameWidth + (bottomCount - 1) * INNER_GAP)) / 2;

    state.layoutFrames = [];

    for (let i = 0; i < topCount; i += 1) {
      state.layoutFrames.push({
        x: topStartX + i * (frameWidth + INNER_GAP),
        y: topY,
        width: frameWidth,
        height: frameHeight,
      });
    }

    for (let i = 0; i < bottomCount; i += 1) {
      state.layoutFrames.push({
        x: bottomStartX + i * (frameWidth + INNER_GAP),
        y: bottomY,
        width: frameWidth,
        height: frameHeight,
      });
    }
  }

  for (let i = 0; i < state.photos.length; i += 1) {
    clampPhotoOffset(i);
  }
}

function render() {
  drawBackground();
  drawFramesAndPhotos();
  updateControls();
}

function drawBackground() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (!state.backgroundImage) {
    ctx.fillStyle = state.backgroundColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    return;
  }

  ctx.save();
  // Dibujamos con sangrado para evitar bordes vacíos al aplicar blur.
  ctx.filter = "blur(18px)";
  drawImageCover(state.backgroundImage, {
    x: -28,
    y: -28,
    width: CANVAS_WIDTH + 56,
    height: CANVAS_HEIGHT + 56,
  });
  ctx.restore();
}

function drawFramesAndPhotos() {
  state.layoutFrames.forEach((frame, index) => {
    const photo = state.photos[index];

    ctx.save();
    ctx.beginPath();
    ctx.rect(frame.x, frame.y, frame.width, frame.height);
    ctx.clip();

    if (photo) {
      const transform = getPhotoTransform(photo, frame);
      ctx.drawImage(
        photo.img,
        transform.drawX,
        transform.drawY,
        transform.drawWidth,
        transform.drawHeight,
      );
    } else {
      ctx.fillStyle = "#c9ccd2";
      ctx.fillRect(frame.x, frame.y, frame.width, frame.height);
    }

    ctx.restore();

    const isSelected = index === state.selectedIndex;
    ctx.strokeStyle = isSelected ? "#315b7c" : "rgba(30,30,30,0.18)";
    ctx.lineWidth = isSelected ? 3 : 1;
    ctx.strokeRect(frame.x + 0.5, frame.y + 0.5, frame.width - 1, frame.height - 1);
  });
}

function getPhotoTransform(photo, frame) {
  // Escala base tipo "cover" para llenar el marco y luego ajuste manual del usuario.
  const baseScale = Math.max(frame.width / photo.img.width, frame.height / photo.img.height);
  const totalScale = baseScale * photo.scale;
  const drawWidth = photo.img.width * totalScale;
  const drawHeight = photo.img.height * totalScale;

  const drawX = frame.x + (frame.width - drawWidth) / 2 + photo.offsetX;
  const drawY = frame.y + (frame.height - drawHeight) / 2 + photo.offsetY;

  return { drawX, drawY, drawWidth, drawHeight };
}

function clampPhotoOffset(index) {
  const photo = state.photos[index];
  const frame = state.layoutFrames[index];
  if (!photo || !frame) return;

  const baseScale = Math.max(frame.width / photo.img.width, frame.height / photo.img.height);
  const totalScale = baseScale * photo.scale;
  const drawWidth = photo.img.width * totalScale;
  const drawHeight = photo.img.height * totalScale;

  // Limita el arrastre para que no aparezcan huecos dentro del marco.
  const maxOffsetX = Math.max(0, (drawWidth - frame.width) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - frame.height) / 2);

  photo.offsetX = clamp(photo.offsetX, -maxOffsetX, maxOffsetX);
  photo.offsetY = clamp(photo.offsetY, -maxOffsetY, maxOffsetY);
}

function onPointerDown(event) {
  if (!state.layoutFrames.length) return;

  const { x, y } = getCanvasPoint(event);
  const index = findFrameAtPoint(x, y);
  if (index < 0) {
    state.selectedIndex = -1;
    updateControls();
    render();
    return;
  }

  state.selectedIndex = index;
  state.dragging = { index, startX: x, startY: y };
  canvas.classList.add("is-draggable", "is-dragging");
  updateControls();
  render();
}

function onPointerMove(event) {
  if (!state.dragging) {
    const { x, y } = getCanvasPoint(event);
    const hovered = findFrameAtPoint(x, y) >= 0;
    canvas.classList.toggle("is-draggable", hovered);
    return;
  }

  const { x, y } = getCanvasPoint(event);
  const photo = state.photos[state.dragging.index];
  if (!photo) return;

  const dx = x - state.dragging.startX;
  const dy = y - state.dragging.startY;
  photo.offsetX += dx;
  photo.offsetY += dy;

  state.dragging.startX = x;
  state.dragging.startY = y;

  clampPhotoOffset(state.dragging.index);
  render();
}

function onPointerUp() {
  state.dragging = null;
  canvas.classList.remove("is-dragging");
}

function onWheelZoom(event) {
  if (!state.layoutFrames.length) return;

  const { x, y } = getCanvasPoint(event);
  const index = findFrameAtPoint(x, y);
  if (index < 0) return;

  event.preventDefault();

  state.selectedIndex = index;
  const photo = state.photos[index];
  const delta = event.deltaY < 0 ? 0.03 : -0.03;
  photo.scale = clamp(photo.scale + delta, 1, 2.2);

  clampPhotoOffset(index);
  updateControls();
  render();
}

function findFrameAtPoint(x, y) {
  for (let i = state.layoutFrames.length - 1; i >= 0; i -= 1) {
    const frame = state.layoutFrames[i];
    const isInside =
      x >= frame.x &&
      x <= frame.x + frame.width &&
      y >= frame.y &&
      y <= frame.y + frame.height;

    if (isInside) return i;
  }
  return -1;
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function updateControls() {
  const hasPhotos = state.photos.length >= MIN_PHOTOS;
  downloadBtn.disabled = !hasPhotos;

  const hasSelection = state.selectedIndex >= 0 && state.selectedIndex < state.photos.length;
  zoomControl.disabled = !hasSelection;

  if (!hasSelection) {
    selectedInfo.textContent = "Selecciona una foto en la vista previa para ajustar su zoom.";
    return;
  }

  const photo = state.photos[state.selectedIndex];
  zoomControl.value = String(Math.round(photo.scale * 100));
  selectedInfo.textContent = `Foto ${state.selectedIndex + 1} seleccionada. Arrastra para reencuadrar.`;
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

function drawImageCover(image, rect) {
  const imageRatio = image.width / image.height;
  const rectRatio = rect.width / rect.height;

  let drawWidth;
  let drawHeight;

  if (imageRatio > rectRatio) {
    drawHeight = rect.height;
    drawWidth = drawHeight * imageRatio;
  } else {
    drawWidth = rect.width;
    drawHeight = drawWidth / imageRatio;
  }

  const drawX = rect.x + (rect.width - drawWidth) / 2;
  const drawY = rect.y + (rect.height - drawHeight) / 2;

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setStatus(message) {
  statusEl.textContent = message;
}

function clearStatus() {
  statusEl.textContent = "";
}

function clearAllPhotos() {
  state.photos = [];
  state.layoutFrames = [];
  state.selectedIndex = -1;
  state.dragging = null;
  photoInput.value = "";
  folderInput.value = "";
  setStatus("Se limpiaron todas las fotos.");
  render();
}

async function extractDroppedImageFiles(dataTransfer) {
  if (!dataTransfer) return [];

  const items = Array.from(dataTransfer.items || []);
  if (!items.length) {
    return Array.from(dataTransfer.files || []).filter((file) => file.type.startsWith("image/"));
  }

  const supportsEntries = typeof items[0].webkitGetAsEntry === "function";
  if (!supportsEntries) {
    return Array.from(dataTransfer.files || []).filter((file) => file.type.startsWith("image/"));
  }

  const files = [];
  const walkPromises = items.map((item) => {
    const entry = item.webkitGetAsEntry();
    if (!entry) return Promise.resolve();
    return walkEntry(entry, files);
  });

  await Promise.all(walkPromises);
  return files.filter((file) => file.type.startsWith("image/"));
}

function walkEntry(entry, outFiles) {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file(
        (file) => {
          outFiles.push(file);
          resolve();
        },
        () => resolve(),
      );
    });
  }

  if (entry.isDirectory) {
    return readAllDirectoryEntries(entry).then((entries) =>
      Promise.all(entries.map((childEntry) => walkEntry(childEntry, outFiles))).then(() => undefined),
    );
  }

  return Promise.resolve();
}

function readAllDirectoryEntries(directoryEntry) {
  const reader = directoryEntry.createReader();
  const entries = [];

  return new Promise((resolve) => {
    function readBatch() {
      reader.readEntries((batch) => {
        if (!batch.length) {
          resolve(entries);
          return;
        }
        entries.push(...batch);
        readBatch();
      });
    }

    readBatch();
  });
}
