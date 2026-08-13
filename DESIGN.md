# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-08-13
- Primary product surfaces: Today, local-only dictionary search, term detail, topic index/detail, paper relation detail, PWA install/update, offline and not-found states
- Evidence reviewed: `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `app/**/*.tsx`, `components/**/*.tsx`, `app/globals.css`, current production desktop/mobile captures in `output/playwright/redesign-baseline-*`, and the G005-G008 browser/accessibility constraints
- Direction: tactile paper technical minimalism adapted for PaperWords, retaining Apple-like restraint without copying Apple trade dress.
- Selected visual preset: archived `light-mode-paper-technical`, narrowed to warm paper layers, a charcoal desk frame, one ink-blue accent, native typography, and quiet motion

## Brand

- Personality: calm, exact, scholarly, tactile, modern, trustworthy
- Trust signals: verified/local labels, restrained ink color, visible source relationships, paper-like material continuity, stable typography and spacing
- Avoid: newspaper imitation, dirty vintage distressing, heavy serif dominance, multiple competing rail colors, loud AI gradients, ornamental glass, dense borders, oversized badges, or visual cues that imply runtime network enrichment

## Product goals

- Goals: make one daily concept immediately readable; make bilingual search feel fast and obvious; keep evidence available without competing with the explanation; make the PWA feel native and composed on Apple devices while remaining cross-platform
- Non-goals: changing search ranking, content, schedule, local-only source policy, PWA behavior, or route architecture
- Success signals: every route has one clear primary heading/action; users can scan the main explanation before metadata; desktop and 390px mobile have no horizontal overflow; existing accessibility, SEO, PWA, and behavior gates stay green

## Personas and jobs

- Primary personas: Korean-speaking AI/CS learners, researchers, and engineers reading papers
- User jobs: understand an English technical term in Korean; find a term by English, acronym, or Korean; inspect important papers and provenance; use the same trusted corpus online and offline
- Key contexts of use: focused desktop reading, mobile lookup while reading a paper, intermittent/offline PWA use

## Information architecture

- Primary navigation: PaperWords home, Dictionary, Topics
- Core routes/screens: `/`, `/dictionary`, `/terms/[slug]`, `/topics`, `/topics/[slug]`, `/papers/[id]`, `/~offline`
- Content hierarchy: page purpose → English headword/title → Korean meaning and explanation → primary action → related terms/papers → source and schedule metadata
- Dictionary results end with the local published corpus; there is no secondary remote-candidate section.

## Design principles

- One focus per surface: the daily term, query, term title, topic, or paper title is the visual anchor.
- Evidence is calm but reachable: metadata uses grouped secondary surfaces and never disappears.
- Material before ornament: warmth, grain, paper edges, inset rules, and shadow depth should make surfaces feel physical without reducing legibility.
- Color is semantic and scarce: ink blue means action/link/focus; warm warning color is reserved for error states.
- Native before decorative: use local/system fonts, deterministic CSS texture, and existing assets so offline behavior and performance remain deterministic.
- Air over ornament: hierarchy comes from spacing, type scale, weight, paper layering, and measured rules rather than illustrations.
- Tradeoff: this direction restores paper material and technical corner marks without restoring the former topic-specific edge/quantization rail colors.

## Visual language

- Color: charcoal desk `#272720`, warm canvas `#eee6d7`, ivory paper `#fbf6eb`, primary ink `#28251f`, AA-safe secondary `#655f55`, warm separators, ink-blue interaction `#1b628f`, pale blue selection, and parchment amber for error semantics
- Typography: `-apple-system`, BlinkMacSystemFont, SF Pro fallbacks, Apple SD Gothic Neo, Helvetica Neue; long explanations may use native New York/Iowan/AppleMyungjo serif fallbacks; large headings use 600–700 weight and tight tracking; metadata uses SF Mono fallbacks and tabular figures; no network font dependency
- Spacing/layout rhythm: 4px base with 8/12/16/24/32/48/64/96 steps; content max width around 1120px; reading text max 66 characters
- Shape/radius/elevation: 18–22px for major paper sheets, 10–14px for grouped content, 8–10px for controls; thin warm rules, inset paper edges, restrained technical corner marks, and soft directional sheet shadows
- Motion: 180–500ms transform and color transitions with native-feeling easing; entrance motion never fades readable content; no layout animation; reduced-motion mode removes nonessential motion
- Imagery/iconography: no stock imagery or network dependency; deterministic inline CSS grain and fine fiber patterns create the paper material, while the restrained PW monogram and typography carry the identity

## Components

- Existing components to reuse: `AppShell`, `SearchBox`, `TodayTermPanel`, `TermTitleBlock`, `CompactDictionaryEntry`, `PaperRelationList`, `SourceStampList`, `TopicChip`, `PwaControls`
- New/changed components: existing shell, cards, search surfaces, evidence rails, offline state, and PWA chrome receive shared paper-material tokens and technical corner details; route semantics and component structure remain unchanged
- Variants and states: primary/secondary buttons; compact/full search; verified local results; empty, error, disabled, offline, install, and update
- Token/component ownership: visual tokens and component styles live in `app/globals.css`; route semantics stay in existing React components

## Accessibility

- Target standard: WCAG 2.1 AA for tested routes
- Keyboard/focus behavior: retain skip link and DOM order; all links, buttons, and fields receive a visible blue focus ring; touch targets are at least 44px where practical
- Contrast/readability: primary and secondary text meet AA on their assigned paper surfaces; body copy remains at least 16px with generous line height; texture opacity stays below the level that competes with text
- Screen-reader semantics: retain existing headings, landmarks, labels, live regions, language spans, and source relationships
- Reduced motion and sensory considerations: honor `prefers-reduced-motion`; color never carries verification or state meaning alone

## Responsive behavior

- Supported breakpoints/devices: wide desktop, tablet below 920px, compact/mobile below 640px; minimum validated width 390px
- Layout adaptations: the charcoal outer frame becomes edge-to-edge warm paper on compact screens; two-column Today/detail grids collapse to one column; sticky evidence rails become normal flow; topic grids become one column; search buttons become full width
- Touch/hover differences: hover polish applies only on hover-capable devices; pressed state uses subtle scale; navigation and controls retain comfortable touch spacing

## Interaction states

- Loading: route navigation remains browser-native; install and update controls retain stable inline status without layout shift
- Empty: grouped quiet surface with direct next-step copy
- Error: inline pale warning surface; no alert dialog
- Success: data appears in its existing region without celebratory motion or exclamation marks
- Disabled: reduced opacity plus appropriate cursor; text remains readable
- Offline/slow network: preserve the deterministic offline route and locally cached dictionary shell

## Content voice

- Tone: concise, precise, calm Korean with English technical terms preserved where useful
- Terminology: `검증`, `로컬 콘텐츠`, `관계 논문`, and source labels keep their established meanings
- Microcopy rules: explain the next action directly; no marketing superlatives, exclamation marks, or anthropomorphic error copy

## Implementation constraints

- Framework/styling system: Next.js App Router, React, strict TypeScript, Tailwind v4 import with repository-owned global CSS classes
- Design-token constraints: extend the existing class surface and centralize material variables in `app/globals.css`; do not add a second CSS-in-JS or component-library layer
- Performance constraints: no new dependency, external font, runtime image, or animation library; paper grain must be a small deterministic inline data image plus CSS gradients, and transforms/opacity remain the only motion properties
- Compatibility constraints: preserve local-only static data, browser-safe PWA behavior, SEO structure, passive citation links, and network-independent tests
- Test/screenshot expectations: lint, typecheck, unit/integration, production build, desktop/mobile E2E, PWA, axe, and SEO must pass; inspect desktop and 390px mobile screenshots for every route family

## Open questions

- None for this redesign. Future dark mode or user-selectable density would require a separate product decision.
