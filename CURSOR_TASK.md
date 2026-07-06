# Task C2c — Verbatim mockup + injection seam (two ports failed; ZERO restructuring this time)

Same branch, PR #1. Both prior attempts dropped mockup subsystems while "restructuring." This round the architecture forbids it: the mockup ships VERBATIM and the data seam is a small injected bootstrap. Push after every commit; delete CURSOR_TASK.md before final commit; comment on PR #1.

## The recipe — follow it exactly, no creative deviations

1. **index.html = assets/permian-field-health.html VERBATIM.** Copy the file's entire content over index.html with exactly TWO permitted changes: (a) delete the final "DEV: auto-reload on file change" script block (the poller); (b) insert ONE line before the first big inline `<script>`: `<script src="/twin-data.js"></script>`. Nothing else changes in this step. The drilling scene, WLC modal, knowledge graph, group inspector — every inline script — stays byte-identical.
2. **Generate `public/twin-data.js` at build time.** Add a plain Node script (scripts/emit-twin-data.mjs) that imports your EXISTING SeededReevesDataSource + mapping.ts (they're TS — use tsx or compile via the existing toolchain; pick the least machinery) and writes `public/twin-data.js` containing:
   `window.__TWIN_DATA__ = { wells: [...], clusters: [...], timelineEvents: [...], causeBreakdown: [...], regionLabel: "Reeves County · Permian Basin", overlayPanels: ["equipment_health","sensor_reliability","well_communication","pressure_anomaly"] };`
   Shapes must match what the mockup's own generators produce (your mapping.ts already targets these view-models). Wire it into package.json: `prebuild` and `pretest` run it. Also emit a `window.__TWIN_SOURCE__` default of 'seeded' with URL-param override logic INSIDE twin-data.js (read location.search for ?source=synthetic).
3. **Surgical splice points — the ONLY edits inside the mockup's inline script.** Each is a guarded one-line pattern; make exactly these and no more:
   - Where `const WELLS = []` finishes being populated (after the NORTH_REEVES_PAD block): add `if (window.__TWIN_SOURCE__ !== 'synthetic' && window.__TWIN_DATA__?.wells?.length) { WELLS.length = 0; WELLS.push(...window.__TWIN_DATA__.wells); }` (mind: CLUSTERS drives filters — if seeded wells carry their own cluster names, also splice CLUSTERS the same way).
   - `TIMELINE_EVENTS`: same guarded replacement pattern.
   - `CAUSE_BREAKDOWN`: same.
   - The rail's region line ("West TX · SE New Mexico") and #header .reg: set from `window.__TWIN_DATA__?.regionLabel` when seeded.
   - Leave the WLC dataset and KG graph synthetic this round (they are the case-study modals) — untouched.
4. **Honesty badges, injected not redesigned:** at the END of twin-data.js (or a tiny second inline block after the rail renders — pick the simplest reliable point), when seeded is active, append a small chip element to each KPI card and layer-row named in overlayPanels reading `OPERATOR OVERLAY · SEEDED`, styled via the mockup's existing chip/tag classes (inline styles matching the .filter-chip look are fine). No panel redesign.
5. **Anti-deletion guard test:** a test that reads index.html as text and asserts these substrings exist: `openDrilling`, `new THREE`, `buildTracksSvg` or `wlc-modal` logic marker, `KG_GRAPH`, `MapboxOverlay`, `ColumnLayer`, `group-inspector`. This is the regression tripwire for exactly the failure the last two rounds made. Keep all existing data-layer tests green (12).
6. **Delete src/rendering and src/main.ts's skeleton render path** (main.ts may shrink to nothing or disappear; index.html doesn't need a Vite module entry — Vite serves it fine as-is with public/ assets. If Vite config needs adjusting for a script-tag-only page, adjust minimally).
7. **Verification: `pnpm build` + `pnpm test` ONLY. Do NOT run `pnpm dev` or `pnpm preview` at all.**
