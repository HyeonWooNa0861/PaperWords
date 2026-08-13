import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { createRouteMetadata, getSiteBaseUrl } from "./seo";
import "./globals.css";

export const metadata: Metadata = {
  ...createRouteMetadata({
    title: "PaperWords",
    description: "Korean-first AI paper terminology dictionary powered by verified local content.",
    path: "/"
  }),
  applicationName: "PaperWords",
  metadataBase: getSiteBaseUrl(),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f5f7"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
