// ===========================================
// API CLIENT — talks to our own backend, never to Google directly.
// ===========================================

async function apiGetEvents() {
  const res = await fetch(`${CONFIG.API_BASE_URL}/events`);
  if (!res.ok) throw new Error(`Failed to fetch events (${res.status})`);
  const data = await res.json();
  return data.events;
}

async function apiGetEventPhotos(eventId) {
  const res = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}/photos`);
  if (!res.ok) throw new Error(`Failed to fetch photos (${res.status})`);
  return res.json(); // { event, photos }
}
