// ===========================================
// API LAYER — talks to the Express/SQLite backend.
// All URLs come from CONFIG (js/config.js), loaded before this file.
// ===========================================

// Fetch all published events for the Homepage
async function apiGetEvents() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/events`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    // Backend returns { events: [...] } — normalize to a plain array here
    // so every other file can just do `allEvents.forEach(...)`.
    return data.events || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

// Fetch photos for a specific event
// Matches backend route: GET /api/events/:id/photos
async function apiGetEventPhotos(eventId) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}/photos`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json(); // { event, photos }
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
}

// Make functions globally available for main.js and render.js
window.apiGetEvents = apiGetEvents;
window.apiGetEventPhotos = apiGetEventPhotos;
