import { describe, expect, it, vi } from "vitest";
import {
  discoverCsoTerms,
  extractCsoTopicsFromHtml,
  searchCsoTopics
} from "@/src/lib/discovery/cso";
import { DiscoveryUpstreamError } from "@/src/lib/discovery/errors";

describe("CSO topic discovery", () => {
  it("extracts and deduplicates the public topic array without evaluating portal scripts", () => {
    const html = String.raw`<script>const before = true; topics = ["edge nodes","quote \" topic","nested ] text","edge nodes"];</script>`;

    expect(extractCsoTopicsFromHtml(html)).toEqual(["edge nodes", 'quote " topic', "nested ] text"]);
  });

  it("fails closed when the upstream topic assignment is missing", () => {
    expect(() => extractCsoTopicsFromHtml("<html>no topic payload</html>")).toThrowError(
      expect.objectContaining({ code: "invalid-upstream-response" })
    );
  });

  it("boosts focused edge and quantization candidates while avoiding substring noise", () => {
    const topics = [
      "knowledge management",
      "edge detection",
      "edge nodes",
      "mobile cloud computing",
      "distributed computing",
      "quantized llms",
      "quantization schemes",
      "quantization"
    ];

    const edge = searchCsoTopics("edge computing", topics, 5).map((candidate) => candidate.label);
    const quantization = searchCsoTopics("neural network quantization", topics, 5).map(
      (candidate) => candidate.label
    );

    expect(edge.slice(0, 3)).toEqual(
      expect.arrayContaining(["edge nodes", "mobile cloud computing", "distributed computing"])
    );
    expect(edge).not.toContain("knowledge management");
    expect(quantization).toEqual(expect.arrayContaining(["quantization", "quantization schemes", "quantized llms"]));
  });

  it("fetches the official portal with a seven-day Next cache and returns attributed candidates", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('<script>topics = ["quantization","quantized llms"];</script>', {
        status: 200,
        headers: { "content-type": "text/html" }
      })
    );

    const response = await discoverCsoTerms("quantization", { fetcher });
    const [, init] = fetcher.mock.calls[0]!;

    expect(fetcher).toHaveBeenCalledWith("https://cso.kmi.open.ac.uk/home", expect.any(Object));
    expect((init as RequestInit & { next?: { revalidate?: number } }).next?.revalidate).toBe(604800);
    expect(response.source).toMatchObject({ id: "cso", name: "Computer Science Ontology 3.5" });
    expect(response.candidates[0]).toMatchObject({
      label: "quantization",
      verificationStatus: "external-unverified"
    });
    expect(response.candidates[0]?.url).toContain("cso.kmi.open.ac.uk/search.php?q=quantization");
  });

  it("maps non-success and timeout failures to explicit upstream errors", async () => {
    const unavailable = vi.fn<typeof fetch>().mockResolvedValue(new Response("down", { status: 503 }));
    const timeout = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new DOMException("timed out", "TimeoutError"));

    await expect(discoverCsoTerms("quantization", { fetcher: unavailable })).rejects.toMatchObject({
      code: "upstream-unavailable"
    } satisfies Partial<DiscoveryUpstreamError>);
    await expect(discoverCsoTerms("quantization", { fetcher: timeout })).rejects.toMatchObject({
      code: "upstream-timeout"
    } satisfies Partial<DiscoveryUpstreamError>);
  });
});
