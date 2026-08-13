import Link from "next/link";
import type { PublishedContentRegistry } from "@/src/lib/content";
import {
  getCoreTermSources,
  getTermPaperRelations,
  getTermTopics,
  makeContentLookups,
  type TodayTermView
} from "@/src/lib/ui/content";
import { dictionaryHref, termHref } from "@/src/lib/ui/routes";
import { EvidenceDisclosure } from "./EvidenceDisclosure";
import { PaperRelationList } from "./PaperRelationList";
import { SourceStampList } from "./SourceStampList";
import { TermTitleBlock } from "./TermTitleBlock";

interface TodayTermPanelProps {
  registry: PublishedContentRegistry;
  view: TodayTermView;
}

export function TodayTermPanel({ registry, view }: TodayTermPanelProps) {
  const lookups = makeContentLookups(registry);
  const topics = getTermTopics(view.term, lookups);
  const relations = getTermPaperRelations(view.term, lookups);
  const coreSources = getCoreTermSources(view.term, lookups);
  const visibleRelationCount = Math.min(2, relations.length);
  const visibleSourceCount = Math.min(3, coreSources.length);

  return (
    <section className="today-panel" aria-labelledby="today-title">
      <div className="today-panel__reading">
        {view.messageKo ? <p className="notice">{view.messageKo}</p> : null}
        <TermTitleBlock eyebrow="오늘의 논문 용어" headingId="today-title" term={view.term} topics={topics} />
        <p className="lead-copy">{view.term.shortDefinitionKo}</p>
        <p className="reading-copy">{view.term.explanationKo}</p>
        <div className="cta-row">
          <Link className="button" href={termHref(view.term.slug)}>
            용어 해설 열기
          </Link>
          <Link className="button button--secondary" href={dictionaryHref}>
            사전 검색
          </Link>
        </div>
      </div>

      <aside className="evidence-rail" aria-label="오늘 용어 검증 정보">
        <EvidenceDisclosure
          meta={`논문 ${relations.length}편 · 출처 ${coreSources.length}개`}
          title="근거와 추천 일정"
        >
          <PaperRelationList relations={relations} title="오늘의 관계 논문" limit={visibleRelationCount} showSources={false} />
          {relations.length > visibleRelationCount ? (
            <p className="slice-hint">
              관계 논문 표시 {visibleRelationCount} / 전체 {relations.length}, 용어 해설에서 전체 확인
            </p>
          ) : null}
          <SourceStampList sources={coreSources.slice(0, visibleSourceCount)} title="핵심 용어 출처" compact />
          {coreSources.length > visibleSourceCount ? (
            <p className="slice-hint">
              출처 표시 {visibleSourceCount} / 전체 {coreSources.length}, 용어 해설에서 전체 확인
            </p>
          ) : null}
          <dl className="schedule-stamp" aria-label="추천 일정 정보">
            <div>
              <dt>기준 날짜</dt>
              <dd>{view.dateKst} KST</dd>
            </div>
            <div>
              <dt>추천 원칙</dt>
              <dd>{view.schedule.durationDays}일 일정 · {view.schedule.noRepeatWindowDays}일 반복 방지</dd>
            </div>
            <div>
              <dt>표시 항목</dt>
              <dd>{view.scheduledDateKst}</dd>
            </div>
          </dl>
        </EvidenceDisclosure>
      </aside>
    </section>
  );
}
