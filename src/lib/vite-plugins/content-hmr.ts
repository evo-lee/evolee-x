import type { Plugin } from "vite";
import path from "node:path";

/**
 * Vite plugin that triggers a full page reload when Markdown content files change.
 *
 * The RSC pipeline in vinext invalidates server modules on content changes
 * but doesn't propagate this to the browser. This plugin bridges that gap
 * by sending a full-reload signal through the client HMR WebSocket.
 */
export function contentHmr(): Plugin {
  const contentDir = path.resolve("content");

  function isContentFile(file: string): boolean {
    return file.startsWith(contentDir) && file.endsWith(".md");
  }

  function reload(file: string, server: { environments: { client: { hot: { send: (msg: { type: string }) => void } } } }) {
    const relative = path.relative(contentDir, file);
    server.environments.client.hot.send({ type: "full-reload" });
    console.log(`\x1b[36m[content-hmr]\x1b[0m ${relative} changed → full reload`);
  }

  return {
    name: "content-hmr",
    apply: "serve",

    // Handle changes to existing content files in the module graph
    hotUpdate({ file, server }) {
      if (isContentFile(file)) {
        reload(file, server);
        return [];
      }
    },

    // Watch for added/removed content files (not yet in module graph)
    configureServer(server) {
      server.watcher.on("add", (file) => {
        if (isContentFile(file)) reload(file, server);
      });
      server.watcher.on("unlink", (file) => {
        if (isContentFile(file)) reload(file, server);
      });
    },
  };
}
