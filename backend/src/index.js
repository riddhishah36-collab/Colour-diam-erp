import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './routes.js';
import { load } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '2mb' }));

app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  }
  next();
});

app.get('/api/health', (_req, res) => {
  const data = load();
  res.json({
    ok: true,
    name: 'ColourDiam ERP API',
    modules: Object.keys(data).filter((k) => k !== 'meta').length,
    time: new Date().toISOString(),
  });
});

app.use('/api', routes);

if (fs.existsSync(path.join(DIST, 'index.html'))) {
  app.use(express.static(DIST));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'));
  });
  console.log(`Serving production frontend from ${DIST}`);
} else {
  app.get('/', (_req, res) => {
    res
      .type('text/plain')
      .send('ColourDiam ERP API is running. Build the frontend with: npm run build');
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[api] error:', err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

app.listen(PORT, () => {
  const data = load();
  console.log(`ColourDiam ERP API listening on http://localhost:${PORT}`);
  const modules = Object.keys(data).filter((k) => k !== 'meta');
  console.log(`Seeded modules (${modules.length}): ${modules.join(', ')}`);
});
