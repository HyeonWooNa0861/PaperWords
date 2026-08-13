# PaperWords

PaperWords(PW)는 한국어 사용자가 AI·컴퓨터공학 논문에서 자주 만나는 영어 전문 용어를 정확하게 이해하도록 돕는 로컬 데이터 기반 PWA 사전입니다. 현재 콘텐츠는 엣지 컴퓨팅과 신경망 양자화를 중심으로 구성되어 있습니다.

## 주요 기능

- Asia/Seoul 날짜를 기준으로 한 재현 가능한 오늘의 단어
- 영어 표제어, 약어, 별칭, 한국어 용어 검색
- 한국어 정의와 개념 설명, 사용 맥락, 혼동 용어 및 관련 용어
- 검증된 논문 메타데이터와 논문 선정 이유
- 분야별 용어 탐색
- 설치 가능한 PWA와 기본 오프라인 앱 셸

## 데이터 원칙

PaperWords의 검색, 추천, 주제 탐색, 용어 설명과 논문 관계는 모두 저장소의 버전 관리된 로컬 콘텐츠만 사용합니다.

- 런타임 외부 용어·논문 검색 API를 사용하지 않습니다.
- DOI와 출처 URL은 사용자가 직접 열 수 있는 수동 인용 링크로만 제공합니다.
- 공개 콘텐츠는 스키마 검증과 출처·언어 검토를 통과해야 합니다.
- 논문 abstract 원문을 저장하거나 공개하지 않습니다.

자세한 경계는 [제품 명세](docs/SPEC.md), [콘텐츠 스키마](docs/CONTENT_SCHEMA.md), [로컬 데이터 ADR](docs/decisions/0003-local-only-dataset-boundary.md)에서 확인할 수 있습니다.

## 기술 스택

- Next.js App Router
- React, TypeScript strict mode
- Tailwind CSS
- Zod, MiniSearch
- Vitest, React Testing Library, Playwright
- 자체 service worker와 Web App Manifest

## 로컬 실행

요구 사항은 Node.js 22.11 이상 25 미만과 pnpm 10.34.5입니다.

```bash
pnpm install
pnpm dev
```

기본 개발 서버는 `http://localhost:3000`에서 열립니다.

## 검증

전체 릴리스 검증은 다음 명령으로 실행합니다.

```bash
pnpm verify
```

검증 범위에는 lockfile, lint, typecheck, 콘텐츠 무결성, 검색, 추천 일정, 단위·통합 테스트, production build, 데스크톱·모바일 E2E, PWA, 접근성, SEO가 포함됩니다.

## 프로젝트 구조

```text
app/          Next.js routes and PWA metadata
components/   reusable interface components
content/      reviewed local terms, papers, sources, topics, schedule
src/lib/      schemas, registry, search, schedule, PWA logic
tests/        unit and integration tests
e2e/          browser, PWA, accessibility, and SEO tests
docs/         product, architecture, content, test, and decision records
```

## 문서

- [제품 명세](docs/SPEC.md)
- [아키텍처](docs/ARCHITECTURE.md)
- [콘텐츠 스키마](docs/CONTENT_SCHEMA.md)
- [테스트 계획](docs/TEST_PLAN.md)
- [디자인 시스템](DESIGN.md)
- [변경 이력](CHANGELOG.md)
