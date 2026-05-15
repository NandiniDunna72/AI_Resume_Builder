import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-expect-error - missing declaration for inner esm file
import { YoutubeTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Don't proxy if it's handled by the custom middleware (like transcript)
        bypass: (req) => {
          if (req.url?.startsWith('/api/transcript')) return req.url;
          return null;
        }
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: 'youtube-transcript-api',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      configureServer(server: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        server.middlewares.use('/api/transcript', async (req: any, res: any) => {
          try {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const videoUrl = url.searchParams.get('url');
            if (!videoUrl) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Missing url parameter' }));
            }
            const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(transcript));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
