import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "Livraison",
    description: "Livraison pour les commerces de Ngaoundéré",
    start_url: "/connexion",
    display: "standalone",
    background_color: "#f6f7f5",
    theme_color: "#0f766e",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
