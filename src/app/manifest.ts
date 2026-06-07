import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gino – Pferde-Management",
    short_name: "Gino",
    description:
      "Kalender, Dashboard, Turnier- und Vital-Historie für dein Pferd",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6F0",
    theme_color: "#8B6914",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
