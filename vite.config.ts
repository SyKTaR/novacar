import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { buildSeoHead } from "./src/seo.ts";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "novacar-seo-head",
      transformIndexHtml(html) {
        return html.replace(
          "<!--seo-head-->",
          `<!--seo:start-->${buildSeoHead("/")}<!--seo:end-->`,
        );
      },
    },
  ],
});
