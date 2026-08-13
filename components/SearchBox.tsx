import type { Route } from "next";
import Link from "next/link";
import { MAX_SEARCH_QUERY_LENGTH } from "@/src/lib/search";
import { dictionaryHref } from "@/src/lib/ui/routes";

interface SearchBoxProps {
  defaultQuery?: string;
  compact?: boolean;
  suggestions?: readonly string[];
}

export function SearchBox({ defaultQuery = "", compact = false, suggestions = [] }: SearchBoxProps) {
  const helpId = compact ? "dictionary-query-help-compact" : "dictionary-query-help";

  return (
    <form action="/dictionary" className={compact ? "search-box search-box--compact" : "search-box"} method="get" role="search">
      <label className="search-box__label" htmlFor={compact ? "dictionary-query-compact" : "dictionary-query"}>
        논문 용어 검색
      </label>
      <div className="search-box__row">
        <input
          aria-describedby={helpId}
          className="search-box__input"
          autoCapitalize="none"
          autoComplete="off"
          defaultValue={defaultQuery}
          enterKeyHint="search"
          id={compact ? "dictionary-query-compact" : "dictionary-query"}
          maxLength={MAX_SEARCH_QUERY_LENGTH + 1}
          name="q"
          placeholder="Transformer, RAG, 양자화..."
          spellCheck={false}
          type="search"
        />
        <button className="button" type="submit">
          검색
        </button>
      </div>
      <p className="search-box__help" id={helpId}>
        영어 표제어, 약어, 별칭, 한국어 대응어, 설명 본문을 로컬 색인에서 찾습니다.
      </p>
      {suggestions.length > 0 ? (
        <div className="search-suggestions" aria-label="빠른 검색">
          <span>빠른 검색</span>
          {suggestions.map((suggestion) => (
            <Link
              href={`${dictionaryHref}?q=${encodeURIComponent(suggestion)}` as Route}
              key={suggestion}
            >
              {suggestion}
            </Link>
          ))}
        </div>
      ) : null}
    </form>
  );
}
