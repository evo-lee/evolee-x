/**
 * Cloudflare Worker entry point
 */
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: {
    fetch(input: Request | URL | string, init?: RequestInit): Promise<Response>;
  };
  IMAGES: {
    input(stream: ReadableStream<Uint8Array>): {
      transform(options: { width?: number; height?: number; fit?: string }): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
  CACHE_KV: KVNamespace;
  // 可选：Umami API Token（如果需要认证访问统计数据）
  UMAMI_API_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Inject Cloudflare secrets into process.env and globalThis so server-side code can access them.
    // In Workers, secrets are only available via the env parameter, not process.env.
    if (env.UMAMI_API_TOKEN) {
      process.env.UMAMI_API_TOKEN = env.UMAMI_API_TOKEN;
      // 同时设置到 globalThis，确保 Server Component 可以访问
      (globalThis as unknown as { UMAMI_API_TOKEN: string }).UMAMI_API_TOKEN = env.UMAMI_API_TOKEN;
    }

    if (env.CACHE_KV) {
      (globalThis as unknown as { CACHE_KV: KVNamespace }).CACHE_KV = env.CACHE_KV;
    }

    const url = new URL(request.url);

    // Image optimization via Cloudflare Images binding
    if (url.pathname === "/_vinext/image") {
      const imageUrl = url.searchParams.get("url");
      if (!imageUrl) {
        return new Response("Missing url parameter", { status: 400 });
      }

      // Fetch the source image from assets
      const source = await env.ASSETS.fetch(new Request(new URL(imageUrl, request.url)));
      if (!source.ok || !source.body) {
        return new Response("Image not found", { status: 404 });
      }

      // For now, just serve the original image without transformation
      const headers = new Headers(source.headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("Vary", "Accept");
      return new Response(source.body, { status: 200, headers });
    }

    // Delegate everything else to vinext
    return handler.fetch(request);
  },
};
