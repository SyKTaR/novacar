import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { buildSeoHead } from "./src/seo.ts";

// Police des titres (H1/H2 en Unison Pro 800) : préchargée pour qu'elle arrive
// avec le CSS au lieu d'être découverte après lui. Sans préchargement, le
// remplacement de la police de secours décale le hero sur mobile (CLS).
const PRELOADED_FONTS = ["UnisonPro-Bold.otf"];

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
    {
      name: "novacar-font-preload",
      apply: "build",
      transformIndexHtml: {
        order: "post",
        handler(html, ctx) {
          const links = Object.values(ctx.bundle ?? {})
            .filter(
              (output) =>
                output.type === "asset" &&
                output.originalFileNames.some((name) =>
                  PRELOADED_FONTS.some((font) => name.endsWith(`/${font}`)),
                ),
            )
            .map(
              (asset) =>
                `<link rel="preload" href="/${asset.fileName}" as="font" type="font/otf" crossorigin />`,
            );
          if (links.length !== PRELOADED_FONTS.length) {
            throw new Error(`Préchargement des polices : ${links.length}/${PRELOADED_FONTS.length} fichier(s) trouvé(s).`);
          }
          return html.replace("</head>", `  ${links.join("\n    ")}\n  </head>`);
        },
      },
    },
  ],
});
