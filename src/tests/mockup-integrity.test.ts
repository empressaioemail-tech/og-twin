import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Anti-deletion guard test
 * 
 * This test is a regression tripwire for the failure from prior attempts:
 * dropping mockup subsystems while "restructuring". The mockup must ship
 * VERBATIM with all its subsystems intact.
 * 
 * Tests that critical mockup subsystems exist in index.html:
 * - Drilling 3D scene (openDrilling, new THREE)
 * - Well Log Correlation modal (buildTracksSvg or wlc-modal logic)
 * - Knowledge Graph (KG_GRAPH)
 * - Deck.gl integration (MapboxOverlay, ColumnLayer)
 * - Group inspector (group-inspector)
 */
describe('Mockup Integrity - Anti-Deletion Guard', () => {
  let indexHTML: string;
  
  beforeAll(() => {
    indexHTML = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
  });
  
  it('should have drilling 3D scene subsystem (openDrilling function)', () => {
    expect(indexHTML).toContain('openDrilling');
  });
  
  it('should have Three.js 3D rendering (new THREE)', () => {
    expect(indexHTML).toContain('new THREE');
  });
  
  it('should have Well Log Correlation modal (buildTracksSvg or wlc-modal logic)', () => {
    const hasTracksSvg = indexHTML.includes('buildTracksSvg');
    const hasWlcModal = indexHTML.includes('wlc-modal');
    expect(hasTracksSvg || hasWlcModal).toBe(true);
  });
  
  it('should have Knowledge Graph subsystem (KG_GRAPH)', () => {
    expect(indexHTML).toContain('KG_GRAPH');
  });
  
  it('should have deck.gl MapboxOverlay integration', () => {
    expect(indexHTML).toContain('MapboxOverlay');
  });
  
  it('should have deck.gl ColumnLayer for wells', () => {
    expect(indexHTML).toContain('ColumnLayer');
  });
  
  it('should have group inspector flyout subsystem', () => {
    expect(indexHTML).toContain('group-inspector');
  });
  
  it('should verify mockup is not empty (has substantial content)', () => {
    // The mockup should be at least 200KB (actual is ~263KB for the full mockup)
    expect(indexHTML.length).toBeGreaterThan(200000);
  });
});
