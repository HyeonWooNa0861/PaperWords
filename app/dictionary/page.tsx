import type { Metadata } from "next";
import { SearchBox } from "@/components/SearchBox";
import { SearchResults } from "@/components/SearchResults";
import { buildSearchIndex, searchTerms } from "@/src/lib/search";
import { getPublishedRegistry, makeContentLookups } from "@/src/lib/ui/content";
import { createRouteMetadata } from "../seo";

export const metadata: Metadata = createRouteMetadata({
  title: "PaperWords Dictionary",
  description: "로컬에 포함된 영어 표제어, 약어, 한국어 대응어와 해설 본문을 결정적으로 검색합니다.",
  path: "/dictionary"
});

interface DictionaryPageProps {
  searchParams?: Promise<{
    q?: string | string[];
  }>;
}

export default async function DictionaryPage({ searchParams }: DictionaryPageProps) {
  const params = await searchParams;
  const query = firstParam(params?.q);
  const registry = getPublishedRegistry();
  const response = searchTerms(query, {
    index: buildSearchIndex(registry)
  });

  return (
    <main className="page page--narrow" id="main-content">
      <header className="page-header">
        <p className="eyebrow">Dictionary</p>
        <h1>검증된 논문 용어 검색</h1>
        <p>
          기기에 포함된 검증 콘텐츠만 검색합니다. 공유 가능한 <span lang="en">GET</span> query로 같은
          결과를 다시 열 수 있습니다.
        </p>
      </header>
      <SearchBox defaultQuery={query} />
      <SearchResults lookups={makeContentLookups(registry)} response={response} />
    </main>
  );
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
