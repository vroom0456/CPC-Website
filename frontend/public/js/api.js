// Point this to your local Node.js backend
const API_BASE_URL = 'http://localhost:3000/api';

// Fetch all published events for the Homepage
async function apiGetEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
}

// Fetch photos for a specific event
async function apiGetEventPhotos(folderId) {
    try {
        // You can adjust this endpoint based on your eventsController.js routes
        const response = await fetch(`${API_BASE_URL}/events/photos/${folderId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Error fetching photos:", error);
        throw error;
    }
}

// Make functions globally available for main.js and render.js
window.apiGetEvents = apiGetEvents;
window.apiGetEventPhotos = apiGetEventPhotos;
