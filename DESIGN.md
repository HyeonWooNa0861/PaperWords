# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-08-12
- Primary product surfaces: Today, dictionary search, term detail, topic index/detail, paper relation detail, external discovery, PWA install/update, offline and not-found states
- Evidence reviewed: `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `app/**/*.tsx`, `components/**/*.tsx`, `app/globals.css`, current production desktop/mobile captures in `output/playwright/redesign-baseline-*`, and the G005-G008 browser/accessibility constraints
- Direction: Apple-inspired product minimalism adapted for PaperWords. This is not a replica of Apple.com or a copy of Apple trade dress.
- Selected visual preset: archived `minimalist-ui`, narrowed to cool neutral surfaces, one blue interaction accent, native typography, and quiet motion

## Brand

- Personality: calm, exact, scholarly, modern, trustworthy
- Trust signals: verified/local labels, restrained color, visible source relationships, clear external-data separation, stable typography and spacing
- Avoid: newspaper imitation, heavy serif dominance, multiple competing rail colors, loud AI gradients, ornamental glass, dense borders, oversized badges, visual claims that external candidates are verified

## Product goals

- Goals: make one daily concept immediately readable; make bilingual search feel fast and obvious; keep evidence available without competing with the explanation; make the PWA feel native and composed on Apple devices while remaining cross-platform
- Non-goals: changing search ranking, content, schedule, source policy, external-discovery boundaries, PWA behavior, or route architecture
- Success signals: every route has one clear primary heading/action; users can scan the main explanation before metadata; desktop and 390px mobile have no horizontal overflow; existing accessibility, SEO, PWA, and behavior gates stay green

## Personas and jobs

- Primary personas: Korean-speaking AI/CS learners, researchers, and engineers reading papers
- User jobs: understand an English technical term in Korean; find a term by English, acronym, or Korean; inspect important papers and provenance; discover adjacent unverified candidates without confusing them with the local dictionary
- Key contexts of use: focused desktop reading, mobile lookup while reading a paper, intermittent/offline PWA use

## Information architecture

- Primary navigation: PaperWords home, Dictionary, Topics
- Core routes/screens: `/`, `/dictionary`, `/terms/[slug]`, `/topics`, `/topics/[slug]`, `/papers/[id]`, `/~offline`
- Content hierarchy: page purpose → English headword/title → Korean meaning and explanation → primary action → related terms/papers → source and schedule metadata
- External discovery remains a visibly separate secondary section after local search results.

## Design principles

- One focus per surface: the daily term, query, term title, topic, or paper title is the visual anchor.
- Evidence is calm but reachable: metadata uses grouped secondary surfaces and never disappears.
- Color is semantic and scarce: blue means action/link/focus; warm warning color is reserved for unverified or error states.
- Native before decorative: use local/system fonts, CSS, and existing assets so offline behavior and performance remain deterministic.
- Air over ornament: hierarchy comes from spacing, type scale, weight, and grouping rather than borders or illustrations.
- Tradeoff: this direction deliberately gives up the previous paper-margin-note aesthetic and its edge/quantization rail colors for a clearer unified product language.

## Visual language

- Color: cool canvas `#f5f5f7`, elevated white, primary ink `#1d1d1f`, AA-safe secondary `#66666b`, separator `rgba(0,0,0,.08)`, interaction blue `#0071e3`, pale blue selection, pale amber for unverified/error semantics
- Typography: `-apple-system`, BlinkMacSystemFont, SF Pro fallbacks, Apple SD Gothic Neo, Helvetica Neue; large headings use 600–700 weight and tight tracking; metadata uses SF Mono fallbacks and tabular figures; no network font dependency
- Spacing/layout rhythm: 4px base with 8/12/16/24/32/48/64/96 steps; content max width around 1120px; reading text max 66 characters
- Shape/radius/elevation: 28–32px for major surfaces, 16–20px for grouped content, 10–12px for controls; thin separators; only diffuse low-opacity shadows
- Motion: 180–500ms transform and color transitions with native-feeling easing; entrance motion never fades readable content; no layout animation; reduced-motion mode removes nonessential motion
- Imagery/iconography: no stock imagery or icon dependency; the restrained PW monogram and typography carry the identity

## Components

- Existing components to reuse: `AppShell`, `SearchBox`, `TodayTermPanel`, `TermTitleBlock`, `CompactDictionaryEntry`, `PaperRelationList`, `SourceStampList`, `TopicChip`, `ExternalDiscovery`, `PwaControls`
- New/changed components: shell/header/footer markup gains inner containers; a branded not-found surface is added; existing components are restyled rather than replaced
- Variants and states: primary/secondary buttons; compact/full search; local verified versus external unverified; loading, empty, error, disabled, offline, install, and update
- Token/component ownership: visual tokens and component styles live in `app/globals.css`; route semantics stay in existing React components

## Accessibility

- Target standard: WCAG 2.1 AA for tested routes
- Keyboard/focus behavior: retain skip link and DOM order; all links, buttons, and fields receive a visible blue focus ring; touch targets are at least 44px where practical
- Contrast/readability: primary and secondary text meet AA on their assigned surfaces; body copy remains at least 16px with generous line height
- Screen-reader semantics: retain existing headings, landmarks, labels, live regions, language spans, and source relationships
- Reduced motion and sensory considerations: honor `prefers-reduced-motion`; color never carries verification or state meaning alone

## Responsive behavior

- Supported breakpoints/devices: wide desktop, tablet below 920px, compact/mobile below 640px; minimum validated width 390px
- Layout adaptations: two-column Today/detail grids collapse to one column; sticky evidence rails become normal flow; topic and external-result grids become one column; search buttons become full width on compact screens
- Touch/hover differences: hover polish applies only on hover-capable devices; pressed state uses subtle scale; navigation and controls retain comfortable touch spacing

## Interaction states

- Loading: external discovery keeps source-by-source loading text and disables the action without layout shift
- Empty: grouped quiet surface with direct next-step copy
- Error: inline pale warning surface; no alert dialog
- Success: data appears in its existing region without celebratory motion or exclamation marks
- Disabled: reduced opacity plus appropriate cursor; text remains readable
- Offline/slow network: preserve the existing deterministic offline route and independent external-source failures

## Content voice

- Tone: concise, precise, calm Korean with English technical terms preserved where useful
- Terminology: `검증`, `미검증 후보`, `관계 논문`, and source labels keep their established meanings
- Microcopy rules: explain the next action directly; no marketing superlatives, exclamation marks, or anthropomorphic error copy

## Implementation constraints

- Framework/styling system: Next.js App Router, React, strict TypeScript, Tailwind v4 import with repository-owned global CSS classes
- Design-token constraints: extend the existing class surface; do not add a second CSS-in-JS or component-library layer
- Performance constraints: no new dependency, external font, runtime image, or animation library; transforms/opacity only for motion
- Compatibility constraints: preserve static-first data, browser-safe PWA behavior, SEO structure, external-source separation, and network-independent default tests
- Test/screenshot expectations: lint, typecheck, unit/integration, production build, desktop/mobile E2E, PWA, axe, and SEO must pass; inspect desktop and 390px mobile screenshots for every route family

## Open questions

- None for this redesign. Future dark mode or user-selectable density would require a separate product decision.
