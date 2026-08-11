# claude advisor artifact

- Provider: claude
- Exit code: 0
- Created at: 2026-08-11T09:23:56.176Z

## Original task

TASK_ID: PW-G005-REPRESENTATIVE-UI
MODE: READ_ONLY
GOAL: PaperWords G005 대표 UI가 한국어 사용자를 위한 edge-computing 및 neural-network-quantization 중심 논문 용어 사전으로서 정보 구조, 가독성, 반응형 품질을 충족하는지 독립 검토한다. 구현이나 파일 수정은 하지 않는다.
FILES_TO_READ:
- /Users/nahw/Documents/PaperWords/app/page.tsx
- /Users/nahw/Documents/PaperWords/app/dictionary/page.tsx
- /Users/nahw/Documents/PaperWords/app/terms/[slug]/page.tsx
- /Users/nahw/Documents/PaperWords/app/topics/page.tsx
- /Users/nahw/Documents/PaperWords/app/topics/[slug]/page.tsx
- /Users/nahw/Documents/PaperWords/app/papers/[id]/page.tsx
- /Users/nahw/Documents/PaperWords/app/~offline/page.tsx
- /Users/nahw/Documents/PaperWords/app/globals.css
- /Users/nahw/Documents/PaperWords/components/AppShell.tsx
- /Users/nahw/Documents/PaperWords/components/TodayTermPanel.tsx
- /Users/nahw/Documents/PaperWords/components/SearchResults.tsx
- /Users/nahw/Documents/PaperWords/components/PaperRelationList.tsx
- /Users/nahw/Documents/PaperWords/output/playwright/g005-today-desktop.png
- /Users/nahw/Documents/PaperWords/output/playwright/g005-today-mobile.png
- /Users/nahw/Documents/PaperWords/output/playwright/g005-dictionary-desktop.png
QUESTIONS:
1. “검증된 논문 여백 노트” 시각 방향과 route IA가 Today/사전/용어/분야/관계 전용 논문 기능을 명확히 전달하는가?
2. 모바일·데스크톱 가독성, 접근성, 연구용 정보 위계에서 릴리스 차단 수준의 문제가 있는가?
3. 관찰된 Today 근거 열의 과도한 길이, 중복 출처, 데스크톱 큰 빈 여백을 G005에서 반드시 고쳐야 하는지와 최소 수정을 제안하라.
EVIDENCE_REQUIRED: 실제 파일 경로/라인과 스크린샷 관찰을 근거로 BLOCK/WARN/GOOD을 구분한다. 추측이나 전체 재설계 금지.
OUTPUT_LIMIT: 주요 발견 최대 5개, 전체 900단어 이하.
STOP_CONDITION: APPROVE 또는 NOT_APPROVE로 시작하고, BLOCK이 있으면 재현 가능한 최소 수정 조건을 명시한 뒤 종료한다.

## Final prompt

TASK_ID: PW-G005-REPRESENTATIVE-UI
MODE: READ_ONLY
GOAL: PaperWords G005 대표 UI가 한국어 사용자를 위한 edge-computing 및 neural-network-quantization 중심 논문 용어 사전으로서 정보 구조, 가독성, 반응형 품질을 충족하는지 독립 검토한다. 구현이나 파일 수정은 하지 않는다.
FILES_TO_READ:
- /Users/nahw/Documents/PaperWords/app/page.tsx
- /Users/nahw/Documents/PaperWords/app/dictionary/page.tsx
- /Users/nahw/Documents/PaperWords/app/terms/[slug]/page.tsx
- /Users/nahw/Documents/PaperWords/app/topics/page.tsx
- /Users/nahw/Documents/PaperWords/app/topics/[slug]/page.tsx
- /Users/nahw/Documents/PaperWords/app/papers/[id]/page.tsx
- /Users/nahw/Documents/PaperWords/app/~offline/page.tsx
- /Users/nahw/Documents/PaperWords/app/globals.css
- /Users/nahw/Documents/PaperWords/components/AppShell.tsx
- /Users/nahw/Documents/PaperWords/components/TodayTermPanel.tsx
- /Users/nahw/Documents/PaperWords/components/SearchResults.tsx
- /Users/nahw/Documents/PaperWords/components/PaperRelationList.tsx
- /Users/nahw/Documents/PaperWords/output/playwright/g005-today-desktop.png
- /Users/nahw/Documents/PaperWords/output/playwright/g005-today-mobile.png
- /Users/nahw/Documents/PaperWords/output/playwright/g005-dictionary-desktop.png
QUESTIONS:
1. “검증된 논문 여백 노트” 시각 방향과 route IA가 Today/사전/용어/분야/관계 전용 논문 기능을 명확히 전달하는가?
2. 모바일·데스크톱 가독성, 접근성, 연구용 정보 위계에서 릴리스 차단 수준의 문제가 있는가?
3. 관찰된 Today 근거 열의 과도한 길이, 중복 출처, 데스크톱 큰 빈 여백을 G005에서 반드시 고쳐야 하는지와 최소 수정을 제안하라.
EVIDENCE_REQUIRED: 실제 파일 경로/라인과 스크린샷 관찰을 근거로 BLOCK/WARN/GOOD을 구분한다. 추측이나 전체 재설계 금지.
OUTPUT_LIMIT: 주요 발견 최대 5개, 전체 900단어 이하.
STOP_CONDITION: APPROVE 또는 NOT_APPROVE로 시작하고, BLOCK이 있으면 재현 가능한 최소 수정 조건을 명시한 뒤 종료한다.

## Raw output

```text
**APPROVE**

G005 대표 UI는 릴리스 차단 수준의 결함이 없습니다. 아래 발견 5개 중 BLOCK은 없으며, WARN 2건은 G005 범위 내 최소 수정을 권장합니다.

## 발견

**1. GOOD — Route IA와 "논문 여백 노트" 방향이 명확히 전달됨 (질문 1)**
내비게이션은 Today(워드마크)/Dictionary/Topics 3개 진입점으로 단순하고(`components/AppShell.tsx:12-19`), 논문 페이지는 eyebrow "Relation-only paper detail"(`app/papers/[id]/page.tsx:60`)과 "초록 상태: not_copied" 명시(`app/papers/[id]/page.tsx:100-103`)로 관계 전용 성격을 정확히 전달합니다. 엣지(청록)/양자화(적색) tone rail 구분(`app/globals.css:272-294`)이 dictionary-desktop 스크린샷의 검색 결과 좌측 적색 rail로 실제 확인되며, serif 대형 표제·종이 카드·괘선 구성이 여백 노트 시각 방향과 일치합니다.

**2. WARN — Today 근거 rail의 중복 출처·과도한 길이·데스크톱 빈 여백은 단일 원인이며 G005 내 수정 권장 (질문 3)**
g005-today-desktop.png에서 TRANSFORMER-NEURIPS-2017과 TRANSFORMER-ARXIV-2017 출처 스탬프가 "attention-is-all-you-need-2017 출처"와 "오늘 용어 출처"에 두 번씩 반복되고, 좌측 본문 카드가 화면 상단 약 30% 지점에서 끝난 뒤 rail만 약 2배 길이로 이어져 좌측에 큰 빈 영역이 남습니다. 원인은 코드로 특정됩니다: `components/TodayTermPanel.tsx:62`의 `PaperRelationList`가 관계마다 `SourceStampList`를 렌더하고(`components/PaperRelationList.tsx:40`), 바로 다음 줄 `TodayTermPanel.tsx:63`이 용어 수준 출처를 별도로 다시 렌더하는데 두 sourceRefs가 겹칩니다. 빈 여백은 `today-panel`이 `align-items: start` 2열 그리드(`app/globals.css:216-219`)라서 rail 길이가 그대로 노출된 결과입니다.
BLOCK 기준(불안전·실질적 오류)에는 못 미치지만, 대표 화면 한 뷰포트 안에서 동일 근거가 이중 표기되어 "검증된 근거" 신뢰성을 해치므로 G005에서 고칠 가치가 있습니다. 최소 수정: `PaperRelationList`에 출처 스탬프 생략 옵션(예: `showSources?: boolean`) 하나를 추가하고 Today rail 호출에서만 끄는 것입니다. 이 한 가지 변경으로 중복 제거와 rail 길이 단축(→ 빈 여백 완화)이 동시에 해결되며, 다른 화면(용어 상세의 rail)은 영향받지 않습니다. 재설계 불필요.

**3. WARN — 모바일에서 내부 메타데이터가 콘텐츠보다 먼저 노출됨 (질문 2 관련, 차단 아님)**
g005-today-mobile.png 기준 CTA 이후 "KST date / Schedule: paperwords-mvp-2026-08-11.v1 / Version: v1" 블록(`components/TodayTermPanel.tsx:44-61`)이 관계 논문보다 먼저 나오고, 근거 영역 전체가 세로 스크롤의 중간 1/3을 차지해 사전 검색 진입이 약 2,200px 아래로 밀립니다. schedule ID·버전은 일반 한국어 학습자에게 내부 식별자 성격이므로, rail 내 순서를 관계 논문 → 출처 → 스케줄 스탬프로 내리는 것만으로 정보 위계가 개선됩니다. 검증 투명성이 의도된 기능이라면 현행 유지도 수용 가능합니다.

**4. GOOD — 접근성·가독성 기본기는 릴리스 수준 (질문 2)**
skip link(`components/AppShell.tsx:8-10`), 3px `:focus-visible` 아웃라인(`app/globals.css:44-47`), 검색 상태 `aria-live="polite"`(`components/SearchResults.tsx:20`), 영문 구간 `lang="en"` 일관 표기, 라벨 있는 검색 입력과 44px(2.75rem) 최소 터치 높이(`app/globals.css:388-400, 514-523`), `prefers-reduced-motion` 대응(`app/globals.css:664-673`)을 확인했습니다. muted 텍스트(#5a625b)와 배경(#f6f7f0) 대비는 약 5.8:1로 AA를 통과하고, 본문 line-height 1.75·64ch 폭 제한(`app/globals.css:177-185`)으로 한국어 장문 가독성이 좋습니다. 840px 단일 컬럼 전환(`app/globals.css:630-662`)은 모바일 스크린샷에서 깨짐 없이 동작합니다.

**5. WARN(경미) — 근거 목록의 무표시 절단**
Today rail은 관계 논문을 2개(`components/TodayTermPanel.tsx:62`), 출처를 3개(`:63`의 `sources.slice(0, 3)`)로 자르지만 "더 보기"나 총 개수 표시가 없어, 항목이 더 많은 용어에서는 근거가 조용히 숨겨집니다. "용어 해설 열기"로 전체를 볼 수 있으므로 차단은 아니나, 절단 시 개수 힌트(예: "출처 3/5") 한 줄 추가를 권장합니다. 같은 맥락에서 eyebrow "Relation-only paper detail"(`app/papers/[id]/page.tsx:60`)만 유일하게 영문 원문이라 한국어 병기가 자연스럽습니다.

## 확인 질문 (3개 이하)

1. schedule-stamp(스케줄 ID·버전)는 최종 사용자 대상 기능입니까, G005 데모용 검증 표시입니까? 답에 따라 발견 3의 처리 우선순위가 달라집니다.
2. Today rail의 출처 표시는 "관계별 출처"와 "용어 출처" 중 어느 쪽이 정본입니까? 발견 2의 최소 수정은 관계별 스탬프를 끄는 쪽을 가정했습니다.
3. 데스크톱 스크린샷에서 Transformer 용어의 "오늘 용어 출처"에 RAG-NEURIPS-2020이 포함되어 있는데, 이는 의도된 콘텐츠 연결입니까? (UI가 아닌 데이터 검증 사항이라 판단만 요청합니다.)

BLOCK 없음 — 종료합니다.

```

## Concise summary

Provider completed successfully. Review the raw output for details.

## Action items

- Review the response and extract decisions you want to apply.
- Capture follow-up implementation tasks if needed.
