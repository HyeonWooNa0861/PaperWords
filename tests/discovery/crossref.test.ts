import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildCrossrefUrl,
  requestCrossrefPapers
} from "@/src/lib/discovery/crossref";
import { DiscoveryUpstreamError } from "@/src/lib/discovery/errors";

afterEach(() => {
  delete process.env.PAPERWORDS_CROSSREF_MAILTO;
});

describe("Crossref paper discovery", () => {
  it("builds a keyless bibliographic query that explicitly excludes abstracts", () => {
    const url = new URL(buildCrossrefUrl("neural network quantization"));

    expect(url.origin).toBe("https://api.crossref.org");
    expect(url.searchParams.get("query.bibliographic")).toBe("neural network quantization");
    expect(url.searchParams.get("rows")).toBe("6");
    expect(url.searchParams.get("select")).toContain("DOI,title,author");
    expect(url.searchParams.get("select")).not.toContain("abstract");
    expect(url.searchParams.has("mailto")).toBe(false);
  });

  it("uses an optional free polite-pool mailto without requiring an API key", () => {
    process.env.PAPERWORDS_CROSSREF_MAILTO = "maintainer@example.com";
    const url = new URL(buildCrossrefUrl("edge computing"));

    expect(url.searchParams.get("mailto")).toBe("maintainer@example.com");
    expect(url.searchParams.has("api-key")).toBe(false);
  });

  it("returns DOI-backed candidates, cleans metadata markup, and never exposes an abstract", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        message: {
          items: [
            {
              DOI: "10.1234/example.1",
              title: ["<i>Quantized</i> Models &amp; Edge Systems"],
              author: [{ given: "Ada", family: "Lovelace" }, { name: "Research Group" }],
              "published-online": { "date-parts": [[2025, 4, 1]] },
              "container-title": ["Journal of Efficient AI"],
              type: "journal-article",
              "is-referenced-by-count": 17,
              abstract: "must not cross the boundary"
            },
            {
              DOI: "10.1000/456#789",
              title: ["DOI with a fragment delimiter"]
            },
            {
              DOI: "10.1234/bad-url",
              title: ["Malformed legacy field"],
              URL: "not a URL"
            },
            { DOI: "10.1234/null-date", title: ["Unknown Year"], issued: { "date-parts": [[null]] } },
            { title: ["Missing DOI"] }
          ]
        }
      })
    );

    const response = await requestCrossrefPapers("quantization", { fetcher });
    const [, init] = fetcher.mock.calls[0]!;

    expect((init as RequestInit & { next?: { revalidate?: number } }).next?.revalidate).toBe(3600);
    expect(response.source.id).toBe("crossref");
    expect(response.candidates).toHaveLength(3);
    expect(response.candidates[0]).toEqual({
      doi: "10.1234/example.1",
      title: "Quantized Models & Edge Systems",
      authors: ["Ada Lovelace", "Research Group"],
      year: 2025,
      venue: "Journal of Efficient AI",
      type: "journal-article",
      citedByCount: 17,
      url: "https://doi.org/10.1234/example.1",
      verificationStatus: "external-unverified"
    });
    expect(response.candidates[0]).not.toHaveProperty("abstract");
    expect(response.candidates[1]).toMatchObject({
      doi: "10.1000/456#789",
      url: "https://doi.org/10.1000/456%23789"
    });
    expect(response.candidates[2]).toMatchObject({ doi: "10.1234/null-date", title: "Unknown Year" });
    expect(response.candidates[2]?.year).toBeUndefined();
  });

  it("surfaces rate limits, timeouts, and malformed metadata without retry storms", async () => {
    const rateLimited = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("slow down", { status: 429, headers: { "retry-after": "12" } })
    );
    const timeout = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new DOMException("timed out", "TimeoutError"));
    const malformed = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ message: {} }));

    await expect(requestCrossrefPapers("edge", { fetcher: rateLimited })).rejects.toMatchObject({
      code: "rate-limited",
      retryAfterSeconds: 12
    } satisfies Partial<DiscoveryUpstreamError>);
    await expect(requestCrossrefPapers("edge", { fetcher: timeout })).rejects.toMatchObject({
      code: "upstream-timeout"
    } satisfies Partial<DiscoveryUpstreamError>);
    await expect(requestCrossrefPapers("edge", { fetcher: malformed })).rejects.toMatchObject({
      code: "invalid-upstream-response"
    } satisfies Partial<DiscoveryUpstreamError>);
  });
});
