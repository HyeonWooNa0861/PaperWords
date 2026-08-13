import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PaperWords",
    short_name: "PaperWords",
    description: "Korean-first AI paper terminology dictionary powered by verified local content.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#eee6d7",
    theme_color: "#eee6d7",
    lang: "ko",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
