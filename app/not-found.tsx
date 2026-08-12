import Link from "next/link";
import { dictionaryHref, homeHref } from "@/src/lib/ui/routes";

export default function NotFound() {
  return (
    <main className="page page--narrow" id="main-content">
      <section className="not-found-panel" aria-labelledby="not-found-title">
        <p className="not-found-panel__code" aria-hidden="true">404</p>
        <p className="eyebrow">Page not found</p>
        <h1 id="not-found-title">찾으려는 페이지가 없습니다</h1>
        <p>주소를 다시 확인하거나 검증된 PaperWords 용어 검색으로 이동해 주세요.</p>
        <div className="cta-row">
          <Link className="button" href={dictionaryHref}>
            사전 검색
          </Link>
          <Link className="button button--secondary" href={homeHref}>
            홈으로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}
