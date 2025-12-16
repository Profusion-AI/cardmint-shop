import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (including non-VITE prefixed ones)
  const env = loadEnv(mode, process.cwd(), '');

  // Fail fast if required credentials are missing in development
  const required = ['API_ORIGIN', 'BASIC_AUTH_USER', 'BASIC_AUTH_PASS'];
  if (mode === 'development') {
    for (const key of required) {
      if (!env[key]) {
        console.error(`❌ Missing required environment variable: ${key}`);
        console.error('   Create .env.local with credentials from .local/credentials/README.md');
        process.exit(1);
      }
    }
  }

  // Encode Basic Auth credentials (server-side only, never exposed to client)
  const basicAuthToken = Buffer.from(
    `${env.BASIC_AUTH_USER}:${env.BASIC_AUTH_PASS}`
  ).toString('base64');

  const apiOrigin = env.API_ORIGIN || 'https://stage.cardmintshop.com';
  const isLocalBackend = apiOrigin.includes('127.0.0.1') || apiOrigin.includes('localhost');

  return {
    // Base path for deployment (root) and a dedicated assets dir to avoid
    // conflicting with EverShop's /assets/ admin bundle.
    base: '/',
    build: {
      assetsDir: "shop-assets",
    },
    plugins: [react(), basicSsl()],
    server: {
      host: "::",
      port: 8080,
      https: true, // Self-signed certificate for local HTTPS development
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
          secure: !isLocalBackend, // Disable SSL verification for localhost
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              // Only inject Basic Auth for remote servers, not localhost
              if (!isLocalBackend) {
                proxyReq.setHeader('Authorization', `Basic ${basicAuthToken}`);
              }
            });
            // Optional dev-only cookie rewrite if upstream sets incompatible Domain/Secure flags
            // proxy.on('proxyRes', (proxyRes) => {
            //   const setCookie = proxyRes.headers['set-cookie'];
            //   if (setCookie && mode === 'development') {
            //     proxyRes.headers['set-cookie'] = setCookie.map((c: string) =>
            //       c.replace(/Domain=[^;]+/i, 'Domain=localhost').replace(/;\s*Secure/gi, '')
            //     );
            //   }
            // });
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
