import { defineConfig, Plugin } from 'vite';
import { resolve } from 'path';

/**
 * Vite plugin that intercepts /api/* requests during `npm run dev`
 * and executes the Vercel serverless TypeScript handlers locally.
 */
function vercelApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-vercel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
        const pathname = parsedUrl.pathname;
        const routeName = pathname.replace('/api/', '').split('/')[0].split('?')[0];

        try {
          // Collect request body
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const rawBody = Buffer.concat(buffers).toString('utf-8');
          let parsedBody = {};
          if (rawBody) {
            try {
              parsedBody = JSON.parse(rawBody);
            } catch {
              parsedBody = rawBody;
            }
          }

          // Build query object
          const queryParams: Record<string, string> = {};
          parsedUrl.searchParams.forEach((value, key) => {
            queryParams[key] = value;
          });

          // Mock Vercel Request
          const vercelReq: any = req;
          vercelReq.body = parsedBody;
          vercelReq.query = queryParams;

          // Mock Vercel Response
          let statusCode = 200;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          const vercelRes: any = {
            setHeader(key: string, value: string) {
              headers[key] = value;
              return vercelRes;
            },
            status(code: number) {
              statusCode = code;
              return vercelRes;
            },
            json(data: any) {
              res.writeHead(statusCode, headers);
              res.end(JSON.stringify(data));
              return vercelRes;
            },
            end(data?: any) {
              res.writeHead(statusCode, headers);
              res.end(data);
              return vercelRes;
            },
          };

          // Dynamically load the TypeScript API handler
          const modulePath = resolve(__dirname, `api/${routeName}.ts`);
          const apiModule = await server.ssrLoadModule(modulePath);

          if (apiModule && typeof apiModule.default === 'function') {
            await apiModule.default(vercelReq, vercelRes);
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `API route /api/${routeName} not found.` }));
          }
        } catch (err: any) {
          console.error(`Error handling /api/${routeName}:`, err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      });
    },
  };
}

export default defineConfig({
  root: './',
  publicDir: 'public',
  plugins: [vercelApiPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  server: {
    host: true,
    port: 3000,
    open: false,
  },
});
