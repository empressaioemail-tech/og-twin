// Atom contract types from @empressaio/atom-contract/og
// These are the schema shapes the fixtures will conform to

export interface WellAtom {
  wellDid: string;
  apiNumber14: string;
  wellName: string;
  wellNumber?: string;
  wellType: 'oil' | 'gas' | 'injection' | 'disposal' | 'dry' | 'plugged';
  status: string;
  spudDate?: string;
  completionDate?: string;
  totalDepth?: number;
  surfaceLocation: {
    lng: number;
    lat: number;
    datum: string;
  };
  bottomholeLocation?: {
    lng: number;
    lat: number;
    datum: string;
  };
  district: string;
  sourceCitation: string;
  accessPolicy: 'public-free';
  confidence: WidthedConfidence;
}

export interface ProductionTimeseriesAtom {
  streamDid: string;
  anchorKind: 'rrc-lease' | 'well';
  anchorDid: string;
  product: 'oil' | 'gas' | 'water' | 'injection';
  granularity: 'monthly' | 'daily';
  sourceAdapter: string;
  observations: Array<{
    period: string;
    volume: number;
    unit: string;
    reportedAt: string;
  }>;
  confidence: WidthedConfidence;
  sourceCitation: string;
  accessPolicy: 'public-free' | 'tenant-private';
}

export interface RRCLeaseAtom {
  rrcLeaseDid: string;
  leaseNumber: string;
  leaseName: string;
  district: string;
  operatorActorDid: string;
  wellCount: number;
  status: string;
  acreage?: number;
  accessPolicy: 'public-free';
  confidence: WidthedConfidence;
  sourceCitation: string;
}

export interface RevenueAllocationUnitAtom {
  unitDid: string;
  basis: 'pooled-unit' | 'allocation-well' | 'psa';
  wellDids: string[];
  operatorActorDid: string;
  effectiveFrom: string;
  effectiveTo?: string;
  tractParticipations: Array<{
    tractDid: string;
    factor: number;
    allocationMethod: 'stated-fraction' | 'acreage' | 'lateral-length' | 'take-points' | 'acre-feet' | 'oil-in-place' | 'other';
    source: string;
  }>;
  sourcePlatCid?: string;
  accessPolicy: 'public-free';
  confidence: WidthedConfidence;
  sourceCitation: string;
}

export interface WidthedConfidence {
  provenance: 'asserted' | 'inferred' | 'derived' | 'measured' | 'calibrated';
  lowerBound?: number;
  upperBound?: number;
  mean: number;
}

export interface EquipmentStateAtom {
  equipmentDid: string;
  wellDid: string;
  equipmentKind: 'rod-pump' | 'esp' | 'gas-lift' | 'plunger-lift' | 'surface-facility' | 'other';
  stateSnapshot: Record<string, unknown>;
  telemetryStreamRefs: string[];
  asOf: string;
  accessPolicy: 'tenant-private';
  confidence: WidthedConfidence;
  sourceCitation: string;
}

// Fixture file structure
export interface FixtureFile {
  wells: WellAtom[];
  productionTimeseries: ProductionTimeseriesAtom[];
  rrcLeases: RRCLeaseAtom[];
  revenueAllocationUnits: RevenueAllocationUnitAtom[];
  equipmentStates: EquipmentStateAtom[];
}
