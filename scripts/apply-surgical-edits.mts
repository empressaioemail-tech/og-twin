#!/usr/bin/env node
/**
 * apply-surgical-edits.mts
 * 
 * Applies all surgical edits to index.html:
 * 1. Removes auto-reload script block
 * 2. Adds twin-data.js script tag
 * 3. Adds data splice points for WELLS, CLUSTERS, TIMELINE_EVENTS, CAUSE_BREAKDOWN
 * 4. Adds region label updates
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const indexPath = join(process.cwd(), 'index.html');
let content = readFileSync(indexPath, 'utf-8');

console.log('Applying surgical edits to index.html...');

// 1. Add twin-data.js script tag before first big inline script
const mapCommentPattern = /<!-- ={50,}[^]*?Map \/ 2D logic[^]*?={50,} -->\n<script>/;
if (content.match(mapCommentPattern)) {
  content = content.replace(
    mapCommentPattern,
    (match) => match.replace('<script>', '<script src="/twin-data.js"></script>\n<script>')
  );
  console.log('✓ Added twin-data.js script tag');
} else {
  console.warn('⚠ Could not find location to insert twin-data.js script tag');
}

// 2. Add CLUSTERS splice after CLUSTERS_BY_NAME
const clustersPattern = /(const CLUSTERS_BY_NAME = Object\.fromEntries\(CLUSTERS\.map\(c => \[c\.name, c\]\)\);)\n\n  \/\/ ---- Metrics/;
if (content.match(clustersPattern)) {
  content = content.replace(
    clustersPattern,
    `$1\n\n  // Surgical data splice: replace CLUSTERS with seeded data when available
  if (window.__TWIN_SOURCE__ !== 'synthetic' && window.__TWIN_DATA__?.clusters?.length) {
    CLUSTERS.length = 0;
    CLUSTERS.push(...window.__TWIN_DATA__.clusters);
    // Rebuild CLUSTERS_BY_NAME map
    Object.keys(CLUSTERS_BY_NAME).forEach(k => delete CLUSTERS_BY_NAME[k]);
    CLUSTERS.forEach(c => CLUSTERS_BY_NAME[c.name] = c);
  }\n\n  // ---- Metrics`
  );
  console.log('✓ Added CLUSTERS splice point');
} else {
  console.warn('⚠ Could not find CLUSTERS splice location');
}

// 3. Add WELLS splice after NORTH_REEVES_PAD population
const wellsPattern = /(      WELLS\.push\(w\);\n    }\n  })\n\n  \/\/ ---- Day \/ scrubber ----/;
if (content.match(wellsPattern)) {
  content = content.replace(
    wellsPattern,
    `$1\n\n  // Surgical data splice: replace WELLS with seeded data when available
  if (window.__TWIN_SOURCE__ !== 'synthetic' && window.__TWIN_DATA__?.wells?.length) {
    WELLS.length = 0;
    WELLS.push(...window.__TWIN_DATA__.wells);
  }\n\n  // ---- Day / scrubber ----`
  );
  console.log('✓ Added WELLS splice point');
} else {
  console.warn('⚠ Could not find WELLS splice location');
}

// 4. Add CAUSE_BREAKDOWN splice
const causePattern = /(    \{ id: 'healthy',             pct: 39 }\n  \];)\n  const causeListEl/;
if (content.match(causePattern)) {
  content = content.replace(
    causePattern,
    `$1\n\n  // Surgical data splice: replace CAUSE_BREAKDOWN with seeded data when available
  if (window.__TWIN_SOURCE__ !== 'synthetic' && window.__TWIN_DATA__?.causeBreakdown?.length) {
    CAUSE_BREAKDOWN.length = 0;
    CAUSE_BREAKDOWN.push(...window.__TWIN_DATA__.causeBreakdown);
  }\n\n  const causeListEl`
  );
  console.log('✓ Added CAUSE_BREAKDOWN splice point');
} else {
  console.warn('⚠ Could not find CAUSE_BREAKDOWN splice location');
}

// 5. Add TIMELINE_EVENTS splice
const timelinePattern = /(    \{ day: 29, type: 'failure',  label: 'Pipeline trip[^']*Eddy County NM',    detail: '14 wells curtailed' }\n  \];)\n  function renderMarkers/;
if (content.match(timelinePattern)) {
  content = content.replace(
    timelinePattern,
    `$1\n\n  // Surgical data splice: replace TIMELINE_EVENTS with seeded data when available
  if (window.__TWIN_SOURCE__ !== 'synthetic' && window.__TWIN_DATA__?.timelineEvents?.length) {
    TIMELINE_EVENTS.length = 0;
    TIMELINE_EVENTS.push(...window.__TWIN_DATA__.timelineEvents);
  }\n\n  function renderMarkers`
  );
  console.log('✓ Added TIMELINE_EVENTS splice point');
} else {
  console.warn('⚠ Could not find TIMELINE_EVENTS splice location');
}

// 6. Add region label updates
const regionPattern = /(  \/\/ If the user scrubs the timeline manually, pause playback\.\n  document\.getElementById\('timeline'\)\.addEventListener\('mousedown', stopPlay\);)\n\n  \/\/ Init/;
if (content.match(regionPattern)) {
  content = content.replace(
    regionPattern,
    `$1\n\n  // Surgical data splice: update region labels when seeded data is active
  if (window.__TWIN_SOURCE__ !== 'synthetic' && window.__TWIN_DATA__?.regionLabel) {
    const railReg = document.querySelector('#rail .reg');
    const headerReg = document.querySelector('#header .reg');
    if (railReg) railReg.textContent = window.__TWIN_DATA__.regionLabel;
    if (headerReg) headerReg.textContent = window.__TWIN_DATA__.regionLabel;
  }\n\n  // Init`
  );
  console.log('✓ Added region label updates');
} else {
  console.warn('⚠ Could not find region label update location');
}

// Write the modified content
writeFileSync(indexPath, content, 'utf-8');
console.log('\n✓ All surgical edits applied successfully');
