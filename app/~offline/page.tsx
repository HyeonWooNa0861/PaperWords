import type { Metadata } from "next";
import Link from "next/link";
import { dictionaryHref, homeHref } from "@/src/lib/ui/routes";
import { createRouteMetadata } from "../seo";

export const metadata: Metadata = createRouteMetadata({
  title: "PaperWords Offline",
  description: "네트워크 없이 열 수 있는 PaperWords 안전 fallback 화면입니다.",
  path: "/~offline",
  noIndex: true
});

export default function OfflinePage() {
  return (
    <main className="page page--narrow" id="main-content">
      <section className="offline-panel" aria-labelledby="offline-title">
        <p className="eyebrow">Offline</p>
        <h1 id="offline-title">오프라인 fallback</h1>
        <p>
          이 화면은 캐시된 앱 shell에서 안전하게 표시되는 안내입니다. 새 용어 설명을 만들거나 추측하지 않습니다.
        </p>
        <div className="cta-row">
          <Link className="button" href={homeHref}>
            홈으로 이동
          </Link>
          <Link className="button button--secondary" href={dictionaryHref}>
            검색 다시 열기
          </Link>
        </div>
      </section>
    </main>
  );
}
