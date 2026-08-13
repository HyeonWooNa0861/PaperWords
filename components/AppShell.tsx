import Link from "next/link";
import type { ReactNode } from "react";
import { dictionaryHref, homeHref, topicsHref } from "@/src/lib/ui/routes";
import { PwaControls } from "./PwaControls";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <header className="site-header" role="banner">
        <div className="site-header__inner">
          <Link className="wordmark" href={homeHref} aria-label="PaperWords 홈">
            <span className="wordmark__mark" aria-hidden="true">PW</span>
            <span className="wordmark__text" lang="en">PaperWords</span>
          </Link>
          <nav className="site-nav" aria-label="주요 탐색">
            <Link href={dictionaryHref}>Dictionary</Link>
            <Link href={topicsHref}>Topics</Link>
          </nav>
        </div>
      </header>
      <PwaControls />
      {children}
      <footer className="site-footer">
        <div className="site-footer__inner">
          <p className="site-footer__brand" lang="en">PaperWords</p>
          <p>
            검색과 오늘의 단어는 버전 관리된 로컬 검증 콘텐츠만 사용합니다. 출처 링크는 수동 참조이며,
            앱은 외부 데이터를 검색하거나 논문 초록을 저장·재게시하지 않습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
