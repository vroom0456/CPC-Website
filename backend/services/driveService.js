const { GOOGLE_DRIVE_API_KEY } = require('../config/env');

function buildImageUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1500`;
}

function buildQueryUrl(folderId, pageSize) {
  const q = `'${folderId}' in parents and mimeType contains 'image/'`;
  return `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webContentLink)&pageSize=${pageSize}&key=${GOOGLE_DRIVE_API_KEY}`;
}

/**
 * Fetch raw file listing for a Drive folder.
 * @param {string} folderId
 * @param {number} pageSize
 * @returns {Promise<Array<{id:string, name:string, webContentLink?:string}>>}
 */
async function fetchFolderFiles(folderId, pageSize = 100) {
  if (!GOOGLE_DRIVE_API_KEY) {
    throw new Error('GOOGLE_DRIVE_API_KEY is not configured on the server.');
  }
  const res = await fetch(buildQueryUrl(folderId, pageSize));
  if (!res.ok) {
    throw new Error(`Google Drive API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.files || [];
}

module.exports = { buildImageUrl, fetchFolderFiles };
