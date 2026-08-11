import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as getPapers } from "@/app/api/discovery/papers/route";
import { GET as getTerms } from "@/app/api/discovery/terms/route";

afterEach(() => {
  delete process.env.PAPERWORDS_EXTERNAL_DISCOVERY_ENABLED;
  vi.unstubAllGlobals();
});

describe("external discovery API routes", () => {
  it("supports a no-store operational rollback switch without contacting upstreams", async () => {
    process.env.PAPERWORDS_EXTERNAL_DISCOVERY_ENABLED = "0";
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const [terms, papers] = await Promise.all([
      getTerms(new Request("http://localhost/api/discovery/terms?q=edge")),
      getPapers(new Request("http://localhost/api/discovery/papers?q=edge"))
    ]);

    expect(terms.status).toBe(503);
    expect(papers.status).toBe(503);
    expect(terms.headers.get("cache-control")).toBe("no-store");
    expect(fetcher).not.toHaveBeenCalled();
    await expect(terms.json()).resolves.toMatchObject({ error: { code: "feature-disabled" } });
  });

  it("rejects invalid input before making a network request", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await getTerms(new Request("http://localhost/api/discovery/terms?q="));

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(fetcher).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ error: { code: "invalid-query" } });
  });

  it("returns cached, noindex CSO candidates from the official live payload shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response('<script>topics = ["edge nodes","mobile cloud computing"];</script>', { status: 200 })
      )
    );

    const response = await getTerms(
      new Request("http://localhost/api/discovery/terms?q=edge%20computing")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("s-maxage=86400");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(payload.candidates.map((candidate: { label: string }) => candidate.label)).toEqual(
      expect.arrayContaining(["edge nodes", "mobile cloud computing"])
    );
  });

  it("returns cached Crossref metadata and preserves Retry-After on rate limits", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          message: { items: [{ DOI: "10.1234/pw", title: ["PaperWords Test Paper"] }] }
        })
      )
      .mockResolvedValueOnce(
        new Response("limited", { status: 429, headers: { "retry-after": "9" } })
      );
    vi.stubGlobal("fetch", fetcher);

    const success = await getPapers(
      new Request("http://localhost/api/discovery/papers?q=quantization")
    );
    const limited = await getPapers(
      new Request("http://localhost/api/discovery/papers?q=another%20query")
    );

    expect(success.status).toBe(200);
    expect(success.headers.get("cache-control")).toContain("s-maxage=3600");
    await expect(success.json()).resolves.toMatchObject({
      candidates: [{ doi: "10.1234/pw", verificationStatus: "external-unverified" }]
    });
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("9");
    await expect(limited.json()).resolves.toMatchObject({ error: { code: "rate-limited" } });
  });
});
