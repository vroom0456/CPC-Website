// ===========================================
// RENDERING — builds the HTML for each view
// ===========================================

let allEvents = [];             // Events loaded from the backend
let activeEvent = null;
let currentGalleryPhotos = [];  // All photos for the open event
let filteredPhotos = [];        // Photos currently displayed (tag + search filtered)
let gallerySearchQuery = '';    // "Search inside gallery" text
let selectMode = false;         // Bulk-select / download-selected toggle
let selectedPhotoIndices = new Set();

const appContainer = document.getElementById('app-container');
const searchInput = document.getElementById('search-input');
const searchContainer = document.getElementById('search-container');

function transitionView(renderCallback) {
  appContainer.classList.remove('fade-enter-active');
  appContainer.classList.add('fade-enter');
  setTimeout(() => {
    renderCallback();
    lucide.createIcons();
    appContainer.classList.remove('fade-enter');
    appContainer.classList.add('fade-enter-active');
    window.scrollTo(0, 0);
  }, 400);
}

function renderLoading(text) {
  appContainer.innerHTML = `
    <div class="flex-grow flex flex-col items-center justify-center w-full mt-32">
      <i data-lucide="loader-2" class="h-8 w-8 mx-auto mb-4 animate-spin text-accent"></i>
      <p class="text-xs uppercase tracking-widest text-muted">${text}</p>
    </div>
  `;
  lucide.createIcons();
}

// Skeleton grid shown while the homepage's event list is loading —
// feels faster than a bare spinner on slow connections.
function renderHomeSkeleton() {
  let cards = '';
  for (let i = 0; i < 6; i++) {
    cards += `
      <div class="rounded-xl overflow-hidden bg-lightSurface dark:bg-darkSurface border border-gray-100 dark:border-white/5">
        <div class="w-full aspect-[4/3] skeleton"></div>
        <div class="p-6 md:p-8 space-y-3">
          <div class="h-2 w-20 skeleton rounded"></div>
          <div class="h-5 w-3/4 skeleton rounded"></div>
          <div class="h-2 w-1/2 skeleton rounded"></div>
        </div>
      </div>
    `;
  }
  appContainer.innerHTML = `
    <div class="w-full px-4 md:px-8 py-24 max-w-7xl mx-auto">
      <div class="text-center mb-16 md:mb-24 mt-8">
        <div class="h-10 w-64 skeleton rounded mx-auto mb-4"></div>
        <div class="h-2 w-48 skeleton rounded mx-auto"></div>
      </div>
      <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">${cards}</div>
    </div>
  `;
}

function renderErrorState(title, message, icon = 'alert-triangle') {
  appContainer.innerHTML = `
    <div class="flex-grow flex flex-col items-center justify-center w-full mt-32 text-center px-4">
      <i data-lucide="${icon}" class="h-12 w-12 mx-auto mb-6 text-accent"></i>
      <h2 class="text-2xl font-display mb-4">${title}</h2>
      <p class="text-muted leading-relaxed max-w-md mx-auto">${message}</p>
      <button onclick="goHome()" class="mt-8 px-6 py-3 bg-lightText dark:bg-white text-white dark:text-black text-xs uppercase tracking-widest font-bold rounded hover:opacity-80 transition-opacity">
        Back to Home
      </button>
    </div>
  `;
  lucide.createIcons();
}

// --- RENDER HOME ---
function renderHome(searchQuery = '') {
  activeEvent = null;
  searchContainer.classList.remove('hidden');

  const filteredEvents = allEvents.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.photographer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Featured hero: a random event's cover photo, changes on every home visit
  const withCover = allEvents.filter(e => e.coverUrl);
  const featured = withCover.length ? withCover[Math.floor(Math.random() * withCover.length)] : null;

  // Recent galleries: most recently added, first 3
  const recent = [...allEvents]
    .sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date))
    .slice(0, 3);

  // Group remaining events by year for the "Instead of only cards" browse view
  const groupedByYear = {};
  filteredEvents.forEach(e => {
    const year = extractYear(e.date);
    if (!groupedByYear[year]) groupedByYear[year] = [];
    groupedByYear[year].push(e);
  });
  const years = Object.keys(groupedByYear).sort((a, b) => b - a);

  let html = `
    ${featured ? `
    <section class="relative w-full h-[50vh] md:h-[65vh] overflow-hidden flex items-end">
      <img src="${featured.coverUrl}" class="absolute inset-0 w-full h-full object-cover hero-zoom">
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div class="relative z-10 px-4 md:px-8 pb-12 max-w-7xl mx-auto w-full text-white hero-fade-text">
        <p class="text-[10px] uppercase tracking-[0.3em] text-accent font-bold mb-3">Featured Gallery</p>
        <h2 class="text-3xl md:text-5xl font-display font-bold mb-4">${featured.title}</h2>
        <button onclick="openEvent('${featured.id}')" class="px-6 py-3 bg-white text-black text-xs uppercase tracking-widest font-bold rounded hover:bg-gray-200 transition-colors">
          View Gallery
        </button>
      </div>
    </section>` : ''}

    <div class="w-full px-4 md:px-8 py-16 md:py-24 max-w-7xl mx-auto flex flex-col">

      <div class="text-center mb-16 md:mb-20 mt-8">
        <h1 class="text-3xl md:text-5xl font-display font-bold mb-4">Event Portfolios</h1>
        <p class="text-[10px] md:text-xs uppercase tracking-widest text-muted">College Photography Club</p>
      </div>

      ${filteredEvents.length === 0 ? `
        <div class="text-center py-16">
          <i data-lucide="image-off" class="h-12 w-12 mx-auto mb-4 text-muted"></i>
          <p class="text-muted">No events found matching "${searchQuery}"</p>
        </div>
      ` : ''}

      ${!searchQuery && recent.length ? `
      <div class="mb-16">
        <h3 class="text-xs uppercase tracking-widest font-bold text-muted mb-6 flex items-center gap-2">
          <i data-lucide="clock" class="h-3 w-3"></i> Recent Galleries
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${recent.map(e => eventCardHtml(e)).join('')}
        </div>
      </div>` : ''}

      ${years.map(year => `
        <div class="mb-16">
          ${!searchQuery ? `<h3 class="text-xs uppercase tracking-widest font-bold text-muted mb-6">${year}</h3>` : ''}
          <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            ${groupedByYear[year].map(e => eventCardHtml(e)).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  appContainer.innerHTML = html;
}

function eventCardHtml(event) {
  return `
    <div onclick="openEvent('${event.id}')" class="group cursor-pointer flex flex-col bg-lightSurface dark:bg-darkSurface rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-white/5">
      <div class="w-full aspect-[4/3] overflow-hidden relative">
        ${event.coverUrl
          ? `<img src="${event.coverUrl}" loading="lazy" class="img-blur-up absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" onload="this.classList.add('img-loaded')">`
          : `<div class="flex items-center justify-center h-full text-xs text-muted uppercase tracking-widest">Empty</div>`}
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
        <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
          ${event.tags[0] || 'Gallery'}
        </div>
      </div>
      <div class="p-6 md:p-8">
        <p class="text-[10px] uppercase tracking-[0.2em] text-accent mb-2 font-bold">${event.date}</p>
        <h3 class="text-xl md:text-2xl font-display font-bold mb-4 line-clamp-1">${event.title}</h3>
        <div class="flex items-center text-xs text-muted">
          <i data-lucide="camera" class="h-3 w-3 mr-2"></i>
          <span>Covered by: <strong class="text-lightText dark:text-darkText font-semibold">${event.photographer}</strong></span>
        </div>
      </div>
    </div>
  `;
}

function extractYear(dateStr) {
  const match = String(dateStr).match(/\d{4}/);
  return match ? match[0] : 'Other';
}

function parseEventDate(dateStr) {
  const t = Date.parse(dateStr);
  return isNaN(t) ? 0 : t;
}

// --- RENDER EVENT GALLERY ---
async function openEvent(eventId, pushState = true) {
  const event = allEvents.find(e => e.id === eventId);
  if (!event) return;

  activeEvent = event;
  gallerySearchQuery = '';
  selectMode = false;
  selectedPhotoIndices.clear();
  searchContainer.classList.add('hidden');

  if (pushState) {
    history.pushState({ eventId }, '', `?event=${encodeURIComponent(eventId)}`);
  }
  document.title = `${event.title} — Photo Club`;

  transitionView(() => renderLoading('Fetching High-Res Photos...'));

  try {
    const { photos } = await apiGetEventPhotos(eventId);

    if (!photos || photos.length === 0) {
      transitionView(() => renderErrorState('Folder is Empty', 'No images found in this Google Drive folder.', 'image-off'));
      return;
    }

    currentGalleryPhotos = photos;
    filteredPhotos = [...currentGalleryPhotos];
    transitionView(() => renderGallery(event));
  } catch (error) {
    transitionView(() => renderErrorState('Error Loading Gallery', 'Failed to retrieve images.', 'wifi-off'));
  }
}

function renderGallery(event, activeTag = 'All') {
  const folderUrl = `https://drive.google.com/drive/folders/${event.folderId}`;
  const coverImage = currentGalleryPhotos[0].url;

  let html = `
    <!-- Full Viewport Hero -->
    <section class="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center overflow-hidden bg-black mt-16 md:mt-0">
      <img src="${coverImage}" class="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.4] scale-105 blur-sm">
      <div class="relative z-10 text-center flex flex-col items-center text-white px-4 w-full max-w-4xl">
        <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] mb-4 text-accent font-bold">${event.date}</p>
        <h1 id="nav-title" class="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight mb-6">${event.title}</h1>
        <div class="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
          <i data-lucide="camera" class="h-4 w-4"></i>
          <span class="text-sm tracking-wide">Covered by: <strong>${event.photographer}</strong></span>
        </div>

        <div class="flex flex-wrap gap-3 mt-8 justify-center">
          <a href="${folderUrl}" target="_blank" class="flex items-center px-5 py-3 bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors rounded">
            <i data-lucide="folder-down" class="h-4 w-4 mr-2"></i> Drive Folder
          </a>
          <button onclick="toggleSlideshowDirect()" class="flex items-center px-5 py-3 bg-accent text-white text-xs uppercase tracking-widest font-bold hover:bg-yellow-600 transition-colors rounded">
            <i data-lucide="play" class="h-4 w-4 mr-2"></i> Slideshow
          </button>
          <button id="btn-share-event" class="flex items-center px-5 py-3 bg-white/10 border border-white/20 text-white text-xs uppercase tracking-widest font-bold hover:bg-white/20 transition-colors rounded">
            <i data-lucide="share-2" class="h-4 w-4 mr-2"></i> Share
          </button>
          <button onclick="copyGalleryLink()" class="flex items-center px-5 py-3 bg-white/10 border border-white/20 text-white text-xs uppercase tracking-widest font-bold hover:bg-white/20 transition-colors rounded">
            <i data-lucide="link" class="h-4 w-4 mr-2"></i> Copy Link
          </button>
          <button onclick="openQrModal()" class="flex items-center px-5 py-3 bg-white/10 border border-white/20 text-white text-xs uppercase tracking-widest font-bold hover:bg-white/20 transition-colors rounded">
            <i data-lucide="qr-code" class="h-4 w-4 mr-2"></i> QR Code
          </button>
        </div>
      </div>
    </section>

    <!-- AI Tools — placeholders only, wired up once AI_ENABLED is flipped on -->
    ${renderAiToolsPanel()}

    <!-- Search inside gallery + Tag Filters -->
    <section class="w-full max-w-[1600px] mx-auto px-4 py-8 border-b border-gray-200 dark:border-white/10">
      <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div class="relative flex-grow max-w-sm">
          <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"></i>
          <input type="text" id="gallery-search-input" value="${gallerySearchQuery}" placeholder="Search inside this gallery..."
            class="w-full bg-lightSurface dark:bg-darkSurface text-xs pl-9 pr-4 py-2.5 rounded-full outline-none focus:ring-1 focus:ring-accent">
        </div>
        <button onclick="toggleSelectMode()" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold border transition-colors ${selectMode ? 'bg-accent text-white border-accent' : 'border-gray-300 dark:border-gray-700 hover:border-accent'}">
          <i data-lucide="check-square" class="h-3.5 w-3.5"></i> ${selectMode ? 'Cancel Select' : 'Select Photos'}
        </button>
      </div>

      <div class="flex flex-wrap gap-3 justify-center">
        <button onclick="filterGallery('All')" class="px-5 py-2 rounded-full text-xs uppercase tracking-widest font-bold border transition-colors ${activeTag === 'All' ? 'bg-lightText text-white dark:bg-white dark:text-black border-transparent' : 'border-gray-300 dark:border-gray-700 hover:border-accent'}">All Photos (${currentGalleryPhotos.length})</button>
  `;

  event.tags.forEach(tag => {
    const count = currentGalleryPhotos.filter(p => p.tag === tag).length;
    html += `<button onclick="filterGallery('${tag}')" class="px-5 py-2 rounded-full text-xs uppercase tracking-widest font-bold border transition-colors ${activeTag === tag ? 'bg-lightText text-white dark:bg-white dark:text-black border-transparent' : 'border-gray-300 dark:border-gray-700 hover:border-accent'}">${tag} (${count})</button>`;
  });

  html += `
      </div>
    </section>

    <!-- Masonry Grid -->
    <section class="w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-8 md:py-12">
      ${filteredPhotos.length === 0 ? `
        <div class="text-center py-16">
          <i data-lucide="search-x" class="h-12 w-12 mx-auto mb-4 text-muted"></i>
          <p class="text-muted">No photos match "${gallerySearchQuery}"</p>
        </div>
      ` : `
      <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 masonry-grid">
  `}
  `;

  filteredPhotos.forEach((photo, index) => {
    const isSelected = selectedPhotoIndices.has(index);
    html += `
        <div class="masonry-item relative cursor-pointer group bg-lightSurface dark:bg-darkSurface rounded overflow-hidden" onclick="${selectMode ? `togglePhotoSelection(${index})` : `openLightbox(${index})`}">
          <img src="${photo.url}" class="img-blur-up w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" onload="this.classList.add('img-loaded')">

          ${selectMode ? `
            <div class="absolute top-3 left-3 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-accent border-accent' : 'bg-black/30 border-white/70'}">
              ${isSelected ? '<i data-lucide="check" class="h-4 w-4 text-white"></i>' : ''}
            </div>
            <div class="absolute inset-0 ${isSelected ? 'ring-4 ring-inset ring-accent' : ''}"></div>
          ` : `
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div class="flex justify-between items-center text-white">
                <span class="text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2 py-1 rounded">${photo.tag}</span>
                <i data-lucide="maximize-2" class="h-4 w-4"></i>
              </div>
            </div>
          `}
        </div>
    `;
  });

  html += filteredPhotos.length === 0 ? '' : `</div>`;
  html += `</section>`;

  // Sticky bulk-download bar (only in select mode)
  if (selectMode) {
    html += `
      <div class="fixed bottom-0 left-0 w-full z-30 bg-lightBg/95 dark:bg-darkBg/95 backdrop-blur-md border-t border-gray-200 dark:border-white/10 px-4 py-4 flex items-center justify-between">
        <span class="text-xs uppercase tracking-widest font-bold">${selectedPhotoIndices.size} selected</span>
        <button onclick="downloadSelectedPhotos()" ${selectedPhotoIndices.size === 0 ? 'disabled' : ''} class="flex items-center px-6 py-3 bg-accent text-white text-xs uppercase tracking-widest font-bold rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-600 transition-colors">
          <i data-lucide="download" class="h-4 w-4 mr-2"></i> Download Selected
        </button>
      </div>
    `;
  }

  appContainer.innerHTML = html;
  lucide.createIcons();

  // Wire up the search-inside-gallery input (re-rendered each time, so re-attach each time)
  const gsInput = document.getElementById('gallery-search-input');
  if (gsInput) {
    gsInput.addEventListener('input', (e) => searchInsideGallery(e.target.value));
    // Re-render happens on every keystroke, so restore focus/cursor —
    // but only once the user has actually started typing, otherwise the
    // gallery would steal focus the moment it opens.
    if (gallerySearchQuery) {
      gsInput.focus();
      gsInput.setSelectionRange(gsInput.value.length, gsInput.value.length);
    }
  }
}

// AI tools panel — visual placeholders only. Wire these up to real
// endpoints once CONFIG.FEATURES.AI_ENABLED is true.
function renderAiToolsPanel() {
  const tools = [
    { icon: 'search', label: 'Find My Photos' },
    { icon: 'tags', label: 'Auto Tags' },
    { icon: 'sparkles', label: 'Best Photos' },
    { icon: 'scan-face', label: 'Face Search' }
  ];
  return `
    <section class="w-full max-w-[1600px] mx-auto px-4 pt-8 flex flex-wrap gap-3 justify-center opacity-70">
      ${tools.map(t => `
        <button disabled title="Coming soon" class="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border border-dashed border-gray-300 dark:border-gray-700 cursor-not-allowed">
          <i data-lucide="${t.icon}" class="h-3.5 w-3.5"></i> ${t.label}
          <span class="text-accent">· Coming Soon</span>
        </button>
      `).join('')}
    </section>
  `;
}

function filterGallery(tag) {
  applyGalleryFilters(tag, gallerySearchQuery);
  renderGallery(activeEvent, tag);
}

function searchInsideGallery(query) {
  gallerySearchQuery = query;
  applyGalleryFilters(currentActiveTag, gallerySearchQuery);
  renderGallery(activeEvent, currentActiveTag);
}

// Tracks whichever tag button is currently active so search + tag
// filters can be combined without needing extra parameters everywhere.
let currentActiveTag = 'All';

function applyGalleryFilters(tag, query) {
  currentActiveTag = tag;
  let photos = tag === 'All' ? currentGalleryPhotos : currentGalleryPhotos.filter(p => p.tag === tag);
  if (query) {
    const q = query.toLowerCase();
    photos = photos.filter(p => (p.name || '').toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q));
  }
  filteredPhotos = photos;
  selectedPhotoIndices.clear();
}

// --- Select / Download Selected ---
function toggleSelectMode() {
  selectMode = !selectMode;
  selectedPhotoIndices.clear();
  renderGallery(activeEvent, currentActiveTag);
}

function togglePhotoSelection(index) {
  if (selectedPhotoIndices.has(index)) selectedPhotoIndices.delete(index);
  else selectedPhotoIndices.add(index);
  renderGallery(activeEvent, currentActiveTag);
}

function downloadSelectedPhotos() {
  if (selectedPhotoIndices.size === 0) return;
  // Note: true one-click ZIP downloads need a server endpoint that streams
  // the files together (kept out of the MVP — see the "Bulk ZIP download"
  // step in the re-enable guide below). For now each selected photo opens
  // its direct download link with a short stagger so browsers don't block it.
  let delay = 0;
  selectedPhotoIndices.forEach((index) => {
    const photo = filteredPhotos[index];
    if (!photo) return;
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = photo.downloadUrl || photo.url;
      a.download = photo.name || '';
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, delay);
    delay += 300;
  });
  showToast(`Downloading ${selectedPhotoIndices.size} photo(s)...`);
}

// --- Copy Gallery Link / QR ---
function copyGalleryLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => showToast('Gallery link copied to clipboard'))
    .catch(() => showToast('Could not copy link'));
}

function openQrModal() {
  const modal = document.getElementById('qr-modal');
  const canvas = document.getElementById('qr-canvas');
  modal.classList.remove('hidden');
  if (window.QRCode) {
    QRCode.toCanvas(canvas, window.location.href, { width: 220, margin: 2 }, (err) => {
      if (err) console.error(err);
    });
  }
}

function closeQrModal() {
  document.getElementById('qr-modal').classList.add('hidden');
}

function goHome() {
  if (slideshowInterval) toggleSlideshow(); // Stop slideshow if running
  history.pushState({}, '', window.location.pathname);
  document.title = 'Premium College Photography Gallery';
  transitionView(() => renderHome());
}
