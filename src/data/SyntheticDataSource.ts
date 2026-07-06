import type { TwinDataSource } from './TwinDataSource';
import type { Well, Cluster, TimelineEvent, CauseBreakdown, FieldOverview, WellLogCorrelationData } from '../types/view-models';

/**
 * SyntheticDataSource - the mockup's existing synthetic generators, moved verbatim.
 * 
 * This implementation preserves the original mockup's data generation logic so the
 * app runs identically to the mockup out of the box (default source).
 */
export class SyntheticDataSource implements TwinDataSource {
  readonly sourceId = 'synthetic' as const;
  
  private wells: Well[] | null = null;
  private clusters: Cluster[] = [];
  
  constructor() {
    this.initializeClusters();
  }
  
  private initializeClusters() {
    // Cluster regions from mockup
    this.clusters = [
      { name: 'Midland Basin core',  lng: -102.10, lat: 32.00, radiusMi: 14, padDensity: 0.62, sev: 1.05 },
      { name: 'Martin / Howard',     lng: -101.85, lat: 32.40, radiusMi: 12, padDensity: 0.55, sev: 0.85 },
      { name: 'Andrews / Ector',     lng: -102.55, lat: 32.10, radiusMi: 11, padDensity: 0.58, sev: 0.95 },
      { name: 'Reagan / Upton',      lng: -101.50, lat: 31.40, radiusMi: 13, padDensity: 0.45, sev: 0.75 },
      { name: 'Loving / Reeves',     lng: -103.65, lat: 31.65, radiusMi: 16, padDensity: 0.55, sev: 1.30 },
      { name: 'Pecos',               lng: -103.40, lat: 31.10, radiusMi: 11, padDensity: 0.40, sev: 0.90 },
      { name: 'Glasscock',           lng: -101.45, lat: 31.85, radiusMi: 10, padDensity: 0.55, sev: 1.00 },
      { name: 'Gaines / Dawson',     lng: -101.95, lat: 32.78, radiusMi: 14, padDensity: 0.52, sev: 1.05 },
      { name: 'Borden',              lng: -101.30, lat: 32.70, radiusMi:  9, padDensity: 0.32, sev: 0.85 },
      { name: 'Crane',               lng: -102.30, lat: 31.45, radiusMi:  9, padDensity: 0.45, sev: 0.90 },
      { name: 'Ward / Winkler',      lng: -103.05, lat: 31.78, radiusMi: 11, padDensity: 0.55, sev: 1.15 },
      { name: 'Culberson',           lng: -104.10, lat: 31.20, radiusMi: 12, padDensity: 0.30, sev: 1.00 },
      { name: 'Crockett',            lng: -101.40, lat: 30.78, radiusMi: 10, padDensity: 0.22, sev: 0.75 },
      { name: 'Sterling / Mitchell', lng: -100.95, lat: 32.05, radiusMi: 10, padDensity: 0.25, sev: 0.70 },
      { name: 'Lea County NM',       lng: -103.20, lat: 32.75, radiusMi: 12, padDensity: 0.55, sev: 1.10 },
      { name: 'Eddy County NM',      lng: -104.20, lat: 32.40, radiusMi: 12, padDensity: 0.45, sev: 1.05 }
    ];
  }
  
  private gauss(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  
  private generateWells(): Well[] {
    const wells: Well[] = [];
    let wellId = 0;
    
    // Generate regular cluster wells
    for (const cl of this.clusters) {
      const cellMi = 0.60;
      const slots: Array<{dx: number; dy: number}> = [];
      const rad = cl.radiusMi;
      
      const seedA = cl.lng * 7.3 + cl.lat * 4.1;
      const seedB = cl.lng * 11.7 - cl.lat * 9.5;
      
      const maxRadiusAt = (ang: number) => {
        return rad * (
          1.0
          + Math.sin(ang * 1.4 + seedA)        * 0.22
          + Math.sin(ang * 2.7 + seedB + 1.1)  * 0.14
          + Math.cos(ang * 4.9 + seedA * 0.7)  * 0.07
        );
      };
      
      for (let dy = -rad * 1.4; dy <= rad * 1.4; dy += cellMi) {
        for (let dx = -rad * 1.4; dx <= rad * 1.4; dx += cellMi) {
          const dist = Math.hypot(dx, dy);
          if (dist === 0) { slots.push({ dx, dy }); continue; }
          const ang = Math.atan2(dy, dx);
          if (dist > maxRadiusAt(ang)) continue;
          slots.push({ dx, dy });
        }
      }
      
      // Shuffle and take subset
      for (let i = slots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slots[i], slots[j]] = [slots[j], slots[i]];
      }
      const numPads = Math.min(slots.length, Math.floor(slots.length * (0.037 + cl.padDensity * 0.067)));
      const used = slots.slice(0, numPads);
      
      for (const slot of used) {
        const jitterMi = cellMi * 0.30;
        const padLng = cl.lng + (slot.dx + (Math.random() - 0.5) * jitterMi) / 54.6;
        const padLat = cl.lat + (slot.dy + (Math.random() - 0.5) * jitterMi) / 69;
        
        const orient = (Math.random() < 0.7 ? 0 : Math.PI / 2) + (Math.random() - 0.5) * 0.30;
        
        let rows: number, cols: number;
        const sizeR = Math.random();
        if (sizeR < 0.15)      { rows = 1; cols = 1; }
        else if (sizeR < 0.50) { rows = 2; cols = 2; }
        else if (sizeR < 0.80) { rows = 3; cols = 3; }
        else if (sizeR < 0.95) { rows = 4; cols = 4; }
        else                   { rows = 5; cols = 5; }
        const wellSpacingDeg = 0.0030;
        
        const s = cl.sev;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const localX = (col - (cols - 1) / 2) * wellSpacingDeg;
            const localY = (row - (rows - 1) / 2) * wellSpacingDeg;
            const rx = localX * Math.cos(orient) - localY * Math.sin(orient);
            const ry = localX * Math.sin(orient) + localY * Math.cos(orient);
            wells.push({
              id: ++wellId,
              lng: padLng + rx,
              lat: padLat + ry,
              cluster: cl.name,
              production_variance: -Math.abs(this.gauss() * 1.2 * s),
              active_exceptions:    Math.max(0, this.gauss() * 2 * s + 1),
              downtime_exposure:    Math.abs(this.gauss() * 9000 * s),
              pressure_anomaly:     Math.abs(this.gauss() * 32 * s),
              equipment_health:     Math.max(0, Math.min(100, 78 + this.gauss() * 12 / s)),
              well_communication:   Math.max(0, Math.min(100, 82 + this.gauss() * 10 / s)),
              sensor_reliability:   Math.max(0, Math.min(100, 90 + this.gauss() * 6 / s)),
              recent_changes:       Math.max(0, this.gauss() * 6 + 4)
            });
          }
        }
      }
    }
    
    // Add the North Reeves Pad (the demo anomaly pad)
    const PAD_CENTER = { lng: -103.620, lat: 31.720 };
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const padIndex = row * 4 + col;
        const wellIdStr = String(padIndex + 1).padStart(2, '0') + 'H';
        const isAnomaly = padIndex === 2;
        const offX = (col - 1.5) * 0.0042;
        const offY = (row - 1) * 0.0030;
        wells.push({
          id: ++wellId,
          lng: PAD_CENTER.lng + offX,
          lat: PAD_CENTER.lat + offY,
          cluster: 'Loving / Reeves',
          padName: 'MD 22 ' + wellIdStr,
          padIndex,
          production_variance: isAnomaly ? -1.8 : -0.3 + this.gauss() * 0.4,
          active_exceptions:   isAnomaly ?  4   :  1   + this.gauss() * 0.6,
          downtime_exposure:   isAnomaly ? 8200 : 1100 + Math.abs(this.gauss() * 600),
          pressure_anomaly:    isAnomaly ? 96   : 18   + this.gauss() * 8,
          equipment_health:    isAnomaly ? 58   : 84 + this.gauss() * 5,
          well_communication:  isAnomaly ? 71   : 92 + this.gauss() * 4,
          sensor_reliability:  isAnomaly ? 87   : 96 + this.gauss() * 2,
          recent_changes:      isAnomaly ? 12   : 4 + Math.abs(this.gauss() * 2)
        });
      }
    }
    
    return wells;
  }
  
  getWells(): Well[] {
    if (!this.wells) {
      this.wells = this.generateWells();
    }
    return this.wells;
  }
  
  getClusters(): Cluster[] {
    return this.clusters;
  }
  
  getTimelineEvents(): TimelineEvent[] {
    return [
      { day: 2,  type: 'workover', label: 'ESP swap · Andrews',                detail: 'Restored 220 BOE/d' },
      { day: 4,  type: 'failure',  label: 'Tubing leak · Reagan',              detail: '4 wells offline' },
      { day: 6,  type: 'anomaly',  label: 'Pressure spike · Loving / Reeves',  detail: '6 wells flagged' },
      { day: 8,  type: 'weather',  label: 'Storm cell · Pecos',                detail: 'Brief curtailment' },
      { day: 9,  type: 'failure',  label: 'SCADA outage · Midland Basin core', detail: 'Telemetry restored after 38 min' },
      { day: 11, type: 'workover', label: 'Valve replacement · Pecos',         detail: '+18 BOE/d recovered' },
      { day: 12, type: 'workover', label: 'Pump retrofit · Andrews',           detail: '+60 BOE/d recovered' },
      { day: 14, type: 'failure',  label: 'Rod parted · Crane',                detail: '1 well down · workover scheduled' },
      { day: 15, type: 'workover', label: 'Lift switchover · Eddy County NM',  detail: 'Gas-lift to ESP, +90 BOE/d' },
      { day: 16, type: 'weather',  label: 'Cold front · NM',                   detail: 'Brief curtailment, mostly recovered' },
      { day: 18, type: 'workover', label: 'Re-completion · Crane',             detail: 'Deeper zone, +105 BOE/d' },
      { day: 20, type: 'anomaly',  label: 'Communication loss · Gaines / Dawson', detail: '9 wells flagged' },
      { day: 22, type: 'failure',  label: 'Compressor down · Pecos',           detail: 'Field curtailed, restored after 4 hr' },
      { day: 24, type: 'workover', label: 'Tubing repair · Reagan',            detail: 'Wells back online, +78 BOE/d' },
      { day: 26, type: 'anomaly',  label: 'Sensor drift · Ward / Winkler',     detail: '5 wells recalibrated' },
      { day: 28, type: 'workover', label: 'ESP replacement · Midland',         detail: '+145 BOE/d recovered' }
    ];
  }
  
  getCauseBreakdown(): CauseBreakdown[] {
    return [
      { id: 'surface_equipment',   pct: 16 },
      { id: 'artificial_lift',     pct: 20 },
      { id: 'reservoir_pressure',  pct: 11 },
      { id: 'completion_geometry', pct: 14 },
      { id: 'healthy',             pct: 39 }
    ];
  }
  
  getFieldOverview(): FieldOverview {
    const wells = this.getWells();
    return {
      totalWells: wells.length,
      activeClusters: this.clusters.length,
      averageHealth: wells.reduce((sum, w) => sum + w.equipment_health, 0) / wells.length,
      totalProduction: wells.length * 145
    };
  }
  
  getWellLogCorrelationData(): WellLogCorrelationData {
    // AASTRA Discovery case study from mockup
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
      { id: 'node-1', type: 'cluster', label: 'North Reeves Cluster B' },
      { id: 'node-2', type: 'pad', label: 'MD 22' },
      { id: 'node-3', type: 'well', label: 'MD 22 03H' },
      { id: 'node-4', type: 'anomaly', label: 'Production decline anomaly' },
      { id: 'node-5', type: 'cause', label: 'Equipment health degradation' }
    ];
  }
}
