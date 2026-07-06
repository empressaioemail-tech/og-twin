import type { TwinDataSource } from './TwinDataSource';
import type { Well, Cluster, TimelineEvent, CauseBreakdown, FieldOverview, WellLogCorrelationData } from '../types/view-models';
import type { FixtureFile } from '../types/atoms';
import { mapWellAtomsToViewModels } from './mapping';

/**
 * SeededReevesDataSource - loads JSON fixtures conforming to atom contract schemas.
 * 
 * ~30 wells of plausible Reeves County seeded data with real-format API-14 DIDs,
 * production timeseries, RRC leases, revenue allocation units. Fixtures are validated
 * against contract schemas in tests.
 */
export class SeededReevesDataSource implements TwinDataSource {
  readonly sourceId = 'seeded' as const;
  
  private fixtureData: FixtureFile | null = null;
  private wells: Well[] | null = null;
  
  async loadFixtures(): Promise<void> {
    if (this.fixtureData) return;
    
    // Load all fixture files
    const fixtureFiles = [
      '/fixtures/reeves-wells-01.json',
      '/fixtures/reeves-wells-02.json',
      '/fixtures/reeves-wells-03.json'
    ];
    
    const loadedFixtures = await Promise.all(
      fixtureFiles.map(async (path) => {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Failed to load fixture ${path}: ${response.statusText}`);
        }
        return response.json() as Promise<FixtureFile>;
      })
    );
    
    // Merge all fixtures
    this.fixtureData = {
      wells: loadedFixtures.flatMap(f => f.wells),
      productionTimeseries: loadedFixtures.flatMap(f => f.productionTimeseries),
      rrcLeases: loadedFixtures.flatMap(f => f.rrcLeases),
      revenueAllocationUnits: loadedFixtures.flatMap(f => f.revenueAllocationUnits),
      equipmentStates: loadedFixtures.flatMap(f => f.equipmentStates)
    };
  }
  
  getWells(): Well[] {
    if (!this.wells && this.fixtureData) {
      // Map atom fixtures to view-model wells
      this.wells = mapWellAtomsToViewModels(
        this.fixtureData.wells,
        this.fixtureData.productionTimeseries,
        this.fixtureData.equipmentStates
      );
    }
    return this.wells || [];
  }
  
  getClusters(): Cluster[] {
    // Reeves County clusters (actual Reeves area, not basin-wide)
    return [
      { name: 'North Reeves', lng: -103.620, lat: 31.720, radiusMi: 8, padDensity: 0.45, sev: 1.15 },
      { name: 'Central Reeves', lng: -103.665, lat: 31.680, radiusMi: 7, padDensity: 0.50, sev: 1.10 },
      { name: 'East Reeves', lng: -103.580, lat: 31.755, radiusMi: 6, padDensity: 0.40, sev: 1.05 },
      { name: 'West Reeves', lng: -103.705, lat: 31.635, radiusMi: 7, padDensity: 0.38, sev: 1.20 },
      { name: 'Northeast Reeves', lng: -103.540, lat: 31.790, radiusMi: 5, padDensity: 0.35, sev: 1.00 }
    ];
  }
  
  getTimelineEvents(): TimelineEvent[] {
    // Reeves-specific timeline events
    return [
      { day: 3,  type: 'workover', label: 'ESP swap · North Reeves',      detail: 'STATE REEVES A 3H, restored 185 BOE/d' },
      { day: 7,  type: 'anomaly',  label: 'Pressure spike · Central Reeves', detail: '4 wells flagged, monitoring' },
      { day: 10, type: 'workover', label: 'Tubing repair · East Reeves',  detail: 'STATE REEVES C 2H, +95 BOE/d' },
      { day: 14, type: 'failure',  label: 'Rod parted · West Reeves',     detail: 'STATE REEVES D 1H down, workover scheduled' },
      { day: 17, type: 'weather',  label: 'Dust storm · Reeves County',   detail: 'Brief curtailment, all wells recovered' },
      { day: 21, type: 'workover', label: 'Pump retrofit · North Reeves', detail: 'STATE REEVES A 7H, +120 BOE/d' },
      { day: 25, type: 'anomaly',  label: 'Communication loss · Central Reeves', detail: '3 wells recalibrated' },
      { day: 28, type: 'workover', label: 'ESP replacement · East Reeves', detail: 'STATE REEVES C 4H, +155 BOE/d' }
    ];
  }
  
  getCauseBreakdown(): CauseBreakdown[] {
    // Reeves-specific cause breakdown (slightly different distribution than synthetic)
    return [
      { id: 'surface_equipment',   pct: 18 },
      { id: 'artificial_lift',     pct: 22 },
      { id: 'reservoir_pressure',  pct: 9 },
      { id: 'completion_geometry', pct: 13 },
      { id: 'healthy',             pct: 38 }
    ];
  }
  
  getFieldOverview(): FieldOverview {
    const wells = this.getWells();
    return {
      totalWells: wells.length,
      activeClusters: this.getClusters().length,
      averageHealth: wells.reduce((sum, w) => sum + w.equipment_health, 0) / wells.length,
      totalProduction: wells.length * 135
    };
  }
  
  getWellLogCorrelationData(): WellLogCorrelationData {
    // Keep the AASTRA Discovery case study for now (from mockup)
    // Could be replaced with a Reeves-specific case study in the future
    return {
      project: {
        name: "AASTRA Discovery",
        basin: "Browse Basin",
        survey: "AASTRA 3D PS",
        operator: "ConocoPhillips (Browse Basin) Pty Ltd"
      },
      wells: [
        { name: 'Zephyros-1', surfaceX: 115.2156, surfaceY: -15.4892 },
        { name: 'Torosa-1', surfaceX: 115.2845, surfaceY: -15.5123 },
        { name: 'Eurus-1', surfaceX: 115.1987, surfaceY: -15.4756 }
      ],
      formationTops: [
        { 
          id: 'jamieson-te2-fm', 
          name: 'Jamieson TE2 Formation',
          picks: [
            { well: 'Zephyros-1', depthMDMeters: 3670 },
            { well: 'Torosa-1', depthMDMeters: 3695 },
            { well: 'Eurus-1', depthMDMeters: 3658 }
          ]
        }
      ],
      crossPlotPoints: [
        { id: 'zeph-1-3700', well: 'Zephyros-1', depthMDMeters: 3700, zone: 'clean-reservoir-sand', formation: 'jamieson-te2-fm', gammaRayGAPI: 45, caliperInches: 8.5 },
        { id: 'zeph-1-3750', well: 'Zephyros-1', depthMDMeters: 3750, zone: 'shaly-sand-transition', formation: 'jamieson-te2-fm', gammaRayGAPI: 75, caliperInches: 9.2 },
        { id: 'tor-1-3720', well: 'Torosa-1', depthMDMeters: 3720, zone: 'clean-reservoir-sand', formation: 'jamieson-te2-fm', gammaRayGAPI: 42, caliperInches: 8.6 }
      ],
      interpretationZones: [
        { id: 'clean-reservoir-sand', name: 'Clean Reservoir Sand', gammaRayGAPI: [35, 55], caliperInches: [8.2, 8.9] },
        { id: 'shaly-sand-transition', name: 'Shaly Sand Transition', gammaRayGAPI: [55, 85], caliperInches: [8.9, 9.8] },
        { id: 'shale', name: 'Shale', gammaRayGAPI: [85, 140], caliperInches: [9.8, 12.0] }
      ]
    };
  }
  
  getKnowledgeGraphNodes(): Array<{id: string; type: string; label: string}> {
    return [
      { id: 'node-reeves-1', type: 'cluster', label: 'North Reeves' },
      { id: 'node-reeves-2', type: 'pad', label: 'STATE REEVES A Pad' },
      { id: 'node-reeves-3', type: 'well', label: 'STATE REEVES A 1H' },
      { id: 'node-reeves-4', type: 'rrc-lease', label: 'Reeves Lease 12345' },
      { id: 'node-reeves-5', type: 'allocation-unit', label: 'Reeves Unit A' }
    ];
  }
}
