---
id: 85a_herbert_review_answers
title: Herbert landman review — answers on units, allocation, DOI, county ingest (received 2026-07-06)
status: active
last_updated: 2026-07-06
applies_to: oil_gas
related: [85_landman_data_model_review, 80_adrs/adr_025_og_atom_ontology, _decisions/2026-07-05_og_vertical_activation]
---

# Herbert review answers (via Nick, 2026-07-06)

Answers to the `85` review packet's pooling/units questions. These are the corrections that fold into ADR-025 before the 1.7.0 freeze. Structured from Herbert's response; load-bearing language preserved.

## 1. Units are first-class from day one

"First class from day one would be best - the unit must be a node by nature." But see the convergence note at the bottom: the right shape is NOT a county-records pooled-unit node; it is a single revenue-allocation object with two source adapters.

## 2. Two different allocation factors; conflating them corrupts the schema

**Geometric/production factor:** lateral length of productive wellbore on each tract divided by total productive lateral length across all tracts. Surface acreage is generally NOT a factor. Verifiable and public: the RRC permit package — Form W-1 application with its allocation attachment and, definitively, the as-drilled plat (labeled "Final As-Drilled Allocation Well Location" on the RRC completions site), which shows the actual wellbore path and the first and last take points on each tract. That plat is the verifiable geometric input.

**Revenue factor:** the decimal an owner is actually paid. Operator takes the lateral-length ratio × owner's net mineral interest in the tract × lease royalty rate. That computation lives in the operator's division of interest and appears on the division order sent to each owner. NOT a filed public document; operators do not always make it transparent or verifiable.

Not PSA exhibits (no PSA in a true allocation well); not "the RRC filing" as a royalty decimal (RRC issues the plat but explicitly disclaims adjudicating owner entitlements). Ingest priority: (1) RRC as-drilled plat + W-1 allocation attachment (public, per well, footage per tract); (2) operator division order / DOI where obtainable (per owner, the asserted decimal).

**Load-bearing caveat:** treat the allocation factor as operator-asserted and method-tagged, never ground truth. The lateral-length method's dominance traces to Browning Oil v. Luecke — a lower appellate opinion, and Luecke did not involve an allocation well. Operators can argue alternative methods (take points, acre-feet, oil in place). The permitting regime's legality is unresolved: Opiela settled January 2025 before the Texas Supreme Court could rule on the RRC's authority to permit allocation and PSA wells without APA-compliant rulemaking. Model the factor with `method` and `source_plat` fields so disputes are carried, not resolved by assumption.

## 3. Division-order interests: reconstructed and derived

DOIs are operator-held, generally not public. No authoritative public feed of a full per-well DOI exists; Texas requires owners to sign division orders before pay status, but only each owner sees their own. **Schema recommendation: model DOI as a derived output, not source data.** Source layer = (a) the ownership graph reconstructed from recorded instruments (leases, deeds, assignments, ratifications) and (b) the allocation basis for the well (tract participation from a recorded Unit Designation, or the lateral-length factor from the as-drilled plat). The DOI decimal is computed from those. An obtained operator DOI or signed division order is an authoritative-but-external assertion reconciled against the computed value — a **reconciliation edge, not a primary-source node**. That mirrors how errors surface in practice (owners recompute and dispute; correcting after signing is harder).

## 4. Minimum pooling-instrument set for a Reeves county-records ingest

Recorded instruments in the Official Public Records that create or modify a unit:
1. **Designation of Pooled Unit / Unit Designation** — creates the unit, defines constituent tracts and participation. Primary object.
2. **Declaration of Pooling / Declaration of Pooled Unit** — same family; naming varies by operator.
3. **Ratification of Unit / Ratification and Joinder** — do NOT skip: a pooling is often not binding on a given owner (especially NPRIs, or owners whose leases lacked pooling authority) until ratified. In Opiela the operator's evidence was a filed pooled unit plus ratifications (or PSAs) from at least 65% in interest of the owners of each tract.
4. **Amendment of Unit Designation** — expands, contracts, re-forms.
5. **Release / Dissolution / Termination of Unit** — unwinds.
Plus adjacent: the recorded oil and gas lease itself (the pooling clause is the authority the unit rests on).

**The important negative case:** allocation wells have NO county pooling instrument — there is no pooling; the footprint exists only at the RRC (permit + plat). A county ingest legitimately finding nothing is a SIGNAL (likely allocation or standalone well, confirm against RRC), not missing data.

**Reeves indexing reality (statewide reality):** records online at reeves.tx.publicsearch.us (e-recording via Simplifile and CSC; clerk in Pecos); taxonomy is standard Texas. The consequential fact: the county indexes by grantor/grantee NAME, not by parcel or geography. You cannot ask the county "what unit instruments touch parcel X." The parcel-to-instrument link is reconstructed by OCR + parsing the legal description (abstract and survey, block and section, metes and bounds) out of the document body, then joining to parcel via survey geometry. This is why vendors exist (CourthouseDirect title-plant products layer a geographic index the county does not offer). Plan the ingest around OCR-plus-parse to reach parcel grain; treat the county's document-type label as a hint of variable reliability, not a trusted field.

## 5. Unit agreements, JOAs, commingling permits at our grain

- **Unit Designation: yes, first-class.** It defines revenue ownership by tract participation — literally "who owns what revenue stream."
- **JOA: deferrable at v1.** Governs the working-interest side (cost sharing, AFEs, non-consent penalties, operator designation), not royalty/mineral revenue-ownership per tract. Roadmap exceptions: non-consent/penalty provisions temporarily alter working-interest net revenue; the JOA identifies operator of record. Usually unrecorded (memorandum at most) — low-yield for county ingest regardless.
- **Commingling permits: defer, flag as a precision layer.** RRC operational filings letting operators combine production before measurement — affects measured-volume allocation accuracy, not ownership shares. Revisit when volume accuracy matters, not ownership fractions.

## Convergence: how this resolves ADR-025 open question 1

The cleaner architecture is not "the unit is a county-records node." It is **a single revenue-allocation object with two source adapters**: one sourced from a recorded Unit Designation (participation by acreage/stated fractions), one sourced from an RRC as-drilled plat (participation by lateral length). Allocation wells produce a unit-like revenue object that never appears in county records at all — and statewide since the start of 2022, the RRC granted just under 5,000 allocation well permits versus fewer than 600 PSA well permits, making allocation wells the dominant horizontal category. This argues for ADR-025 revving to units-first-class BEFORE the Reeves mint rather than shipping units-deferred.

**Open offer from Herbert:** pull the actual Reeves allocation-vs-pooled ratio from RRC permit data to confirm the statewide assumption locally. Recommended: accept (confirms, does not block — the units rev is justified either way).

## Applied

Folded into `80_adrs/adr_025_og_atom_ontology.md` (revenue-allocation-unit type, method/source tagging, DOI-as-derived + reconciliation edge, INSTRUMENT_TYPES unit family, negative-case rule, county-ingest indexing note) 2026-07-06, same day, before the 1.7.0 freeze. Chris provides no further inputs per operator (2026-07-06): the mockup is the complete external spec; all build is internal.
