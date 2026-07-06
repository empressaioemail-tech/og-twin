# Task C2 — og-twin scaffold: the Reeves twin viz layer on the Permian Field Health mockup

You are in the og-twin repo (nearly empty: README only). Work directly on `main` is NOT allowed — create branch `feat/c2-scaffold` off main. Push immediately after your FIRST commit, keep pushing, open a PR at the end titled "feat: og-twin scaffold — mockup app + data-adapter layer + seeded Reeves fixtures (C2)". Delete CURSOR_TASK.md before the final commit.

## The product ruling you are implementing (do not deviate)

`assets/permian-field-health.html` is the COMPLETE design spec — a self-contained MapLibre + deck.gl + three.js app. The operator's instruction verbatim: "keep the same look feel flow everything but just change the data labels and feeds coming into it — this is the viz layer showing Reeves county data." So: DO NOT redesign, restyle, or restructure the UX. Your job is architecture underneath it: make the data swappable.

docs/adr-025-og-ontology.md is the ratified atom ontology; docs/85a_herbert_review_answers.md is domain ground truth; vendor/empressaio-atom-contract-1.7.0.tgz is the contract package (unpublished yet — consume via `file:vendor/empressaio-atom-contract-1.7.0.tgz`).

## Build

1. **Vite + TypeScript scaffold** (vanilla-ts or react-ts — choose whatever lets you preserve the mockup's code with the LEAST rewriting; the mockup is vanilla JS + a module script, so vanilla-ts is likely right). pnpm. The mockup becomes the app: split its inline scripts into modules ONLY as far as needed to inject data (keep the CSS and DOM structure byte-faithful where possible; fix the mojibake glyphs — arrows/middle dots/degree signs — to proper UTF-8 where obvious).
2. **Data-adapter seam (the core deliverable).** Extract every synthetic data structure behind one typed interface `TwinDataSource`: clusters/wells (the WELLS generator + NORTH_REEVES_PAD), timeline events, KPI/field-overview numbers, cause breakdown, the well-log correlation dataset (wellLogCorrelationData), and the knowledge-graph dataset. Two implementations:
   - `SyntheticDataSource`: the mockup's existing generators, moved verbatim (default for now so the app runs identically to the mockup out of the box).
   - `SeededReevesDataSource`: loads JSON fixtures from `fixtures/` — atoms conforming to the contract's `./og` schemas (import zod schemas from @empressaio/atom-contract/og and VALIDATE the fixtures in a test). Build ~30 wells' worth of plausible Reeves County seeded data: `well` atoms with real-format API-14 DIDs (deriveWellNodeId from the contract), `production-timeseries` (oil at rrc-lease grain, gas at well grain per the ADR's reporting split), a couple of `rrc-lease` and `revenue-allocation-unit` (allocation-well basis) atoms, P-4/completion-shaped timeline events. Every fixture atom carries asserted-provenance confidence, sourceCitation, accessPolicy per the ADR. A thin mapping layer converts atoms → the mockup's view-model shapes (this mapping IS the future BFF client contract — keep it in `src/data/mapping.ts` and type both sides).
3. **Honesty labels (binding guardrail).** The mockup panels that public RRC data cannot feed — Equipment health, Sensor confidence, Well communication, pressure instability from SCADA, and the Field Health Index — must be visibly labeled in the UI as `OPERATOR OVERLAY — seeded` when the seeded source is active (a small badge/tag consistent with the mockup's existing chip styling; do not redesign the panels). Anomaly scoring is never presented as a live computed capability.
4. **Label swap:** title stays "Permian Field Health"-class UX but scoped: "Reeves County" (e.g. header region line "Reeves County · Permian Basin"). Cluster names in the SEEDED source are Reeves-area (the synthetic source keeps its basin-wide names). "AASTRA Discovery" well-log case study naming may stay as-is in the synthetic source; the seeded source labels its wells by their real-format well names.
5. **Runtime toggle** (query param `?source=seeded|synthetic`, default seeded) so the two sources are directly comparable.
6. **Tests:** fixture validation against the contract schemas (every fixture atom parses), the mapping layer (atom → view-model), and the reporting-split rule (a gas stream anchored to rrc-lease must fail fixture validation). Vitest.
7. **README:** what this repo IS (the Reeves twin viz layer per the activation decision), the data-source seam, how the BFF will replace SeededReevesDataSource without touching the view layer, honest-labeling rules, run instructions.

## Verify

pnpm build green, all tests green, `pnpm dev` serves the app (state that you ran it). PR description: architecture of the seam, fixture inventory, what remains synthetic vs seeded vs future-live.
