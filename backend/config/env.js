require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  GOOGLE_DRIVE_API_KEY: process.env.GOOGLE_DRIVE_API_KEY || '',
  CORS_ORIGIN: (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim())
};
