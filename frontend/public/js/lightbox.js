// ===========================================
// LIGHTBOX — fullscreen photo viewer
// Custom-built (no external library) so it works as a plain
// <script> tag with zero build step. Talks to the #lightbox markup
// already in index.html.
// ===========================================

let lbIndex = 0;
let slideshowInterval = null;
const SLIDESHOW_MS = 4000;

const lightboxEl = document.getElementById('lightbox');
const lbImage = document.getElementById('lb-image');
const lbCounter = document.getElementById('lb-counter');
const lbDownload = document.getElementById('lb-download');
const lbTag = document.getElementById('lb-tag');
const slideshowProgress = document.getElementById('slideshow-progress');
const slideshowIcon = document.getElementById('slideshow-icon');

function openLightbox(index) {
  lbIndex = index;
  lightboxEl.classList.remove('hidden-lb');
  lightboxEl.classList.add('visible-lb');
  document.body.style.overflow = 'hidden';
  updateLightboxImage();
}

function closeLightbox() {
  lightboxEl.classList.remove('visible-lb');
  lightboxEl.classList.add('hidden-lb');
  document.body.style.overflow = '';
  stopSlideshow();
}

function nextImage() {
  lbIndex = (lbIndex + 1) % filteredPhotos.length;
  updateLightboxImage();
}

function prevImage() {
  lbIndex = (lbIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  const photo = filteredPhotos[lbIndex];
  if (!photo) return;

  // Blur-up: dim the old frame briefly while the next image loads
  lbImage.style.opacity = '0';

  const preload = new Image();
  preload.onload = () => {
    lbImage.src = photo.url;
    lbImage.style.opacity = '1';
  };
  preload.src = photo.url;

  lbCounter.textContent = `${lbIndex + 1} / ${filteredPhotos.length}`;
  lbDownload.href = photo.downloadUrl || photo.url;

  // Tag / camera badge (camera info only shows once the backend
  // starts sending EXIF data — see the re-enable guide below)
  const badgeParts = [photo.tag, photo.cameraModel].filter(Boolean);
  if (badgeParts.length) {
    lbTag.textContent = badgeParts.join(' · ');
    lbTag.classList.remove('hidden');
  } else {
    lbTag.classList.add('hidden');
  }

  if (slideshowInterval) resetSlideshowProgress();
}

// --- Slideshow ---
function toggleSlideshow() {
  if (slideshowInterval) stopSlideshow();
  else startSlideshow();
}

function toggleSlideshowDirect() {
  if (!lightboxEl.classList.contains('visible-lb')) openLightbox(0);
  if (!slideshowInterval) startSlideshow();
}

function startSlideshow() {
  slideshowIcon.setAttribute('data-lucide', 'pause');
  lucide.createIcons();
  resetSlideshowProgress();
  slideshowInterval = setInterval(nextImage, SLIDESHOW_MS);
}

function stopSlideshow() {
  clearInterval(slideshowInterval);
  slideshowInterval = null;
  slideshowProgress.style.width = '0%';
  slideshowIcon.setAttribute('data-lucide', 'play');
  lucide.createIcons();
}

function resetSlideshowProgress() {
  slideshowProgress.style.transition = 'none';
  slideshowProgress.style.width = '0%';
  // Force reflow so the transition below actually restarts
  void slideshowProgress.offsetWidth;
  slideshowProgress.style.transition = `width ${SLIDESHOW_MS}ms linear`;
  slideshowProgress.style.width = '100%';
}

// --- Copy image link ---
function copyImageLink() {
  const photo = filteredPhotos[lbIndex];
  if (!photo) return;
  navigator.clipboard.writeText(photo.url)
    .then(() => showToast('Image link copied to clipboard'))
    .catch(() => showToast('Could not copy link'));
}

// --- Fullscreen toggle ---
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    lightboxEl.requestFullscreen?.().catch(() => showToast('Fullscreen not supported'));
  } else {
    document.exitFullscreen?.();
  }
}

// --- Keyboard shortcuts ---
document.addEventListener('keydown', (e) => {
  if (lightboxEl.classList.contains('hidden-lb')) return;
  if (e.key === 'ArrowRight') nextImage();
  else if (e.key === 'ArrowLeft') prevImage();
  else if (e.key === 'Escape') closeLightbox();
});
