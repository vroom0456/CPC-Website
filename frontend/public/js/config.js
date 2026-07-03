// ===========================================
// FRONTEND CONFIGURATION
// Single source of truth for the API base URL and feature flags.
// Every other script reads from window.CONFIG — don't hardcode
// URLs anywhere else.
// ===========================================
const CONFIG = {
  API_BASE_URL: 'http://localhost:4000/api',

  // --- Feature flags ---
  // Flip these to `true` once the corresponding backend/AI work lands.
  // See the re-enable guide below.
  FEATURES: {
    ADMIN_ENABLED: false,   // Admin dashboard + write APIs
    AI_ENABLED: false       // Smart Albums / Face Search / Auto Tags / Best Photos
  }
};

window.CONFIG = CONFIG;
