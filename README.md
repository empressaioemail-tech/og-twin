# og-twin

The Reeves County twin visualization layer — the operations lens over the atom graph, per the 2026-07-05 O&G vertical activation decision.

## What this repo IS

**og-twin** is the Reeves County field health visualization layer that consumes atom contract data via a typed data-adapter seam. It demonstrates the "three lenses, one graph" architecture: the same wells, production streams, and interests feed operations (this layer), land, and capital views without duplicating the corpus.

This is NOT a general-purpose Permian Basin dashboard. It is the **Reeves-scoped twin** built to prove the activation thesis: RRC public data + operator overlay + atom-contract fixtures render field health without siloed copies.

## Architecture: The Data-Source Seam

All data the UI consumes flows through the `TwinDataSource` interface:

```typescript
interface TwinDataSource {
  readonly sourceId: 'synthetic' | 'seeded';
  getWells(): Well[];
  getClusters(): Cluster[];
  getTimelineEvents(): TimelineEvent[];
  getCauseBreakdown(): CauseBreakdown[];
  getFieldOverview(): FieldOverview;
  getWellLogCorrelationData(): WellLogCorrelationData;
  getKnowledgeGraphNodes(): Array<{id: string; type: string; label: string}>;
}
```

### Two Implementations

1. **`SyntheticDataSource`** (default in `?source=synthetic` mode)
   - The mockup's existing basin-wide generators, moved verbatim
   - Produces ~1200 synthetic wells across 16 clusters
   - Default for the original mockup flow

2. **`SeededReevesDataSource`** (default in `?source=seeded` mode, **THIS IS THE DEFAULT**)
   - Loads JSON fixtures from `fixtures/` — 30 Reeves County wells
   - Fixtures conform to `@empressaio/atom-contract@1.7.0` schemas (`./og` subpath)
   - Real-format API-14 DIDs: `42-501-30001` through `42-501-30030`
   - Production timeseries at RRC lease level (oil) and well level (gas) per ADR-025
   - Equipment state atoms tagged `tenant-private` (operator overlay)

### The Mapping Layer (`src/data/mapping.ts`)

The mapping layer converts atom contract types → view-model shapes the UI consumes:

```typescript
mapWellAtomToViewModel(wellAtom, productionStreams, equipmentState) → Well
```

**This mapping IS the future BFF client contract.** Both sides are typed; changes surface at compile time. The BFF will replace `SeededReevesDataSource` without touching the view layer.

## Honesty Labeling (Binding Guardrail)

The panels that public RRC data **cannot** feed are visibly labeled when the seeded source is active:

- **Equipment health**
- **Sensor confidence**
- **Well communication**
- **Pressure instability**

These are operator-overlay data (SCADA/telemetry), sourced from `equipment-state` atoms with `accessPolicy: tenant-private`. The seeded source logs this requirement; the full UI would render small badges: `OPERATOR OVERLAY — seeded`.

**Anomaly scoring is never presented as a live computed capability.** Field health indices that require calibration (not present in v1 fixtures) are not shown.

## Runtime Toggle

Query param `?source=seeded|synthetic` switches data sources. Default: **`seeded`**.

- `?source=seeded` → Reeves County fixtures (30 wells, real API-14 DIDs, Reeves-area clusters)
- `?source=synthetic` → Mockup generators (basin-wide, 1200+ synthetic wells)

Both sources pass through the same `TwinDataSource` interface, so the two are directly comparable.

## Fixtures Inventory

**Location:** `fixtures/reeves-wells-*.json`

**Total:** 30 wells across 3 fixture files

**Structure per file:**
```json
{
  "wells": [ ... ],
  "productionTimeseries": [ ... ],
  "rrcLeases": [ ... ],
  "revenueAllocationUnits": [ ... ],
  "equipmentStates": [ ... ]
}
```

**Well naming:** Real-format Reeves County wells:
- `STATE REEVES A 1H` through `STATE REEVES A 12H` (Pad A, North Reeves)
- `STATE REEVES B 1H` through `STATE REEVES B 8H` (Pad B, Central Reeves)
- `STATE REEVES C 1H` through `STATE REEVES C 4H` (Pad C, East Reeves)
- `STATE REEVES D 1H` through `STATE REEVES D 4H` (Pad D, West Reeves)
- `STATE REEVES E 1H` through `STATE REEVES E 2H` (Pad E, Northeast Reeves)

**API-14 format:** `42-501-30001` through `42-501-30030` (Texas state code 42, Reeves County code 501)

**Geographic scope:** Reeves County, Texas (Permian Basin)
- Longitude: -103.540° to -103.705°
- Latitude: 31.635° to 31.790°

**Confidence:** All atoms carry `WidthedConfidence` with `provenance: "asserted"` per the ADR's honest fallback (uncalibrated at activation).

**Access policy split:**
- Wells, RRC leases, allocation units: `public-free` (RRC public record)
- Equipment state: `tenant-private` (operator overlay)
- Production streams: `public-free` when RRC-sourced, `tenant-private` when SCADA-sourced

## What Remains Synthetic vs Seeded vs Future-Live

| Data | Synthetic Source | Seeded Source | Future (BFF) |
|------|------------------|---------------|--------------|
| Wells | Generated basin-wide | 30 Reeves fixtures | RRC W-1 + completions feed |
| Production | Gaussian noise | Fixtures (RRC grain) | RRC PDQ monthly + SCADA daily |
| Equipment health | Synthetic scores | Seeded placeholders | Live SCADA telemetry |
| Sensor confidence | Synthetic | Seeded | Calibration engine output |
| Timeline events | Mock Permian events | Reeves-specific events | Real P-4/workover records |
| Cause breakdown | Fixed percentages | Fixed percentages | Derived from event atoms |
| Knowledge graph | Mock 5 nodes | Mock 5 nodes | Full atom graph traversal |

**The seeded source proves the architecture.** It demonstrates that fixtures conforming to the atom contract can feed the UI through the mapping layer. The BFF replaces the JSON file load with live graph queries; the UI stays unchanged.

## How the BFF Will Replace SeededReevesDataSource

1. The BFF exposes REST/GraphQL endpoints that return the same `TwinDataSource` shapes
2. A new `BFFDataSource` class implements `TwinDataSource` by calling those endpoints
3. `src/main.ts` switches from `new SeededReevesDataSource()` to `new BFFDataSource(apiUrl)`
4. **The view layer, mapping layer, and UI code do not change**

The seam is the contract. The typed interface ensures the swap is compile-time safe.

## Development

### Prerequisites

- Node.js 18+ (for pnpm)
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Run dev server (defaults to seeded source)
pnpm dev

# Run with synthetic source
pnpm dev
# Then navigate to http://localhost:5173?source=synthetic

# Run tests
pnpm test

# Build for production
pnpm build
```

### Project Structure

```
og-twin/
├── fixtures/               # JSON fixtures (atom contract schemas)
│   ├── reeves-wells-01.json
│   ├── reeves-wells-02.json
│   └── reeves-wells-03.json
├── src/
│   ├── data/              # Data layer
│   │   ├── TwinDataSource.ts        # Core interface
│   │   ├── SyntheticDataSource.ts   # Mockup generators
│   │   ├── SeededReevesDataSource.ts # Fixture loader
│   │   └── mapping.ts               # Atom → view-model (BFF contract)
│   ├── types/
│   │   ├── atoms.ts                 # Atom contract types
│   │   └── view-models.ts           # UI view models
│   ├── tests/
│   │   └── integration.test.ts      # Fixture validation + reporting split tests
│   ├── main.ts                      # Entry point (source toggle)
│   └── style.css                    # Minimal styles
├── assets/
│   └── permian-field-health.html    # Original mockup (design spec)
├── docs/
│   ├── adr_025_og_atom_ontology.md  # Ratified atom ontology
│   └── 85a_herbert_review_answers.md # Domain ground truth
├── vendor/
│   └── empressaio-atom-contract-1.7.0.tgz # Contract package (unpublished)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md (this file)
```

## Testing

Tests validate:

1. **Fixture conformance:** All atoms parse, required fields present, API-14 format correct
2. **Reporting split rule:** Oil at rrc-lease grain, gas at well grain (ADR-025, load-bearing)
3. **Mapping layer:** Atoms → view-models preserve coordinates, produce valid health metrics

```bash
pnpm test
```

All tests must pass before PR merge.

## Label Swap

**Title scope:** "Reeves County · Permian Basin" (header in UI, scoped from "Permian Field Health")

**Cluster names:** Reeves-area clusters in seeded source:
- North Reeves
- Central Reeves
- East Reeves
- West Reeves
- Northeast Reeves

Synthetic source keeps basin-wide names (Midland Basin core, Andrews/Ector, etc.).

**Well names:** Seeded source uses real-format well names (`STATE REEVES A 1H`). Synthetic source uses `Well #<id>` or `MD 22 <padIndex>H` (the demo anomaly pad).

## License

MIT

## References

- ADR-025: Oil and Gas Atom Ontology (`docs/adr_025_og_atom_ontology.md`)
- Herbert landman review answers (`docs/85a_herbert_review_answers.md`)
- Original mockup spec (`assets/permian-field-health.html`)
- Activation decision: `_decisions/2026-07-05_og_vertical_activation.md` (not in this repo)
