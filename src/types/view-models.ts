// View model types - the shapes the UI consumes

export interface Well {
  id: number;
  lng: number;
  lat: number;
  cluster: string;
  padName?: string;
  padIndex?: number;
  production_variance: number;
  active_exceptions: number;
  downtime_exposure: number;
  pressure_anomaly: number;
  equipment_health: number;
  well_communication: number;
  sensor_reliability: number;
  recent_changes: number;
}

export interface Cluster {
  name: string;
  lng: number;
  lat: number;
  radiusMi: number;
  padDensity: number;
  sev: number;
}

export interface TimelineEvent {
  day: number;
  type: 'workover' | 'failure' | 'weather' | 'anomaly';
  label: string;
  detail: string;
}

export interface Metric {
  id: string;
  label: string;
  color: [number, number, number];
  unit: string;
  valueOf: (w: Well) => number;
  fmt: (v: number) => string;
}

export interface CauseBreakdown {
  id: string;
  pct: number;
}

export interface FieldOverview {
  totalWells: number;
  activeClusters: number;
  averageHealth: number;
  totalProduction: number;
}

export interface KnowledgeGraphNode {
  id: string;
  type: string;
  label: string;
  metadata: Record<string, unknown>;
}

export interface WellLogCorrelationData {
  project: {
    name: string;
    basin: string;
    survey: string;
    operator: string;
  };
  wells: Array<{
    name: string;
    surfaceX: number;
    surfaceY: number;
  }>;
  formationTops: Array<{
    id: string;
    name: string;
    picks: Array<{
      well: string;
      depthMDMeters: number;
    }>;
  }>;
  crossPlotPoints: Array<{
    id: string;
    well: string;
    depthMDMeters: number;
    zone: string;
    formation: string;
    gammaRayGAPI: number;
    caliperInches: number;
  }>;
  interpretationZones: Array<{
    id: string;
    name: string;
    gammaRayGAPI: [number, number];
    caliperInches: [number, number];
  }>;
}
