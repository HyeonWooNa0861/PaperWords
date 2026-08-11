import type { MetadataRoute } from "next";
import { getPublishedRegistry } from "@/src/lib/ui/content";
import { canonicalUrl } from "./seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const registry = getPublishedRegistry();
  const lastModified = new Date(`${registry.schedule?.immutableSinceKst ?? "2026-08-11"}T00:00:00+09:00`);
  const paths = [
    "/",
    "/dictionary",
    "/topics",
    ...registry.topics.map((topic) => `/topics/${topic.slug}`),
    ...registry.terms.map((term) => `/terms/${term.slug}`),
    ...registry.papers.map((paper) => `/papers/${paper.id}`)
  ];

  return paths.map((path) => ({
    url: canonicalUrl(path),
    lastModified,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7
  }));
}
