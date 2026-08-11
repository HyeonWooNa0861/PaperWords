import type { Metadata } from "next";
import type { PaperRecord, TermRecord } from "@/src/lib/content";

const DEFAULT_SITE_URL = "http://localhost:3000";
const SITE_NAME = "PaperWords";

interface RouteMetadataOptions {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

export function getSiteBaseUrl(): URL {
  const configured = process.env.PAPERWORDS_SITE_URL?.trim() || process.env.NEXT_PUBLIC_PAPERWORDS_SITE_URL?.trim();

  if (configured) {
    return parseSiteUrl(configured);
  }

  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return vercelProductionHost ? parseSiteUrl(`https://${vercelProductionHost}`) : new URL(DEFAULT_SITE_URL);
}

function parseSiteUrl(value: string): URL {
  try {
    const parsed = new URL(value);
    parsed.pathname = "";
    parsed.search = "";
    parsed.hash = "";
    return parsed;
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function canonicalUrl(path: string): string {
  const base = getSiteBaseUrl();
  const pathname = canonicalPath(path);
  return new URL(pathname, base).toString();
}

export function canonicalPath(path: string): string {
  const pathname = path.startsWith("/") ? path : `/${path}`;
  const withoutQuery = pathname.split("?")[0] ?? "/";

  return withoutQuery.toLowerCase();
}

export function createRouteMetadata({
  title,
  description,
  path,
  noIndex = false
}: RouteMetadataOptions): Metadata {
  const url = canonicalUrl(path);

  return {
    metadataBase: getSiteBaseUrl(),
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website"
    },
    twitter: {
      card: "summary",
      title,
      description
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false
          }
        }
      : undefined
  };
}

export function createTermJsonLd(term: TermRecord): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.headword,
    termCode: term.slug,
    alternateName: [...term.koreanEquivalents, ...term.aliases, term.acronym].filter(Boolean),
    description: term.shortDefinitionKo,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: SITE_NAME,
      url: canonicalUrl("/dictionary")
    },
    url: canonicalUrl(`/terms/${term.slug}`)
  };
}

export function createPaperJsonLd(paper: PaperRecord): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: paper.title,
    name: paper.title,
    author: paper.authors.map((author) => ({
      "@type": "Person",
      name: author.name
    })),
    datePublished: String(paper.year),
    isPartOf: {
      "@type": "CreativeWork",
      name: paper.venue
    },
    identifier: paper.doi ?? paper.id,
    url: canonicalUrl(`/papers/${paper.id}`)
  };
}
