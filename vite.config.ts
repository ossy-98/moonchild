import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFile } from 'node:child_process';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'macos-open-mail-bridge',
      configureServer(server) {
        server.middlewares.use('/__open_mail', (req, res) => {
          const to = 'ossywtf@gmail.com';
          execFile('open', [`mailto:${to}`], (err) => {
            res.statusCode = err ? 500 : 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: !err }));
          });
        });
      },
    },
  ],
});
