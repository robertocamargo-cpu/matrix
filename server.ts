/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import app from './src/serverApp';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = process.env.PORT || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite dev middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving production static files from: /dist");
  }

  app.listen(PORT, () => {
    console.log(`B2B Lead Enrichment Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
