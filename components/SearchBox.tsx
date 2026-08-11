import { MAX_SEARCH_QUERY_LENGTH } from "@/src/lib/search";

interface SearchBoxProps {
  defaultQuery?: string;
  compact?: boolean;
}

export function SearchBox({ defaultQuery = "", compact = false }: SearchBoxProps) {
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
          defaultValue={defaultQuery}
          id={compact ? "dictionary-query-compact" : "dictionary-query"}
          maxLength={MAX_SEARCH_QUERY_LENGTH + 1}
          name="q"
          placeholder="Transformer, RAG, 양자화..."
          type="search"
        />
        <button className="button" type="submit">
          검색
        </button>
      </div>
      <p className="search-box__help" id={helpId}>
        영어 표제어, 약어, 별칭, 한국어 대응어, 설명 본문을 로컬 색인에서 찾습니다.
      </p>
    </form>
  );
}
