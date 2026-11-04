import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetGoat – Brofour Farming",
  description: "Goats for sale from Brofour Farming.",
};

export const viewport: Viewport = {
  themeColor: "#1F6B3A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
