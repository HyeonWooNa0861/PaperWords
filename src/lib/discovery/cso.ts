import { z } from "zod";
import { normalizeSearchText } from "@/src/lib/search";
import {
  EXTERNAL_VERIFICATION_STATUS,
  type CsoDiscoveryResponse,
  type CsoTermCandidate,
  type DiscoverySource
} from "./contracts";
import { DiscoveryUpstreamError } from "./errors";

const CSO_ORIGIN = "https://cso.kmi.open.ac.uk";
const CSO_TOPICS_URL = `${CSO_ORIGIN}/home`;
const CSO_REVALIDATE_SECONDS = 60 * 60 * 24 * 7;
const CSO_TIMEOUT_MS = 7_000;
const MAX_CSO_HTML_LENGTH = 5_000_000;
const MAX_CSO_TOPICS = 30_000;

export const CSO_SOURCE: DiscoverySource = {
  id: "cso",
  name: "Computer Science Ontology 3.5",
  url: "https://cso.kmi.open.ac.uk/downloads",
  licenseNote: "CC BY 4.0 · 외부 후보는 PaperWords 검증 콘텐츠와 분리"
};

const topicsSchema = z.array(z.string().trim().min(1).max(160)).min(1).max(MAX_CSO_TOPICS);

const focusedLabels = {
  edge: new Set([
    "edge nodes",
    "mobile cloud computing",
    "mobile clouds",
    "cyber-foraging",
    "cyber foraging",
    "mobile computing",
    "distributed computing",
    "distributed computing systems",
    "ubiquitous computing"
  ]),
  quantization: new Set([
    "quantization",
    "quantization parameters",
    "quantization schemes",
    "quantizers",
    "quantizer",
    "scalar quantization",
    "vector quantization",
    "vector quantization (vq)",
    "learning vector quantization",
    "color quantization",
    "quantized llms",
    "quantized llm fine-tuning"
  ])
} as const;

type Fetcher = typeof fetch;

interface RankedTopic {
  label: string;
  normalizedLabel: string;
  rank: number;
  matchedTokens: number;
}

export async function discoverCsoTerms(
  query: string,
  options: { fetcher?: Fetcher; limit?: number; timeoutMs?: number } = {}
): Promise<CsoDiscoveryResponse> {
  const topics = await fetchCsoTopics(options);

  return {
    query,
    source: CSO_SOURCE,
    candidates: searchCsoTopics(query, topics, options.limit ?? 10)
  };
}

export async function fetchCsoTopics(
  options: { fetcher?: Fetcher; timeoutMs?: number } = {}
): Promise<string[]> {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? CSO_TIMEOUT_MS;

  try {
    const response = await fetcher(CSO_TOPICS_URL, {
      headers: {
        Accept: "text/html",
        "User-Agent": "PaperWords/0.2 (https://paperwords.vercel.app)"
      },
      next: { revalidate: CSO_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!response.ok) {
      throw new DiscoveryUpstreamError(
        "upstream-unavailable",
        `CSO가 HTTP ${response.status}로 응답했습니다.`
      );
    }

    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_CSO_HTML_LENGTH) {
      throw new DiscoveryUpstreamError(
        "invalid-upstream-response",
        "CSO 응답이 허용된 크기를 초과했습니다."
      );
    }

    const html = await response.text();
    if (html.length > MAX_CSO_HTML_LENGTH) {
      throw new DiscoveryUpstreamError(
        "invalid-upstream-response",
        "CSO 응답이 허용된 크기를 초과했습니다."
      );
    }

    return extractCsoTopicsFromHtml(html);
  } catch (error) {
    if (error instanceof DiscoveryUpstreamError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new DiscoveryUpstreamError("upstream-timeout", "CSO 응답 시간이 초과되었습니다.", {
        cause: error
      });
    }

    throw new DiscoveryUpstreamError("upstream-unavailable", "CSO에 연결할 수 없습니다.", {
      cause: error
    });
  }
}

export function extractCsoTopicsFromHtml(html: string): string[] {
  const assignment = /\btopics\s*=\s*\[/g.exec(html);
  if (!assignment) {
    throw new DiscoveryUpstreamError(
      "invalid-upstream-response",
      "CSO 토픽 배열을 찾을 수 없습니다."
    );
  }

  const openingBracket = assignment.index + assignment[0].lastIndexOf("[");
  const jsonArray = readJsonArray(html, openingBracket);

  try {
    const parsed = topicsSchema.parse(JSON.parse(jsonArray));
    return [...new Set(parsed)];
  } catch (error) {
    throw new DiscoveryUpstreamError(
      "invalid-upstream-response",
      "CSO 토픽 배열 형식이 올바르지 않습니다.",
      { cause: error }
    );
  }
}

export function searchCsoTopics(query: string, topics: readonly string[], limit = 10): CsoTermCandidate[] {
  const normalizedQuery = normalizeSearchText(query, { treatOversizedAsReady: true });
  if (normalizedQuery.status !== "ready") {
    return [];
  }

  const focus = getFocusedLabels(normalizedQuery.tokens);
  const ranked = topics
    .map((label): RankedTopic | undefined => {
      const normalized = normalizeSearchText(label, { treatOversizedAsReady: true });
      if (normalized.status !== "ready") {
        return undefined;
      }

      const normalizedLabel = normalized.value;
      const matchedTokens = normalizedQuery.tokens.filter((queryToken) =>
        normalized.tokens.some(
          (labelToken) =>
            labelToken === queryToken || labelToken.startsWith(queryToken) || queryToken.startsWith(labelToken)
        )
      ).length;

      let rank: number | undefined;
      if (normalizedLabel === normalizedQuery.value) {
        rank = 0;
      } else if (focus?.has(normalizedLabel)) {
        rank = 1;
      } else if (normalizedLabel.startsWith(normalizedQuery.value)) {
        rank = 2;
      } else if (matchedTokens === normalizedQuery.tokens.length) {
        rank = 3;
      } else if (matchedTokens > 0) {
        rank = 4;
      }

      return rank === undefined ? undefined : { label, normalizedLabel, rank, matchedTokens };
    })
    .filter((topic): topic is RankedTopic => Boolean(topic))
    .sort((left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }
      if (left.matchedTokens !== right.matchedTokens) {
        return right.matchedTokens - left.matchedTokens;
      }
      if (left.normalizedLabel.length !== right.normalizedLabel.length) {
        return left.normalizedLabel.length - right.normalizedLabel.length;
      }
      return left.normalizedLabel.localeCompare(right.normalizedLabel, "en");
    });

  return ranked.slice(0, Math.max(0, limit)).map(({ label }) => ({
    label,
    url: csoSearchUrl(label),
    verificationStatus: EXTERNAL_VERIFICATION_STATUS
  }));
}

function getFocusedLabels(tokens: readonly string[]): ReadonlySet<string> | undefined {
  if (tokens.some((token) => token === "quantization" || token === "quantized" || token === "quantizer")) {
    return focusedLabels.quantization;
  }

  if (tokens.includes("edge") && tokens.includes("computing")) {
    return focusedLabels.edge;
  }

  return undefined;
}

function csoSearchUrl(label: string): string {
  const url = new URL("/search.php", CSO_ORIGIN);
  url.searchParams.set("q", label);
  return url.toString();
}

function readJsonArray(input: string, startIndex: number): string {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < input.length; index += 1) {
    const character = input[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === "[") {
      depth += 1;
    } else if (character === "]") {
      depth -= 1;
      if (depth === 0) {
        return input.slice(startIndex, index + 1);
      }
    }
  }

  throw new DiscoveryUpstreamError(
    "invalid-upstream-response",
    "CSO 토픽 배열이 완결되지 않았습니다."
  );
}

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("name" in error)) {
    return false;
  }

  return error.name === "AbortError" || error.name === "TimeoutError";
}
