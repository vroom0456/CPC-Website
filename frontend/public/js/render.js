// ===========================================
// RENDERING — builds the HTML for each view
// ===========================================

let allEvents = [];             // Events loaded from the backend
let activeEvent = null;
let currentGalleryPhotos = [];  // All photos for the open event
let filteredPhotos = [];        // Photos currently displayed (tag-filtered)

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

function renderErrorState(title, message) {
  appContainer.innerHTML = `
    <div class="flex-grow flex flex-col items-center justify-center w-full mt-32 text-center px-4">
      <i data-lucide="alert-triangle" class="h-12 w-12 mx-auto mb-6 text-accent"></i>
      <h2 class="text-2xl font-display mb-4">${title}</h2>
      <p class="text-muted leading-relaxed max-w-md mx-auto">${message}</p>
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

  let html = `
    <div class="w-full px-4 md:px-8 py-24 max-w-7xl mx-auto flex flex-col">

      <div class="text-center mb-16 md:mb-24 mt-8">
        <h1 class="text-3xl md:text-5xl font-display font-bold mb-4">Event Portfolios</h1>
        <p class="text-[10px] md:text-xs uppercase tracking-widest text-muted">College Photography Club</p>
      </div>

      ${filteredEvents.length === 0 ? `<p class="text-center text-muted w-full">No events found matching "${searchQuery}"</p>` : ''}

      <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
  `;

  filteredEvents.forEach((event) => {
    html += `
        <div onclick="openEvent('${event.id}')" class="group cursor-pointer flex flex-col bg-lightSurface dark:bg-darkSurface rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-white/5">
          <div class="w-full aspect-[4/3] overflow-hidden relative">
            ${event.coverUrl ? `<img src="${event.coverUrl}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105">` : `<div class="flex items-center justify-center h-full text-xs text-muted uppercase tracking-widest">Empty</div>`}
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
  });

  html += `</div></div>`;
  appContainer.innerHTML = html;
}

// --- RENDER EVENT GALLERY ---
async function openEvent(eventId) {
  const event = allEvents.find(e => e.id === eventId);
  if (!event) return;

  activeEvent = event;
  searchContainer.classList.add('hidden');

  transitionView(() => renderLoading('Fetching High-Res Photos...'));

  try {
    const { photos } = await apiGetEventPhotos(eventId);

    if (!photos || photos.length === 0) {
      transitionView(() => renderErrorState('Folder is Empty', 'No images found in this Google Drive folder.'));
      return;
    }

    currentGalleryPhotos = photos;
    filteredPhotos = [...currentGalleryPhotos];
    transitionView(() => renderGallery(event));
  } catch (error) {
    transitionView(() => renderErrorState('Error Loading Gallery', 'Failed to retrieve images.'));
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
        <h1 class="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight mb-6">${event.title}</h1>
        <div class="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
          <i data-lucide="camera" class="h-4 w-4"></i>
          <span class="text-sm tracking-wide">Covered by: <strong>${event.photographer}</strong></span>
        </div>

        <div class="flex flex-wrap gap-4 mt-8 justify-center">
          <a href="${folderUrl}" target="_blank" class="flex items-center px-6 py-3 bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors rounded">
            <i data-lucide="folder-down" class="h-4 w-4 mr-2"></i> Drive Folder
          </a>
          <button onclick="toggleSlideshowDirect()" class="flex items-center px-6 py-3 bg-accent text-white text-xs uppercase tracking-widest font-bold hover:bg-yellow-600 transition-colors rounded">
            <i data-lucide="play" class="h-4 w-4 mr-2"></i> Play Slideshow
          </button>
        </div>
      </div>
    </section>

    <!-- Tag Filters -->
    <section class="w-full max-w-[1600px] mx-auto px-4 py-8 border-b border-gray-200 dark:border-white/10 flex flex-wrap gap-3 justify-center">
      <button onclick="filterGallery('All')" class="px-5 py-2 rounded-full text-xs uppercase tracking-widest font-bold border transition-colors ${activeTag === 'All' ? 'bg-lightText text-white dark:bg-white dark:text-black border-transparent' : 'border-gray-300 dark:border-gray-700 hover:border-accent'}">All Photos (${currentGalleryPhotos.length})</button>
  `;

  event.tags.forEach(tag => {
    const count = currentGalleryPhotos.filter(p => p.tag === tag).length;
    html += `<button onclick="filterGallery('${tag}')" class="px-5 py-2 rounded-full text-xs uppercase tracking-widest font-bold border transition-colors ${activeTag === tag ? 'bg-lightText text-white dark:bg-white dark:text-black border-transparent' : 'border-gray-300 dark:border-gray-700 hover:border-accent'}">${tag} (${count})</button>`;
  });

  html += `
    </section>

    <!-- Masonry Grid -->
    <section class="w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-8 md:py-12">
      <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 masonry-grid">
  `;

  filteredPhotos.forEach((photo, index) => {
    html += `
        <div onclick="openLightbox(${index})" class="masonry-item relative cursor-pointer group bg-lightSurface dark:bg-darkSurface rounded overflow-hidden">
          <img src="${photo.url}" class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy">

          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div class="flex justify-between items-center text-white">
              <span class="text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2 py-1 rounded">${photo.tag}</span>
              <i data-lucide="maximize-2" class="h-4 w-4"></i>
            </div>
          </div>
        </div>
    `;
  });

  html += `
      </div>
    </section>
  `;
  appContainer.innerHTML = html;
  lucide.createIcons();
}

function filterGallery(tag) {
  if (tag === 'All') filteredPhotos = [...currentGalleryPhotos];
  else filteredPhotos = currentGalleryPhotos.filter(p => p.tag === tag);

  renderGallery(activeEvent, tag);
}

function goHome() {
  if (slideshowInterval) toggleSlideshow(); // Stop slideshow if running
  transitionView(() => renderHome());
}
