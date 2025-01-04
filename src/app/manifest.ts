import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Repotalent",
    short_name: "Repotalent",
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    theme_color: "#1d232a",
    background_color: "#1d232a",
    display: "standalone",
  }
}
