---
id: adr_025_og_atom_ontology
title: ADR-025 — Oil and gas atom ontology (atom-contract 1.7.0, additive)
status: proposed
last_updated: 2026-07-06
applies_to: portfolio
related: [adr_001_atom_architecture, adr_010_atom_graph_traversal, adr_011_atom_identity_across_versions, adr_013_procedure_execution_atoms, adr_015_actor_atoms, adr_017_atom_access_control, adr_020_recorded_instruments_and_restriction_clauses, adr_021_constraint_resolution_and_precedence, _verticals/oil_gas/50_complete_product_plan, _verticals/oil_gas/85_landman_data_model_review, _decisions/2026-07-05_og_vertical_activation, _decisions/2026-07-04_master_map_and_console_unification, _decisions/2026-07-06_branding_hauska_sdk_only, _decisions/2026-07-06_slb_framing_retired_operator_overlay]
owner: nick
---

> **Operator rulings 2026-07-05 (APPLIED at promotion 2026-07-06):** (1) mineral-lease / rrc-lease stay SEPARATE types and ownership-interest stays one discriminated type - RATIFIED. (2) obligation is DOMAIN-NEUTRAL from birth: it ships in the core contract module, not `./og` (Mox and O&G consume the same obligation engine) - applied in Contract mechanics below. (3) interest/DOI accessPolicy default tenant-private - RATIFIED (public map stays chain-fragment-level). (4) Empressa Land remains a working name pending catalog-thesis-check - RATIFIED. Pooled-units question routed to Herbert — ANSWERED 2026-07-06 and APPLIED same day (`_verticals/oil_gas/85a_herbert_review_answers.md`): units are first-class from day one as the `revenue-allocation-unit` type below (one object, two source adapters), the DOI is derived never source, and allocation factors are operator-asserted and method-tagged.

# ADR-025 — Oil and gas atom ontology

## Status

**Proposed** 2026-07-05; **ratified for build 2026-07-06** under the O&G vertical activation decision (`_decisions/2026-07-05_og_vertical_activation.md`, active) and promoted from `_inbox` same day. Build repo: `og-twin` (github.com/empressaioemail-tech/og-twin). Herbert's landman review answers were received and applied 2026-07-06 (`_verticals/oil_gas/85a_herbert_review_answers.md`). The one open pre-freeze item is his OPTIONAL Reeves allocation-vs-pooled ratio pull from RRC permit data (confirms the statewide assumption locally; does not block — the units rev is justified either way). Nothing in this ADR is published or registered yet; every type below is PROPOSED until the freeze.

## Context

The Reeves/O&G vertical activates with the framing: one atom graph, three lenses. The operations lens (the Permian Field Health surface, mockup at `_verticals/oil_gas/assets/permian-field-health.html`) reads wells, wellbores, completions, production, and equipment state. The land lens reads tracts, leases, interests, and the obligations that keep a lease alive. The capital lens reads who owns the revenue stream, composed from the same interests and production. The lease-to-well seam, where production holds a lease and a missed obligation loses one, is the flows-into-land through-line and must be a first-class link, not an application join.

The atom contract is at 1.6.1 on npm (verified live 2026-07-05) with the subpath-export pattern established (`./encumbrances`, `./workspace`, `./read-contract`, `./conformance`, `./export`, `./temporal`), WidthedConfidence as the only representable confidence shape since 1.5.0, the five-value accessPolicy union since 1.2.0, and the stable-ID node-prefix discipline extended by 1.6.0 (`evt_`). The encumbrance family (ADR-020: `recorded-instrument`, `restriction-clause`, `restriction-corpus`, `administrative-rule`; ADR-021: `constraint-resolution`) already models recorded county instruments, which is exactly where an oil and gas mineral lease lives as a title matter. This ADR must reconcile with that family rather than duplicate it.

Entity and field ground truth is `85_landman_data_model_review.md`, including the two facts most likely to be modeled wrong: the word "lease" means two different things (the recorded mineral lease, a title instrument at the county or GLO, versus the RRC lease, a production and regulatory unit), and Texas production reports at the lease level for oil but at the well level for gas.

## Decision

Publish atom-contract **1.7.0** as an **additive minor** introducing a `./og` subpath with the atom types, node prefixes, links, and schemas below. No existing union, required field, or export changes; consumers on `^1.6` are unaffected until they import `./og`. Precedent for additive enum extension within a minor: the fifth accessPolicy value in 1.2.0.

**Package identity at 1.7.0 (branding ruling 2026-07-06):** per `_decisions/2026-07-06_branding_hauska_sdk_only.md`, the package renames `@hauska/atom-contract` → `@empressaio/atom-contract` at the 1.7.0 publish. Existing `@hauska/atom-contract@^1.6` consumers stay green on the old name; consumers adopt 1.7.0 by changing the package name alongside the version bump they already need to import `./og`.

### Contract mechanics (1.7.0)

- New subpath export `./og`, mirroring the `./encumbrances` module pattern (instance interfaces plus Zod schemas plus a common module).
- **Obligation is core, not `./og` (operator ruling 2, applied).** The `obligation` type ships in the core contract module (alongside the encumbrance family), domain-neutral from birth: Mox facility obligations and O&G lease obligations consume the same shape and the same derivation pattern. The `./og` module consumes and anchors it (to `mineral-lease`); it does not define it. The `oblg_` prefix registers with the core prefix set.
- New node-type prefixes registered additively: `well_`, `wbore_`, `cmpl_`, `zone_`, `pad_`, `mlease_` (mineral lease), `rrclease_`, `tract_`, `intr_`, `oblg_` (core), `prodts_`, `equip_`, `unit_` (revenue-allocation unit, Herbert rev). Stable-ID discipline per ADR-011 and the 1.6.0 `deriveEvtNodeId` pattern, with one deliberate exception: where a public identifier is itself the stable global key, the DID embeds it legibly rather than hashing it. `well_<api14>` is the canonical well DID (API-14 identity; API-10 derivable). `rrclease_<district>-<leaseNo>` and `tract_<county>-<abstract>` follow the same rule. Entities without a global public key (interests, obligations, streams) derive hashed IDs from `(source, externalId)`.
- Additive extension of the ADR-020 `INSTRUMENT_TYPES` union with `oil-gas-lease`, `mineral-deed`, `assignment`, `division-order`, and the recorded unit family per `85a`: `unit-designation`, `declaration-of-pooling`, `ratification-of-unit`, `amendment-of-unit-designation`, `release-of-unit`. The recorded mineral lease instrument is a `recorded-instrument`, not a new recording type (reconciliation below); ratifications are load-bearing (pooling often binds an owner only once ratified).
- Every confidence field is `WidthedConfidence` (no bare scalars are representable); every atom carries source citation, `extractedAt`/`asOf` timestamps, and `accessPolicy` from the existing five-value union. At activation the entire domain is uncalibrated: every confidence ships `provenance: "asserted"` with its source named, per commitment 2's honest fallback. Nothing below claims calibrated confidence exists for O&G today.

### The asset spine (operations lens anchors)

**`well`** — the asset anchor.

- `wellDid` (`well_<api14>`), `apiNumber14` (identity), `wellName`, `wellNumber`
- `wellType`: `oil` | `gas` | `injection` | `disposal` | `dry` | `plugged`
- `status`, `spudDate?`, `completionDate?`, `totalDepth?`
- `surfaceLocation`, `bottomholeLocation?` (geo, datum named)
- `fieldRef?` (RRC field name and number), `district`
- `sourceCitation` (RRC/NM OCD record refs), `accessPolicy`: `public-free` (public regulatory record)
- Composition: `wellbores: many`. Links: `located-on` → `tract`; `assigned-to` → `rrc-lease` (oil wells; the reporting split); operatorship links below.

**`wellbore`** — one drilled hole including sidetracks; the 3D lens reads this.

- `wellboreDid`, parent `wellDid`, `sidetrackSequence`
- `directionalSurveyCid?` (CID of the survey dataset; RRC directional/W-2 sourced; the master-map 3D lateral extension renders from this reference, which is the ontology's contract with the visualization layer)
- `lateralPathRef?` (derived geometry CID), `kickoffDepth?`, `measuredDepth?`
- `accessPolicy`: `public-free` when RRC-sourced; `tenant-private` when the survey is operator-supplied and not of record.
- Composition: `completions: many`.

**`completion`** — perforated and completed intervals on a wellbore.

- `completionDid`, parent `wellboreDid`, `completionDate`
- `perforatedIntervals[]`: `{ topDepth, bottomDepth, zoneDid? }`
- `sourceCitation` (W-2/G-1), `accessPolicy`: `public-free`
- Links: `produces-from` → `zone` (this is what ties production to geology).

**`zone`** — formation or interval.

- `zoneDid`, `formationName`, `tops?` (public skeleton from the state geological survey)
- `accessPolicy`: `public-free` for the skeleton. Detailed geology, logs, and interpretations are separate tenant-private overlay atoms referencing the same `zoneDid`; they never enrich the public zone atom in place.

**`pad`** — derived surface grouping of wells at a site.

- `padDid`, `wellDids[]`, `surfaceLocation`, `derivationMethod`
- Explicitly a derived entity (we compute it; no public record asserts it). Confidence on the grouping is asserted with the derivation method named. `accessPolicy`: `public-free`.

### Production (the revenue through-line, both lenses)

**`production-timeseries`** — one atom per stream, where a stream is `(anchor, product, source)`.

- `streamDid`, `anchorKind`: `rrc-lease` | `well`, `anchorDid`
- `product`: `oil` | `gas` | `water` | `injection`
- `granularity`: `monthly` | `daily`, `sourceAdapter` (RRC PDQ/EBCDIC, NM OCD, SCADA/historian connector id)
- Observations are append-only period records (period, volume, unit, reportedAt) carried on the atom's history layer or as period-payload CIDs; the storage shape is an open implementation question below, because atom volume pressure is real.
- **The reporting split is modeled, not smoothed over.** Texas oil production is reported monthly at the RRC lease level; gas is reported at the well level. RRC-sourced oil streams therefore anchor to `rrc-lease`, gas streams to `well`. Any well-level oil figure is an **allocation**, emitted as a separate derived stream (`derivationMethod` named, asserted confidence, `derives-from` link to the lease-level stream per ADR-010) and never presented as reported fact.
- **accessPolicy split, load-bearing:** RRC and state-regulator monthly streams are `public-free`. Operator telemetry (daily SCADA/historian-sourced streams) is `tenant-private`, never pooled, per the tenant-sovereignty rule. Same atom type, two policies, enforced at the gate.

**`equipment-state`** — artificial lift and surface equipment condition (operations lens).

- `equipmentDid`, `wellDid`, `equipmentKind`: `rod-pump` | `esp` | `gas-lift` | `plunger-lift` | `surface-facility` | `other`
- `stateSnapshot` (typed, kind-specific), `telemetryStreamRefs[]`, `asOf`
- `accessPolicy`: `tenant-private` (operator-overlay data per `_decisions/2026-07-06_slb_framing_retired_operator_overlay.md`; we are the reasoning layer over it, never the sensing layer).
- Honesty boundary, restated from `40_chris_app_overlay.md`: anomaly scoring and any field-health index are **not** in this ADR and are not built. This type carries state and provenance; the scoring analytics that would consume it is net-new downstream work and is never shown as running.

### The land leg, reconciled with ADR-020

**Reconciliation, stated explicitly: the recorded mineral lease is a `recorded-instrument` (ADR-020), not a new recording type. The lease as a managed living asset is a new atom, `mineral-lease`, which references its evidencing instruments.** ADR-020 already models the county-recorded instrument (recording info, source document CID, issuer actor, amendment chains); duplicating that for O&G would fork the county-records capability the property side already runs on. But a `recorded-instrument` is a document event, and a landman's lease is an asset with a life: parties, term, royalty, clauses, obligations, held-by-production status. That life does not belong on the instrument atom, so `mineral-lease` is new and `evidenced-by` links it to one or more `recorded-instrument` atoms (the lease or its memorandum, assignments, releases, amendments). `restriction-clause` is not reused for lease clauses: its semantics are restriction and constraint (legalWeight, `constrains` edges, ADR-021 precedence), while lease clauses are obligation-generating terms. v1 carries structured clause extracts inline on `mineral-lease`; clause-level atomization is an open question below.

**`mineral-lease`** — the title-instrument lease a landman manages.

- `leaseDid` (`mlease_`), `lessorActorDids[]`, `lesseeActorDid` (ADR-015 actor-records)
- `evidencedByInstrumentDids[]` → `recorded-instrument` (at least one; the wet-document trail is mandatory, matching ADR-020's belt-and-suspenders rule)
- `primaryTerm`, `effectiveDate`, `royaltyFraction`, `bonusPerAcre?`
- `clauseExtracts?` (typed: shut-in terms, Pugh, continuous development, depth severance; each extract carries `confidence` + `sourceCitation` into the instrument and page)
- `tractDids[]` (lands covered), `status`: `active` | `expired` | `released` | `hbp` | `disputed` — status is engine-derived, see the obligation section
- `accessPolicy`, two-layer: a skeleton built purely from the public record (recorded instruments, GLO records) is `public-free`; a tenant's enriched lease record (full terms from their files, their clause work, their status determinations) is `tenant-private` overlay on the same `leaseDid`. Many leases are recorded only as memoranda, so full terms are frequently private by nature; the model does not pretend otherwise.

**`rrc-lease`** — the regulatory production unit. A different thing with the same name, kept as a separate type on purpose (per `85`, this conflation is a common place people get the numbers wrong).

- `rrcLeaseDid` (`rrclease_<district>-<leaseNo>`), `leaseNumber`, `leaseName`, `district`, `fieldRef`
- `operatorActorDid` (current; history via operatorship links), `wellCount`, `status`, `acreage?`
- `accessPolicy`: `public-free`
- Links: `regulatory-expression-of` → `mineral-lease` (zero or more; the mapping is many-to-many in the real world and each mapping edge carries its own confidence and derivation, because connecting the two lease worlds is inference, not record).

**`tract`** — the land the interests attach to.

- `tractDid` (`tract_<county>-<abstract>` where abstract-keyed; hashed derivation otherwise), `legalDescription`, `plssOrSurveyRef`, `abstractNumber?`, `county`, `state`, `acreage?`
- `accessPolicy`: `public-free`
- Links: `subject-to` → `recorded-instrument` (the same graph shape ADR-020 gives `parcel-record`); `coincides-with` → `parcel-record` where a county parcel maps (open question below); `covered-by` ← `mineral-lease`.

**`ownership-interest`** — single type with discriminator, following the ADR-015 single-type precedent rather than sibling types per interest kind.

- `interestDid`, `interestType`: `mineral` | `royalty` | `overriding-royalty` | `working` | `surface` | `npri`
- `ownerActorDid` (ADR-015; mineral and royalty owners enter the graph as actor-records)
- `anchor`: `tractDid` and/or `leaseDid` (mineral interests attach to the tract; working interests and overrides attach to the lease)
- `decimalInterest` (and/or fraction), `burdens?`, `effectiveFrom`, `effectiveTo?`
- `derivedFromInstrumentDids[]` — the run-sheet chain. The interest is a **conclusion reasoned from recorded instruments**, so it carries the full quality gate: `confidence` (widthed, asserted at launch), `sourceCitation` per link in the chain, and `gaps[]` where the record is broken. Per `85`, the system assembles the chain and shows the holes; it never asserts a clean answer over a broken record, and the legal title opinion stays with counsel.
- `accessPolicy`: `tenant-private` by default (operator ruling 3). The recorded instruments underneath are public; the assembled determination (run sheet, division of interest) is the tenant's work product.

**`obligation`** — what keeps a lease alive; the first job the product does. (Core contract type per ruling 2; anchored here by `./og`.)

- `obligationDid`, `obligationType`: `delay-rental` | `shut-in-royalty` | `minimum-royalty` | `bonus` | `rental` | `lease-expiration` | `continuous-development` | `pugh-release` | `other`
- `anchorDid` (required, DOMAIN-NEUTRAL — the core type must not freeze a lease-specific field name; O&G anchors obligations to `mlease_` DIDs, other verticals anchor to their own asset DIDs) + `anchorKind?` (free-form domain hint, e.g. `mineral-lease`, `facility`), `owedToActorDid?`, `owedToInterestDid?`
- `dueDate`, `recurrence?`, `amount?`, `graceTerms?`
- `status`: `upcoming` | `due` | `satisfied` | `delinquent` | `released` — **derived, never hand-asserted.** Each status derivation is an engine run recorded as a `procedure-execution` atom (ADR-013): `inputAtomCids` name the lease clause extracts and, for shut-in and HBP determinations, the `production-timeseries` streams consulted; `outputAtomCids` name the obligation whose status changed. Payments and cures are events on the obligation's history layer, chaining to the actor who recorded them. The audit trail for "why does the system say this lease is safe" is therefore a graph walk, which is commitment 1 rendered as product.
- `accessPolicy`: `tenant-private` (a tenant's book; the field named in `85` as the thing a real book must never miss).

### The revenue-allocation unit (Herbert review, applied 2026-07-06)

**`revenue-allocation-unit`** — the single first-class object defining how production revenue allocates across tracts for a well or well set. Per `85a`: "the unit must be a node by nature," but the cleaner architecture is not a county-records node — it is one type with two source adapters, discriminated by `basis`. Statewide since 2022 the RRC granted just under 5,000 allocation-well permits versus fewer than 600 PSA permits, so the dominant source in the Permian is the RRC plat, not a county pooling instrument.

- `unitDid` (`unit_`), `basis`: `pooled-unit` | `allocation-well` | `psa`
- `wellDids[]`, `operatorActorDid`, `effectiveFrom`, `effectiveTo?`
- `tractParticipations[]`: `{ tractDid, factor, allocationMethod, source }` — the factor is ALWAYS operator-asserted and method-tagged (`allocationMethod`: `stated-fraction` | `acreage` | `lateral-length` | `take-points` | `acre-feet` | `oil-in-place` | `other`), never ground truth. The legal instability is structural (the lateral-length method traces to Browning Oil v. Luecke, a lower-appellate opinion that did not involve an allocation well; Opiela settled January 2025 without resolving the RRC's permitting authority), so the model carries disputes rather than assuming a canonical value.
- `basis: pooled-unit` — sourced from the recorded unit family: `sourceInstrumentDids[]` → `unit-designation` / `declaration-of-pooling` / amendments / releases. **Ratification is load-bearing:** pooling is often not binding on a given owner (NPRIs, leases lacking pooling authority) until ratified, so the type carries `ratificationInstrumentDids[]` and per-tract ratification gaps rendered as gaps (the Opiela evidentiary pattern: unit + ratifications from at least 65 percent in interest per tract).
- `basis: psa` — a production sharing agreement unit. PSAs are frequently unrecorded private agreements: `sourceInstrumentDids[]` is OPTIONAL for this basis (populated when a memorandum or the PSA itself is of record); otherwise the unit carries an operator-asserted `sourceNote` naming what the assertion rests on. Never require a recorded instrument that structurally may not exist.
- `basis: allocation-well` — sourced from the RRC W-1 allocation attachment plus the as-drilled plat ("Final As-Drilled Allocation Well Location"): `sourcePlatCid`, per-tract take points and productive-lateral footage. The geometric factor is lateral length of productive wellbore per tract over total productive lateral length; surface acreage is generally not a factor. No county instrument exists for these wells; **absence of county pooling instruments for a horizontal well is a signal (likely allocation or standalone; confirm at RRC), never "missing data."**
- `accessPolicy`: `public-free` (public-record sources), with operator-asserted tagging carried on every factor.
- **The DOI is derived, never source.** The revenue decimal an owner is paid = allocation factor × net mineral interest × lease royalty, computed as an engine run (procedure-execution, ADR-013) over the ownership graph plus this unit object. An obtained operator DOI or signed division order enters as an external assertion linked by a **`reconciles-with` edge** to the computed value; discrepancies surface as disputes, never silent overwrites. There is no authoritative public per-well DOI feed; do not model one.

### Actors: no new types

Operators, purchasers, transporters, lessors, lessees, mineral owners, and working-interest partners are all `actor-record` atoms per ADR-015 (mostly `actorType: organization` or `person`), not new O&G types. O&G regulatory identity (RRC P-5 number, NM OGRID, P-4 purchaser/transporter codes) is carried as structured identity fields on the actor-record, additively. **Operatorship is time-bounded:** `operates` links from actor-record to `well` or `rrc-lease` carry `effectiveFrom`/`effectiveTo`, sourced from P-4 transfers, which are themselves `evt_` atoms (1.6.0 temporal family) so the model always knows who operated a given asset in a given year. Per `85`, that operator history is one of the most valuable things the graph builds.

### How the links express the three lenses on one graph

| Seam | Links |
|---|---|
| Asset spine (operations) | `well` composes `wellbore` composes `completion`; `completion` `produces-from` `zone`; `pad` groups `well`; `equipment-state` attaches to `well` |
| Land chain | `tract` `subject-to` `recorded-instrument`; `mineral-lease` `evidenced-by` `recorded-instrument`, covers `tract`; `ownership-interest` `derives-from` instruments, anchors to `tract`/`mineral-lease`; `obligation` anchors to `mineral-lease` |
| The flows-into-land seam | `well` `located-on` `tract`; `well` `assigned-to` `rrc-lease`; `rrc-lease` `regulatory-expression-of` `mineral-lease`; `production-timeseries` anchors to `rrc-lease`/`well` and feeds the engine's HBP and shut-in determinations, which write `obligation`/`mineral-lease` status via procedure-execution runs |
| Revenue allocation | `revenue-allocation-unit` `participates` → `tract` (factor, method, source); `allocates` → `well`/`production-timeseries`; sourced `evidenced-by` → `recorded-instrument` (pooled) or `sourcePlatCid` (allocation); computed owner decimals via procedure-execution; external DOIs attach by `reconciles-with` |
| Capital lens | reads `ownership-interest` + `revenue-allocation-unit` + `production-timeseries` + `obligation` through the same graph; no capital-specific atom types are introduced by this ADR (valuation and deal atoms are `50` Domain 7 work, out of scope here) |

One graph. The lens is a query and a rendering allocation (the O&G LAYER_REGISTRY families per the 2026-07-04 master map decision), never a copy.

## Alternatives considered

**Extend the encumbrance family to cover the whole land leg.** Rejected. A mineral lease held by production with delay rentals due is an asset with a lifecycle, interests, and obligations, not a restriction on a parcel; forcing it into `restriction-clause`/`constraint-resolution` semantics breaks both domains. The recording layer is shared (that is the reconciliation); the asset layer is new.

**One `lease` type covering both the mineral lease and the RRC lease.** Rejected, deliberately, per `85`: they are different objects (title instrument versus regulatory production unit) that connect by inference. Collapsing them is the canonical way to get production and obligation numbers wrong.

**Sibling types per interest kind (mineral-interest, working-interest, royalty-interest as separate registrations).** Rejected for v1 per the ADR-015 precedent: one discriminated type queries and renders uniformly; revisit if the discriminator produces materially worse downstream code.

**Per-lens atom sets (operations atoms, land atoms, capital atoms as separate registries).** Rejected. It is the exact failure the one-graph framing exists to prevent: three products instead of one, with the lease-to-well seam demoted to an ETL job.

**Ship as 2.0.0.** Rejected. Nothing here changes an existing required contract; the subpath pattern plus additive enum extension has three releases of precedent (1.2.0, 1.5.0 subpaths, 1.6.0 temporal). Minor is correct and keeps every `^1.x` consumer green. (The package NAME change at 1.7.0 is a branding move, not a semver event; the old name's last version stays 1.6.1.)

## Consequences

Positive: all three lenses read one graph from day one; the Reeves corpus mint has typed shapes with the quality gate built in; the 3D lateral lens has a contract-level anchor (`directionalSurveyCid`); the encumbrance and county-records machinery is reused, not forked; tenant sovereignty is structural (accessPolicy on every type, telemetry and books never pool); the obligation engine is shared across verticals (Mox + O&G) from birth.

Negative: thirteen new node prefixes and roughly twelve new instance schemas is a real contract-surface increase; production-timeseries volume will pressure storage and index (same class of concern as ADR-013's reversal criteria); the mineral-lease/rrc-lease mapping and interest derivation are inference-heavy, meaning a large asserted-confidence surface until calibration signal accrues; Herbert's review may force field-level rework before freeze (that is what the review is for).

## Open questions, named honestly

1. **Pooled and spacing units. RESOLVED 2026-07-06 (Herbert):** first-class from day one as `revenue-allocation-unit` (section above) — one object, two source adapters, never a county-records-only node. Residual: Herbert's optional Reeves allocation-vs-pooled ratio pull (confirms locally; non-blocking).
2. **Allocation wells crossing tracts. SUBSTANTIALLY RESOLVED by the same object:** the allocation basis is the RRC as-drilled plat + W-1 attachment, factor operator-asserted and method-tagged, disputes carried. Residual: contested-method wells (take-points/acre-feet arguments) render as competing assertions, and the UI must show them as such.
3. **Unit agreements and JOAs. RESOLVED-DEFERRED (Herbert):** JOAs govern the working-interest side (cost sharing, non-consent, operator designation), not the royalty/revenue-ownership grain — deferred at v1 with named roadmap exceptions (non-consent economics, operator-of-record identity); usually unrecorded, so low county-ingest yield regardless. Commingling permits likewise defer as a measured-volume precision layer, not an ownership object.
3a. **County-ingest reality note (binding on the title slice and county adapter):** Reeves records are online (reeves.tx.publicsearch.us) but indexed by grantor/grantee NAME only — no parcel key. The parcel/tract-to-instrument link is reconstructed by OCR plus legal-description parsing (abstract/survey, block/section, metes and bounds) joined via survey geometry; the county's document-type label is a hint of variable reliability, never a trusted field.
4. **Commingled leases and off-lease production.** Named in `85` as edge cases to expect on the reporting split; unmodeled until the landman review returns.
5. **Lease clause atomization.** v1 carries clause extracts inline on `mineral-lease`. If obligation derivation or citation UX needs clause-level addressing, a `lease-clause` type (shaped like `restriction-clause` but obligation-semantic) is the follow-on; do not silently reuse `restriction-clause`.
6. **Timeseries storage shape.** Period records on the history layer versus period-payload CIDs versus a cold-tier store with hot pointers; same tension as ADR-013's volume concern. Decide at engine implementation with measurement, not in the contract.
7. **`tract` versus `parcel-record`.** In Reeves the surface parcel and the O&G tract overlap imperfectly (abstract/survey versus assessor parcel). v1 keeps `tract` separate with a `coincides-with` link; unification is a future ADR if the link proves to be identity in practice.
8. **New Mexico identity.** DIDs above key on Texas identifiers (district/lease number, abstract). SE New Mexico (OGRID, OCD) is in the expansion path and needs an identity-scheme extension before any NM mint; not blocking Reeves.
9. **GLO state acreage.** State leases route through the General Land Office, not the county clerk; the `recorded-instrument` recording block handles it nominally but the adapter reality is unverified.
10. **`division-order` placement.** Proposed above as an INSTRUMENT_TYPES value; whether it instead deserves asset-layer treatment (it operationalizes interests for payment) is open.

## Reversal criteria

Revisit if Herbert's review invalidates the entity split structurally (in particular the mineral-lease/rrc-lease separation or the interest anchoring), in which case rev this ADR before the Reeves corpus mints at scale; if production-timeseries atom volume blocks the index (fallback per ADR-013: cold-tier store with hot-tier pointers); or if the pooled-unit answer (open question 1) cannot be expressed additively, in which case 1.8.0 carries the unit family rather than forcing it into this shape.

## References

- [`adr_020_recorded_instruments_and_restriction_clauses.md`](adr_020_recorded_instruments_and_restriction_clauses.md) — the recording layer this ADR reuses
- [`adr_013_procedure_execution_atoms.md`](adr_013_procedure_execution_atoms.md) — obligation status derivation audit
- [`adr_015_actor_atoms.md`](adr_015_actor_atoms.md) — operators, owners, counterparties
- [`adr_017_atom_access_control.md`](adr_017_atom_access_control.md) — the five-value accessPolicy split carried on every type
- [`../_verticals/oil_gas/85_landman_data_model_review.md`](../_verticals/oil_gas/85_landman_data_model_review.md) — entity/field ground truth under review
- [`../_decisions/2026-07-04_master_map_and_console_unification.md`](../_decisions/2026-07-04_master_map_and_console_unification.md) — 3D subsurface and O&G layer families
- atom-contract CHANGELOG 1.2.0–1.6.1 — additive-minor precedent and the WidthedConfidence/subpath conventions this ADR follows
