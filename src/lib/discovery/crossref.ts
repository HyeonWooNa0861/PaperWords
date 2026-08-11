import { z } from "zod";
import {
  EXTERNAL_VERIFICATION_STATUS,
  type CrossrefDiscoveryResponse,
  type CrossrefPaperCandidate,
  type DiscoverySource
} from "./contracts";
import { DiscoveryUpstreamError } from "./errors";

const CROSSREF_WORKS_URL = "https://api.crossref.org/works";
const CROSSREF_REVALIDATE_SECONDS = 60 * 60;
const CROSSREF_TIMEOUT_MS = 7_000;
const CROSSREF_ROWS = 6;
const CROSSREF_SELECT = [
  "DOI",
  "title",
  "author",
  "issued",
  "published-print",
  "published-online",
  "container-title",
  "type",
  "URL",
  "is-referenced-by-count"
].join(",");

export const CROSSREF_SOURCE: DiscoverySource = {
  id: "crossref",
  name: "Crossref REST API",
  url: "https://www.crossref.org/documentation/retrieve-metadata/rest-api/",
  licenseNote: "공개 서지 메타데이터 · 초록 제외 · 외부 후보는 미검증"
};

const datePartsSchema = z
  .object({
    "date-parts": z.array(z.array(z.union([z.number().int(), z.null()]))).optional()
  })
  .optional();

const crossrefItemSchema = z.object({
  DOI: z.string().optional(),
  title: z.array(z.string()).optional(),
  author: z
    .array(
      z.object({
        given: z.string().optional(),
        family: z.string().optional(),
        name: z.string().optional()
      })
    )
    .optional(),
  issued: datePartsSchema,
  "published-print": datePartsSchema,
  "published-online": datePartsSchema,
  "container-title": z.array(z.string()).optional(),
  type: z.string().optional(),
  URL: z.string().url().optional(),
  "is-referenced-by-count": z.number().int().nonnegative().optional()
});

const crossrefResponseSchema = z.object({
  message: z.object({
    items: z.array(z.unknown())
  })
});

type Fetcher = typeof fetch;
type CrossrefItem = z.infer<typeof crossrefItemSchema>;

let crossrefRequestQueue: Promise<unknown> = Promise.resolve();

export function discoverCrossrefPapers(
  query: string,
  options: { fetcher?: Fetcher; timeoutMs?: number } = {}
): Promise<CrossrefDiscoveryResponse> {
  const request = crossrefRequestQueue.then(() => requestCrossrefPapers(query, options));
  crossrefRequestQueue = request.catch(() => undefined);
  return request;
}

export async function requestCrossrefPapers(
  query: string,
  options: { fetcher?: Fetcher; timeoutMs?: number } = {}
): Promise<CrossrefDiscoveryResponse> {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? CROSSREF_TIMEOUT_MS;
  const url = buildCrossrefUrl(query);

  try {
    const response = await fetcher(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": buildCrossrefUserAgent()
      },
      next: { revalidate: CROSSREF_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (response.status === 429) {
      throw new DiscoveryUpstreamError("rate-limited", "Crossref 요청 한도에 도달했습니다.", {
        retryAfterSeconds: parseRetryAfter(response.headers.get("retry-after"))
      });
    }

    if (!response.ok) {
      throw new DiscoveryUpstreamError(
        "upstream-unavailable",
        `Crossref가 HTTP ${response.status}로 응답했습니다.`
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      throw new DiscoveryUpstreamError(
        "invalid-upstream-response",
        "Crossref 응답을 JSON으로 읽을 수 없습니다.",
        { cause: error }
      );
    }

    const parsed = crossrefResponseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new DiscoveryUpstreamError(
        "invalid-upstream-response",
        "Crossref 응답 형식이 올바르지 않습니다.",
        { cause: parsed.error }
      );
    }

    return {
      query,
      source: CROSSREF_SOURCE,
      candidates: parsed.data.message.items.flatMap((item) => {
        const parsedItem = crossrefItemSchema.safeParse(item);
        if (!parsedItem.success) {
          return [];
        }

        const candidate = toPaperCandidate(parsedItem.data);
        return candidate ? [candidate] : [];
      })
    };
  } catch (error) {
    if (error instanceof DiscoveryUpstreamError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new DiscoveryUpstreamError("upstream-timeout", "Crossref 응답 시간이 초과되었습니다.", {
        cause: error
      });
    }

    throw new DiscoveryUpstreamError("upstream-unavailable", "Crossref에 연결할 수 없습니다.", {
      cause: error
    });
  }
}

export function buildCrossrefUrl(query: string): string {
  const url = new URL(CROSSREF_WORKS_URL);
  url.searchParams.set("query.bibliographic", query);
  url.searchParams.set("rows", String(CROSSREF_ROWS));
  url.searchParams.set("select", CROSSREF_SELECT);

  const mailto = getCrossrefMailto();
  if (mailto) {
    url.searchParams.set("mailto", mailto);
  }

  return url.toString();
}

function toPaperCandidate(item: CrossrefItem): CrossrefPaperCandidate | undefined {
  const doi = item.DOI?.trim();
  const title = cleanMetadataText(item.title?.[0] ?? "");
  if (!doi || !/^10\.\d{4,9}\//i.test(doi) || !title) {
    return undefined;
  }

  const venue = cleanMetadataText(item["container-title"]?.[0] ?? "");

  return {
    doi,
    title,
    authors: (item.author ?? [])
      .map((author) => cleanMetadataText(author.name ?? [author.given, author.family].filter(Boolean).join(" ")))
      .filter(Boolean)
      .slice(0, 12),
    year: firstYear(item["published-print"], item["published-online"], item.issued),
    venue: venue || undefined,
    type: item.type,
    citedByCount: item["is-referenced-by-count"],
    url: buildDoiUrl(doi),
    verificationStatus: EXTERNAL_VERIFICATION_STATUS
  };
}

function buildDoiUrl(doi: string): string {
  return `https://doi.org/${doi.split("/").map(encodeURIComponent).join("/")}`;
}

function firstYear(...dates: Array<z.infer<typeof datePartsSchema>>): number | undefined {
  for (const date of dates) {
    const year = date?.["date-parts"]?.[0]?.[0];
    if (typeof year === "number" && year >= 1000 && year <= 9999) {
      return year;
    }
  }
  return undefined;
}

function cleanMetadataText(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"'
  };

  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (entity, code: string) => {
    if (code.startsWith("#x")) {
      return safeCodePoint(Number.parseInt(code.slice(2), 16), entity);
    }
    if (code.startsWith("#")) {
      return safeCodePoint(Number.parseInt(code.slice(1), 10), entity);
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function safeCodePoint(value: number, fallback: string): string {
  try {
    return Number.isFinite(value) ? String.fromCodePoint(value) : fallback;
  } catch {
    return fallback;
  }
}

function buildCrossrefUserAgent(): string {
  const mailto = getCrossrefMailto();
  return mailto
    ? `PaperWords/0.2 (https://paperwords.vercel.app; mailto:${mailto})`
    : "PaperWords/0.2 (https://paperwords.vercel.app)";
}

function getCrossrefMailto(): string | undefined {
  const value = process.env.PAPERWORDS_CROSSREF_MAILTO?.trim();
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined;
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
}

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("name" in error)) {
    return false;
  }

  return error.name === "AbortError" || error.name === "TimeoutError";
}
