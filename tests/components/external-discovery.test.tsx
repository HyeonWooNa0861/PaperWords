import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExternalDiscovery } from "@/components/ExternalDiscovery";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ExternalDiscovery", () => {
  it("does not use the network until the user explicitly starts an external search", async () => {
    const fetcher = vi.fn((input: string | URL | Request) => {
      const url = String(input);
      return Promise.resolve(
        url.includes("/terms?")
          ? Response.json({
              query: "edge computing",
              source: {
                id: "cso",
                name: "Computer Science Ontology 3.5",
                url: "https://cso.kmi.open.ac.uk/downloads",
                licenseNote: "CC BY 4.0"
              },
              candidates: [
                {
                  label: "edge nodes",
                  url: "https://cso.kmi.open.ac.uk/search.php?q=edge+nodes",
                  verificationStatus: "external-unverified"
                }
              ]
            })
          : Response.json({
              query: "edge computing",
              source: {
                id: "crossref",
                name: "Crossref REST API",
                url: "https://www.crossref.org/documentation/retrieve-metadata/rest-api/",
                licenseNote: "public metadata"
              },
              candidates: [
                {
                  doi: "10.1234/edge",
                  title: "Edge Computing Research",
                  authors: ["Ada Lovelace"],
                  year: 2025,
                  url: "https://doi.org/10.1234/edge",
                  verificationStatus: "external-unverified"
                }
              ]
            })
      );
    });
    vi.stubGlobal("fetch", fetcher);

    render(<ExternalDiscovery initialQuery="edge computing" />);

    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByText("미검증 후보")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "외부 데이터 검색" }));

    expect(await screen.findByRole("link", { name: "edge nodes" })).toHaveAttribute(
      "href",
      "https://cso.kmi.open.ac.uk/search.php?q=edge+nodes"
    );
    expect(screen.getByRole("link", { name: "Edge Computing Research" })).toHaveAttribute(
      "href",
      "https://doi.org/10.1234/edge"
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/discovery/terms?q=edge%20computing",
      "/api/discovery/papers?q=edge%20computing"
    ]);
  });

  it("keeps one source usable when the other source is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string | URL | Request) =>
        Promise.resolve(
          String(input).includes("/terms?")
            ? Response.json({
                query: "quantization",
                source: { id: "cso", name: "CSO", url: "https://cso.kmi.open.ac.uk", licenseNote: "CC" },
                candidates: []
              })
            : Response.json(
                { error: { code: "rate-limited", message: "Crossref 요청 한도에 도달했습니다." } },
                { status: 429 }
              )
        )
      )
    );

    render(<ExternalDiscovery initialQuery="quantization" />);
    fireEvent.click(screen.getByRole("button", { name: "외부 데이터 검색" }));

    expect(await screen.findByText("일치하는 CSO 토픽 후보가 없습니다.")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Crossref 요청 한도에 도달했습니다.")).toBeInTheDocument();
    });
    expect(screen.getAllByText("연결 실패")).toHaveLength(1);
  });
});
