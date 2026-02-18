const http = require('http');
const { execFile } = require('child_process');

const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'change-me';

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/rebuild') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const token = req.headers['x-webhook-secret'];
      if (token !== SECRET) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      console.log(`[${new Date().toISOString()}] Rebuild triggered`);

      // Use execFile with explicit args to avoid shell injection
      execFile('docker', ['compose', '-f', '/app/docker-compose.prod.yml', 'build', 'frontend'], { timeout: 300000 }, (buildErr) => {
        if (buildErr) {
          console.error('Build failed:', buildErr.message);
          res.writeHead(500);
          res.end('Build failed');
          return;
        }

        execFile('docker', ['compose', '-f', '/app/docker-compose.prod.yml', 'up', '-d', 'frontend'], { timeout: 60000 }, (upErr) => {
          if (upErr) {
            console.error('Restart failed:', upErr.message);
            res.writeHead(500);
            res.end('Restart failed');
            return;
          }

          console.log(`[${new Date().toISOString()}] Rebuild complete`);
          res.writeHead(200);
          res.end('Rebuild triggered');
        });
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
