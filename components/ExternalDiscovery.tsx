"use client";

import { type FormEvent, useState } from "react";
import { MAX_SEARCH_QUERY_LENGTH } from "@/src/lib/search";
import type {
  CrossrefDiscoveryResponse,
  CsoDiscoveryResponse,
  DiscoveryErrorResponse
} from "@/src/lib/discovery/contracts";

type SourceState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

interface ExternalDiscoveryProps {
  initialQuery?: string;
}

export function ExternalDiscovery({ initialQuery = "edge computing" }: ExternalDiscoveryProps) {
  const [query, setQuery] = useState(initialQuery);
  const [terms, setTerms] = useState<SourceState<CsoDiscoveryResponse>>({ status: "idle" });
  const [papers, setPapers] = useState<SourceState<CrossrefDiscoveryResponse>>({ status: "idle" });
  const loading = terms.status === "loading" || papers.status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) {
      setTerms({ status: "error", message: "외부 검색어를 입력해 주세요." });
      setPapers({ status: "idle" });
      return;
    }

    setTerms({ status: "loading" });
    setPapers({ status: "loading" });

    const encodedQuery = encodeURIComponent(nextQuery);
    const [termResult, paperResult] = await Promise.allSettled([
      fetchDiscovery<CsoDiscoveryResponse>(`/api/discovery/terms?q=${encodedQuery}`),
      fetchDiscovery<CrossrefDiscoveryResponse>(`/api/discovery/papers?q=${encodedQuery}`)
    ]);

    setTerms(
      termResult.status === "fulfilled"
        ? { status: "success", data: termResult.value }
        : { status: "error", message: errorMessage(termResult.reason) }
    );
    setPapers(
      paperResult.status === "fulfilled"
        ? { status: "success", data: paperResult.value }
        : { status: "error", message: errorMessage(paperResult.reason) }
    );
  }

  return (
    <section className="external-discovery" aria-labelledby="external-discovery-title">
      <div className="external-discovery__intro">
        <div>
          <p className="eyebrow">Open network</p>
          <h2 className="section-title" id="external-discovery-title">
            외부 공개 데이터 탐색
          </h2>
        </div>
        <span className="verification-badge">미검증 후보</span>
      </div>
      <p className="external-discovery__copy">
        로컬 사전의 검증된 20개 용어와 섞지 않습니다. 검색 버튼을 누르면 무료 공개 소스인 CSO와
        Crossref에 서버를 통해 연결하며, 후보는 자동으로 PaperWords 용어가 되지 않습니다.
      </p>

      <form aria-busy={loading} className="external-search" onSubmit={handleSubmit} role="search">
        <label className="search-box__label" htmlFor="external-query">
          외부 검색어
        </label>
        <div className="search-box__row">
          <input
            aria-describedby="external-query-help"
            className="search-box__input"
            id="external-query"
            maxLength={MAX_SEARCH_QUERY_LENGTH + 1}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="edge computing, neural network quantization..."
            type="search"
            value={query}
          />
          <button className="button" disabled={loading} type="submit">
            {loading ? "연결 중…" : "외부 데이터 검색"}
          </button>
        </div>
        <p className="search-box__help" id="external-query-help">
          CSO 토픽은 7일, Crossref 응답은 1시간 동안 서버 캐시하여 공개 API 요청을 줄입니다.
        </p>
      </form>

      <div className="source-ledger" aria-label="외부 데이터 출처">
        <a href="https://cso.kmi.open.ac.uk/downloads" rel="noreferrer" target="_blank">
          CSO 3.5 · CC BY 4.0
        </a>
        <a
          href="https://www.crossref.org/documentation/retrieve-metadata/"
          rel="noreferrer"
          target="_blank"
        >
          Crossref · 공개 서지 메타데이터
        </a>
        <span>API key 없음 · 초록 요청 없음</span>
      </div>

      <div className="external-results">
        <CsoResultPanel state={terms} />
        <CrossrefResultPanel state={papers} />
      </div>
    </section>
  );
}

function CsoResultPanel({ state }: { state: SourceState<CsoDiscoveryResponse> }) {
  return (
    <section className="external-panel" aria-labelledby="cso-results-title">
      <div className="external-panel__heading">
        <h3 id="cso-results-title">CSO 용어 후보</h3>
        <SourceStatus state={state} />
      </div>
      {state.status === "success" &&
        (state.data.candidates.length > 0 ? (
          <ol className="candidate-list">
            {state.data.candidates.map((candidate) => (
              <li key={candidate.label}>
                <a className="text-link" href={candidate.url} rel="noreferrer" target="_blank" lang="en">
                  {candidate.label}
                </a>
                <span>CSO에서 확인</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="external-panel__empty">일치하는 CSO 토픽 후보가 없습니다.</p>
        ))}
      {state.status === "error" && <p className="external-panel__error">{state.message}</p>}
      {state.status === "idle" && (
        <p className="external-panel__empty">검색하면 공개 온톨로지의 영문 토픽 후보를 표시합니다.</p>
      )}
    </section>
  );
}

function CrossrefResultPanel({ state }: { state: SourceState<CrossrefDiscoveryResponse> }) {
  return (
    <section className="external-panel" aria-labelledby="crossref-results-title">
      <div className="external-panel__heading">
        <h3 id="crossref-results-title">Crossref 논문 후보</h3>
        <SourceStatus state={state} />
      </div>
      {state.status === "success" &&
        (state.data.candidates.length > 0 ? (
          <ol className="paper-candidate-list">
            {state.data.candidates.map((candidate) => (
              <li key={candidate.doi}>
                <p className="paper-candidate__title">
                  <a className="text-link" href={candidate.url} rel="noreferrer" target="_blank" lang="en">
                    {candidate.title}
                  </a>
                </p>
                <p className="paper-candidate__meta">
                  {[candidate.authors.slice(0, 3).join(", "), candidate.year, candidate.venue]
                    .filter(Boolean)
                    .join(" · ") || "서지 세부정보 없음"}
                </p>
                <p className="paper-candidate__doi">DOI {candidate.doi}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="external-panel__empty">DOI가 확인되는 Crossref 후보가 없습니다.</p>
        ))}
      {state.status === "error" && <p className="external-panel__error">{state.message}</p>}
      {state.status === "idle" && (
        <p className="external-panel__empty">검색하면 초록을 제외한 공개 서지 메타데이터를 표시합니다.</p>
      )}
    </section>
  );
}

function SourceStatus<T>({ state }: { state: SourceState<T> }) {
  const copy = {
    idle: "대기",
    loading: "연결 중",
    success: "외부 응답",
    error: "연결 실패"
  }[state.status];

  return (
    <span className="external-panel__status" data-status={state.status} aria-live="polite">
      {copy}
    </span>
  );
}

async function fetchDiscovery<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message = isDiscoveryError(payload)
      ? payload.error.message
      : `외부 데이터 요청이 HTTP ${response.status}로 실패했습니다.`;
    throw new Error(message);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("외부 데이터 응답 형식이 올바르지 않습니다.");
  }

  return payload as T;
}

function isDiscoveryError(value: unknown): value is DiscoveryErrorResponse {
  if (!value || typeof value !== "object" || !("error" in value)) {
    return false;
  }

  const error = value.error;
  return Boolean(error && typeof error === "object" && "message" in error && typeof error.message === "string");
}

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : "외부 데이터 요청에 실패했습니다.";
}
