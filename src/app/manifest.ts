import type { MetadataRoute } from "next";

/** Lets Android install the seller app on the home screen (needed for reliable phone alerts). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Online Goat Market",
    short_name: "Goat Market",
    description: "Goats for sale from Brofour Farming.",
    start_url: "/seller",
    scope: "/",
    display: "standalone",
    background_color: "#f6f6f3",
    theme_color: "#1F6B3A",
    icons: [
      { src: "/brand/online-goat-market-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/online-goat-market-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
