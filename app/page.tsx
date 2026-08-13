import type { Metadata } from "next";
import { HomeDiscovery } from "@/components/HomeDiscovery";
import { SearchBox } from "@/components/SearchBox";
import { TodayTermPanel } from "@/components/TodayTermPanel";
import { getPublishedRegistry, resolveTodayTermView } from "@/src/lib/ui/content";
import { createRouteMetadata } from "./seo";

export const metadata: Metadata = createRouteMetadata({
  title: "PaperWords | 오늘의 논문 용어",
  description: "KST 스케줄에 따라 검증된 AI 논문 용어를 한국어 해설과 출처 관계선으로 읽습니다.",
  path: "/"
});

export const dynamic = "force-dynamic";

export default function Home() {
  const registry = getPublishedRegistry();
  const today = resolveTodayTermView(registry);

  return (
    <main className="page page--today" id="main-content">
      {today ? (
        <TodayTermPanel registry={registry} view={today} />
      ) : (
        <section className="empty-state" aria-labelledby="today-title">
          <h1 id="today-title">오늘의 논문 용어를 불러올 수 없습니다</h1>
          <p>공개 스케줄과 공개 용어가 모두 검증되어야 Today 화면을 표시할 수 있습니다.</p>
        </section>
      )}

      <section className="search-entry" aria-labelledby="today-search-title">
        <div>
          <p className="eyebrow">Dictionary</p>
          <h2 className="section-title" id="today-search-title">
            논문을 읽다가 만난 용어 찾기
          </h2>
        </div>
        <SearchBox compact />
      </section>

      <HomeDiscovery registry={registry} todayTerm={today?.term} />
    </main>
  );
}
