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
        <Link className="wordmark" href={homeHref} aria-label="PaperWords 홈">
          <span className="wordmark__mark">PW</span>
          <span className="wordmark__text" lang="en">PaperWords</span>
        </Link>
        <nav className="site-nav" aria-label="주요 탐색">
          <Link href={dictionaryHref}>Dictionary</Link>
          <Link href={topicsHref}>Topics</Link>
        </nav>
      </header>
      <PwaControls />
      {children}
      <footer className="site-footer">
        <p>
          PaperWords는 로컬에 검증된 공개 콘텐츠만 표시합니다. 논문 초록 전문은 저장하거나 재게시하지 않습니다.
        </p>
      </footer>
    </div>
  );
}
