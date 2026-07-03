// ===========================================
// LIGHTBOX & SLIDESHOW LOGIC
// ===========================================
let lbCurrentIndex = 0;
let slideshowInterval = null;

const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lb-image');
const lbCounter = document.getElementById('lb-counter');
const lbDownload = document.getElementById('lb-download');
const lbTag = document.getElementById('lb-tag');
const slideshowIcon = document.getElementById('slideshow-icon');
const slideshowProgress = document.getElementById('slideshow-progress');

function openLightbox(index) {
  lbCurrentIndex = index;
  updateLightboxContent();
  lightbox.classList.remove('hidden-lb');
  lightbox.classList.add('visible-lb');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (slideshowInterval) toggleSlideshow(); // Stop slideshow
  lightbox.classList.remove('visible-lb');
  lightbox.classList.add('hidden-lb');
  document.body.style.overflow = '';
}

function updateLightboxContent() {
  const photo = filteredPhotos[lbCurrentIndex];
  lbImage.style.opacity = 0;

  setTimeout(() => {
    lbImage.src = photo.url;
    lbCounter.innerText = `${lbCurrentIndex + 1} / ${filteredPhotos.length}`;
    lbDownload.href = photo.downloadUrl;
    lbTag.innerText = photo.tag;
    lbTag.classList.remove('hidden');
    lbImage.style.opacity = 1;

    if (slideshowInterval) {
      slideshowProgress.style.transition = 'none';
      slideshowProgress.style.width = '0%';
      setTimeout(() => {
        slideshowProgress.style.transition = 'width 3s linear';
        slideshowProgress.style.width = '100%';
      }, 50);
    }
  }, 200);
}

function nextImage() {
  lbCurrentIndex = (lbCurrentIndex + 1) % filteredPhotos.length;
  updateLightboxContent();
}

function prevImage() {
  lbCurrentIndex = (lbCurrentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
  updateLightboxContent();
}

function toggleSlideshowDirect() {
  openLightbox(0);
  toggleSlideshow();
}

function toggleSlideshow() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
    slideshowIcon.setAttribute('data-lucide', 'play');
    slideshowProgress.style.width = '0%';
    slideshowProgress.style.transition = 'none';
  } else {
    slideshowIcon.setAttribute('data-lucide', 'pause');
    slideshowProgress.style.transition = 'width 3s linear';
    slideshowProgress.style.width = '100%';
    slideshowInterval = setInterval(() => {
      nextImage();
    }, 3000);
  }
  lucide.createIcons();
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('visible-lb')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === ' ') { e.preventDefault(); toggleSlideshow(); }
  }
});
