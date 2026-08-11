import type { SearchMatchClass, SearchResponse } from "@/src/lib/search";
import type { ContentLookups } from "@/src/lib/ui/content";
import { getTermTopics } from "@/src/lib/ui/content";
import { CompactDictionaryEntry } from "./CompactDictionaryEntry";

interface SearchResultsProps {
  response: SearchResponse;
  lookups: ContentLookups;
}

export function SearchResults({ response, lookups }: SearchResultsProps) {
  const status = getSearchStatus(response);

  return (
    <section className="search-results" aria-labelledby="dictionary-results-title">
      <div className="section-heading-row">
        <h2 id="dictionary-results-title" className="section-title">
          검색 결과
        </h2>
        <p className="result-status" aria-live="polite">
          {status}
        </p>
      </div>
      {response.results.length > 0 ? (
        <ol className="result-list">
          {response.results.map((result, index) => (
            <li key={result.slug}>
              <CompactDictionaryEntry
                meta={`${index + 1}. ${matchClassLabel(result.matchClass, result.matchedField)}`}
                term={result.term}
                topics={getTermTopics(result.term, lookups)}
              />
            </li>
          ))}
        </ol>
      ) : (
        <div className="empty-state">
          <p>{emptyStateCopy(response)}</p>
        </div>
      )}
    </section>
  );
}

function getSearchStatus(response: SearchResponse): string {
  switch (response.query.status) {
    case "empty":
      return "검색어 대기 중";
    case "unsupported":
      return "지원하지 않는 문자만 포함된 검색어";
    case "oversized":
      return `검색어가 ${response.query.maxLength}자를 초과함`;
    case "ready":
      return `${response.results.length}개 결과`;
  }
}

function emptyStateCopy(response: SearchResponse): string {
  switch (response.query.status) {
    case "empty":
      return "검색어를 입력하면 검증된 공개 용어가 순위대로 표시됩니다.";
    case "unsupported":
      return "현재 검색은 영어, 숫자, 한글 토큰을 지원합니다. 검색어를 바꿔 주세요.";
    case "oversized":
      return `검색어는 ${response.query.maxLength}자 이하로 줄여 주세요.`;
    case "ready":
      return "일치하는 공개 용어가 없습니다. 약어, 한국어 대응어, 또는 더 짧은 접두어로 다시 검색해 보세요.";
  }
}

function matchClassLabel(matchClass: SearchMatchClass, matchedField: string): string {
  const fieldLabel = matchedFieldLabel(matchedField);
  const labels: Record<SearchMatchClass, string> = {
    "exact-headword": `정확 일치: ${fieldLabel}`,
    "exact-acronym-alias-korean": `정확 일치: ${fieldLabel}`,
    prefix: `접두어 일치: ${fieldLabel}`,
    fuzzy: `오타 허용 일치: ${fieldLabel}`,
    body: "본문/해설 일치"
  };

  return labels[matchClass];
}

function matchedFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    headword: "영어 표제어",
    acronym: "약어",
    alias: "영어 별칭",
    koreanEquivalent: "한국어 대응어",
    topic: "주제",
    body: "본문"
  };

  return labels[field] ?? field;
}
