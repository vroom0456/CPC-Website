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
