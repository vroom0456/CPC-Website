// ===========================================
// APP BOOTSTRAP
// ===========================================
const scrollTopBtn = document.getElementById('scroll-top');

async function init() {
  updateThemeIcon();

  searchInput.addEventListener('input', (e) => {
    if (!activeEvent) renderHome(e.target.value);
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) scrollTopBtn.classList.remove('opacity-0', 'pointer-events-none');
    else scrollTopBtn.classList.add('opacity-0', 'pointer-events-none');
  });

  // Share Event button — event delegation since it's injected dynamically
  // inside the gallery hero (see render.js -> renderGallery).
  document.addEventListener('click', (e) => {
    const shareEventBtn = e.target.closest('#btn-share-event');
    if (!shareEventBtn) return;

    if (navigator.share) {
      navigator.share({
        title: document.getElementById('nav-title')?.innerText || 'College Photography Club',
        text: 'Check out the full event gallery from the College Photography Club!',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Gallery link copied to clipboard');
    }
  });

  // Back/forward browser navigation between home <-> event galleries
  window.addEventListener('popstate', () => {
    const eventId = new URLSearchParams(window.location.search).get('event');
    if (eventId && allEvents.some(e => e.id === eventId)) {
      openEvent(eventId, false);
    } else {
      transitionView(() => renderHome());
    }
  });

  await loadPortfolios();
}

async function loadPortfolios() {
  renderHomeSkeleton();
  try {
    allEvents = await apiGetEvents();

    // Deep link support: /?event=event-1 opens straight into that gallery
    const eventId = new URLSearchParams(window.location.search).get('event');
    if (eventId && allEvents.some(e => e.id === eventId)) {
      openEvent(eventId, false); // manages its own loading/transition states
    } else {
      transitionView(() => renderHome());
    }
  } catch (error) {
    renderErrorState('Network Error', 'Failed to connect to the API server. Make sure the backend is running.', 'wifi-off');
  }
}

// --- Lightweight toast notifications (replaces alert() popups) ---
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-lightText dark:bg-white text-white dark:text-black text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-full shadow-lg opacity-0 pointer-events-none transition-opacity duration-300';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('opacity-0');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add('opacity-0'), 2500);
}
window.showToast = showToast;

init();
