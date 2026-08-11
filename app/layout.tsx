import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { createRouteMetadata, getSiteBaseUrl } from "./seo";
import "./globals.css";

export const metadata: Metadata = {
  ...createRouteMetadata({
    title: "PaperWords",
    description: "Korean-first AI paper terminology dictionary.",
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
