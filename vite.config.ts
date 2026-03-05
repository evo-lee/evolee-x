import vinext from "vinext";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { contentHmr } from "./src/lib/vite-plugins/content-hmr";

export default defineConfig({
  plugins: [
    contentHmr(),
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  environments: {
    rsc: {
      optimizeDeps: {
        exclude: ["@ai-sdk/react", "swr"],
      },
    },
  },
});
