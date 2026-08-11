import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DictionaryPage from "@/app/dictionary/page";
import PaperPage, { generateStaticParams as generatePaperParams } from "@/app/papers/[id]/page";
import TermPage, { generateStaticParams as generateTermParams } from "@/app/terms/[slug]/page";
import TopicPage, { generateStaticParams as generateTopicParams } from "@/app/topics/[slug]/page";
import TopicsPage from "@/app/topics/page";
import OfflinePage from "@/app/~offline/page";
import { SearchResults } from "@/components/SearchResults";
import { TodayTermPanel } from "@/components/TodayTermPanel";
import { getScheduledTermForDate } from "@/src/lib/schedule";
import { buildSearchIndex, searchTerms } from "@/src/lib/search";
import {
  getFeaturedPapersForTopic,
  getPublishedRegistry,
  getTopicTerms,
  makeContentLookups,
  resolveTodayTermView
} from "@/src/lib/ui/content";

afterEach(() => {
  cleanup();
});

describe("Today route content", () => {
  const registry = getPublishedRegistry();

  it("renders the scheduled term from the KST schedule resolver", () => {
    const resolved = getScheduledTermForDate(registry, "2026-08-11");
    const view = resolveTodayTermView(registry, "2026-08-11");

    expect(view?.term.slug).toBe(resolved?.term.slug);
    expect(view?.status).toBe("scheduled");

    render(<TodayTermPanel registry={registry} view={view!} />);

    expect(screen.getByRole("heading", { name: /Transformer/i })).toBeInTheDocument();
    expect(screen.getAllByText("2026-08-11").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("paperwords-mvp-2026-08-11.v1")).toBeInTheDocument();
    expect(screen.getByText(/순환 또는 합성곱 시퀀스 층 없이 어텐션/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "용어 해설 열기" })).toHaveAttribute("href", "/terms/transformer");
  });

  it("deduplicates Today source stamps, excludes non-core term sources, and keeps schedule transparency visible", () => {
    const view = resolveTodayTermView(registry, "2026-08-11");

    render(<TodayTermPanel registry={registry} view={view!} />);

    const rail = screen.getByLabelText("오늘 용어 검증 정보");
    const relationHeading = within(rail).getByRole("heading", { name: "오늘의 관계 논문" });
    const sourceHeading = within(rail).getByRole("heading", { name: "핵심 용어 출처" });
    const scheduleLabel = within(rail).getByText("Schedule");

    expect(within(rail).getAllByText("transformer-neurips-2017")).toHaveLength(1);
    expect(within(rail).queryByText("rag-neurips-2020")).not.toBeInTheDocument();
    expect(within(rail).getByText("paperwords-mvp-2026-08-11.v1")).toBeInTheDocument();
    expect(relationHeading.compareDocumentPosition(sourceHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(sourceHeading.compareDocumentPosition(scheduleLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("uses an explicit stable fallback outside the schedule range", () => {
    const view = resolveTodayTermView(registry, "2026-12-01");

    expect(view).toMatchObject({
      status: "out-of-range",
      dateKst: "2026-12-01",
      scheduledDateKst: "2026-11-08"
    });
    expect(view?.messageKo).toContain("범위");
    expect(view?.term.slug).toBe("mixed-precision-quantization");
  });

  it("uses the first released entry with fallback copy before the schedule starts", () => {
    const view = resolveTodayTermView(registry, "2026-08-10");

    expect(view).toMatchObject({
      status: "out-of-range",
      dateKst: "2026-08-10",
      scheduledDateKst: "2026-08-11"
    });
    expect(view?.term.slug).toBe("transformer");

    render(<TodayTermPanel registry={registry} view={view!} />);

    const scheduleStamp = screen.getByLabelText("스케줄 투명성 스탬프");

    expect(screen.getByText(/2026-08-10 KST는 paperwords-mvp-2026-08-11\.v1 범위/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Transformer/i })).toBeInTheDocument();
    expect(within(scheduleStamp).getByText("2026-08-10")).toBeInTheDocument();
    expect(within(scheduleStamp).getByText("2026-08-11")).toBeInTheDocument();
  });
});

describe("Dictionary route and search states", () => {
  const registry = getPublishedRegistry();
  const lookups = makeContentLookups(registry);
  const index = buildSearchIndex(registry);

  it("hydrates the shareable query and renders ranked linked results", async () => {
    const ui = await DictionaryPage({ searchParams: Promise.resolve({ q: "RAG" }) });
    render(ui);

    expect(screen.getByRole("searchbox", { name: "논문 용어 검색" })).toHaveValue("RAG");
    expect(screen.getByText("1개 결과")).toBeInTheDocument();
    expect(screen.getByText("1. 정확 일치: 약어")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Retrieval-Augmented Generation RAG/i })
    ).toHaveAttribute("href", "/terms/retrieval-augmented-generation");
  });

  it("labels exact, Korean, prefix, fuzzy, and body matches", () => {
    const cases = [
      ["Transformer", "정확 일치: 영어 표제어"],
      ["검색 증강 생성", "정확 일치: 한국어 대응어"],
      ["Trans", "접두어 일치: 영어 표제어"],
      ["Transformr", "오타 허용 일치: 영어 표제어"],
      ["문맥 관계를", "본문/해설 일치"]
    ] as const;

    for (const [query, label] of cases) {
      cleanup();
      render(<SearchResults lookups={lookups} response={searchTerms(query, { index })} />);
      expect(screen.getByText(new RegExp(label))).toBeInTheDocument();
    }
  });

  it("renders empty, no-result, oversized, and unsupported states", () => {
    const cases = [
      ["", "검색어 대기 중", "검색어를 입력하면 검증된 공개 용어가 순위대로 표시됩니다."],
      ["zzzzzz-not-a-term", "0개 결과", "일치하는 공개 용어가 없습니다."],
      ["x".repeat(161), "검색어가 160자를 초과함", "검색어는 160자 이하로 줄여 주세요."],
      ["東京", "지원하지 않는 문자만 포함된 검색어", "현재 검색은 영어, 숫자, 한글 토큰을 지원합니다."]
    ] as const;

    for (const [query, status, copy] of cases) {
      cleanup();
      render(<SearchResults lookups={lookups} response={searchTerms(query, { index })} />);
      expect(screen.getByText(status)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(copy))).toBeInTheDocument();
    }
  });
});

describe("Term, topic, and paper routes", () => {
  it("generates only published term params and joins term detail records", async () => {
    const registry = getPublishedRegistry();

    expect(generateTermParams()).toHaveLength(registry.terms.length);
    expect(generateTermParams()).toContainEqual({ slug: "retrieval-augmented-generation" });

    const ui = await TermPage({ params: Promise.resolve({ slug: "retrieval-augmented-generation" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: /Retrieval-Augmented Generation RAG/i })).toBeInTheDocument();
    expect(screen.getAllByText("검색 증강 생성").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /Transformer/i })).toHaveAttribute("href", "/terms/transformer");
    expect(screen.getByRole("link", { name: /Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks/i }))
      .toHaveAttribute("href", "/papers/rag-knowledge-intensive-nlp-2020");
    expect(screen.getByText(/검색된 비파라미터 메모리를 결합했습니다/)).toBeInTheDocument();
    expect(screen.queryByText(/abstract body/i)).not.toBeInTheDocument();
  });

  it("throws notFound for invalid term/topic/paper routes", async () => {
    await expect(TermPage({ params: Promise.resolve({ slug: "missing-term" }) })).rejects.toThrow();
    await expect(TopicPage({ params: Promise.resolve({ slug: "missing-topic" }) })).rejects.toThrow();
    await expect(PaperPage({ params: Promise.resolve({ id: "missing-paper" }) })).rejects.toThrow();
  });

  it("renders exactly published topic params, counts, representative terms, and relation-derived papers", async () => {
    const registry = getPublishedRegistry();
    const lookups = makeContentLookups(registry);
    const modelQuantization = registry.topics.find((topic) => topic.slug === "model-quantization")!;
    const modelQuantizationTerms = getTopicTerms(modelQuantization.slug, registry);
    const featured = getFeaturedPapersForTopic(modelQuantization.slug, registry, lookups);

    expect(generateTopicParams()).toEqual(registry.topics.map((topic) => ({ slug: topic.slug })));

    render(<TopicsPage />);
    expect(screen.getAllByText(modelQuantization.labelKo).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Neural Network Quantization")).toBeInTheDocument();

    cleanup();
    const ui = await TopicPage({ params: Promise.resolve({ slug: modelQuantization.slug }) });
    render(ui);

    expect(screen.getByRole("heading", { name: modelQuantization.labelEn })).toBeInTheDocument();
    expect(screen.getByText(modelQuantization.descriptionKo)).toBeInTheDocument();
    expect(screen.getByText(String(modelQuantizationTerms.length))).toBeInTheDocument();
    expect(screen.getByText(featured[0]!.paper.title)).toBeInTheDocument();
  });

  it("renders relation-only paper detail with backlinks, rationale, sources, and no abstract body", async () => {
    const registry = getPublishedRegistry();

    expect(generatePaperParams()).toHaveLength(registry.papers.length);
    expect(generatePaperParams()).toContainEqual({ id: "attention-is-all-you-need-2017" });

    const ui = await PaperPage({ params: Promise.resolve({ id: "attention-is-all-you-need-2017" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Attention Is All You Need" })).toBeInTheDocument();
    expect(screen.getByText("관계 전용 논문 상세")).toBeInTheDocument();
    expect(screen.getByText("not_copied. 원문 초록은 이 앱에 복사하지 않습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Transformer" })).toHaveAttribute("href", "/terms/transformer");
    expect(screen.getByText(/Transformer 구조를 소개했습니다/)).toBeInTheDocument();
    expect(screen.getByText("transformer-neurips-2017")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("Abstract:");
  });
});

describe("Offline route", () => {
  it("renders app-shell fallback copy without generated content", () => {
    render(<OfflinePage />);

    expect(screen.getByRole("heading", { name: "오프라인 fallback" })).toBeInTheDocument();
    expect(screen.getByText(/새 용어 설명을 만들거나 추측하지 않습니다/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로 이동" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "검색 다시 열기" })).toHaveAttribute("href", "/dictionary");
  });
});
