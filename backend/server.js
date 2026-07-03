const express = require('express');
const cors = require('cors');
const { PORT, CORS_ORIGIN } = require('./config/env');
const eventsRouter = require('./routes/events');

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/events', eventsRouter);

// Admin API — disabled for the MVP launch. Mount it here once it exists:
// const adminRouter = require('./routes/admin');
// app.use('/api/admin', adminRouter);
// See the guide below for the full checklist.

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(PORT, () => {
  console.log(`📸 Photo Club API listening on http://localhost:${PORT}`);
});
