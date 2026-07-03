const express = require('express');
const cors = require('cors');
const { PORT, CORS_ORIGIN } = require('./config/env');
const eventsRouter = require('./routes/events');

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/events', eventsRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(PORT, () => {
  console.log(`📸 Photo Club API listening on http://localhost:${PORT}`);
});
