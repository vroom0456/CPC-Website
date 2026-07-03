
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

  // --- NEW: Event Share Button Logic ---
  // Using event delegation since the share button is dynamically injected into the DOM
  document.addEventListener('click', (e) => {
    const shareEventBtn = e.target.closest('#btn-share-event');
    
    if (shareEventBtn) {
        if (navigator.share) {
            navigator.share({
                title: document.getElementById('nav-title')?.innerText || 'College Photography Club',
                text: 'Check out the full event gallery from the College Photography Club!',
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback for browsers (like desktop) that don't support the native share menu
            navigator.clipboard.writeText(window.location.href);
            alert('Gallery link copied to clipboard!');
        }
    }
  });

  await loadPortfolios();
}

async function loadPortfolios() {
  renderLoading('Fetching Collections...');
  try {
    allEvents = await apiGetEvents();
    transitionView(() => renderHome());
  } catch (error) {
    renderErrorState('Network Error', 'Failed to connect to the API server. Make sure the backend is running.');
  }
}

init();
