import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mapWellAtomToViewModel, validateReportingSplit } from '../data/mapping';
import type { FixtureFile, ProductionTimeseriesAtom } from '../types/atoms';

describe('Fixture Validation', () => {
  let fixtures: Array<{name: string; data: FixtureFile}> = [];
  
  beforeAll(() => {
    const fixtureFiles = [
      'reeves-wells-01.json',
      'reeves-wells-02.json',
      'reeves-wells-03.json'
    ];
    
    fixtures = fixtureFiles.map(filename => {
      const content = readFileSync(join(process.cwd(), 'fixtures', filename), 'utf-8');
      return {
        name: filename,
        data: JSON.parse(content) as FixtureFile
      };
    });
  });
  
  it('should have fixtures that are valid JSON', () => {
    expect(fixtures.length).toBe(3);
    fixtures.forEach(fixture => {
      expect(fixture.data).toBeDefined();
      expect(typeof fixture.data).toBe('object');
    });
  });
  
  it('should have well atoms with required fields', () => {
    fixtures.forEach(fixture => {
      const data = fixture.data;
      expect(data.wells).toBeDefined();
      expect(Array.isArray(data.wells)).toBe(true);
      
      data.wells.forEach(well => {
        expect(well.wellDid).toMatch(/^well_/);
        expect(well.apiNumber14).toMatch(/^\d{2}-\d{3}-\d{5}$/);
        expect(well.wellName).toBeDefined();
        expect(well.wellType).toMatch(/^(oil|gas|injection|disposal|dry|plugged)$/);
        expect(well.status).toBeDefined();
        expect(well.surfaceLocation).toBeDefined();
        expect(well.surfaceLocation.lng).toBeTypeOf('number');
        expect(well.surfaceLocation.lat).toBeTypeOf('number');
        expect(well.surfaceLocation.datum).toBe('WGS84');
        expect(well.district).toBe('Reeves');
        expect(well.sourceCitation).toBeDefined();
        expect(well.accessPolicy).toBe('public-free');
        expect(well.confidence).toBeDefined();
        expect(well.confidence.provenance).toBe('asserted');
        expect(well.confidence.mean).toBeGreaterThan(0);
      });
    });
  });
  
  it('should have all wells in Reeves County area', () => {
    fixtures.forEach(fixture => {
      const data = fixture.data;
      
      data.wells.forEach(well => {
        // Reeves County is roughly between -104.2 to -103.0 longitude, 31.0 to 32.0 latitude
        expect(well.surfaceLocation.lng).toBeGreaterThan(-104.5);
        expect(well.surfaceLocation.lng).toBeLessThan(-103.0);
        expect(well.surfaceLocation.lat).toBeGreaterThan(31.0);
        expect(well.surfaceLocation.lat).toBeLessThan(32.0);
      });
    });
  });
  
  it('should have real-format API-14 DIDs', () => {
    fixtures.forEach(fixture => {
      const data = fixture.data;
      
      data.wells.forEach(well => {
        // API-14 format: 42 (Texas) - 501 (Reeves County) - 5-digit sequence
        expect(well.apiNumber14).toMatch(/^42-501-\d{5}$/);
        // Well DID should incorporate the API-14
        expect(well.wellDid).toContain(well.apiNumber14);
      });
    });
  });
  
  it('should load ~30 wells total across fixtures', () => {
    let totalWells = 0;
    fixtures.forEach(fixture => {
      const data = fixture.data;
      totalWells += data.wells.length;
    });
    
    expect(totalWells).toBeGreaterThanOrEqual(30);
    expect(totalWells).toBeLessThanOrEqual(35);
  });
});

describe('Reporting Split Rule', () => {
  it('should validate that oil production anchors to rrc-lease', () => {
    const oilStreamAtLeaseLevel: ProductionTimeseriesAtom = {
      streamDid: 'stream_test_oil_lease',
      anchorKind: 'rrc-lease',
      anchorDid: 'rrclease_08-12345',
      product: 'oil',
      granularity: 'monthly',
      sourceAdapter: 'RRC-PDQ',
      observations: [],
      confidence: { provenance: 'asserted', mean: 0.95 },
      sourceCitation: 'RRC PR query 2024-10',
      accessPolicy: 'public-free'
    };
    
    expect(validateReportingSplit(oilStreamAtLeaseLevel)).toBe(true);
  });
  
  it('should reject oil production at well grain (invalid per ADR)', () => {
    const oilStreamAtWellLevel: ProductionTimeseriesAtom = {
      streamDid: 'stream_test_oil_well',
      anchorKind: 'well',  // Invalid: oil must be at rrc-lease grain
      anchorDid: 'well_42-501-30001',
      product: 'oil',
      granularity: 'monthly',
      sourceAdapter: 'RRC-PDQ',
      observations: [],
      confidence: { provenance: 'asserted', mean: 0.95 },
      sourceCitation: 'RRC PR query 2024-10',
      accessPolicy: 'public-free'
    };
    
    expect(validateReportingSplit(oilStreamAtWellLevel)).toBe(false);
  });
  
  it('should validate that gas production anchors to well', () => {
    const gasStreamAtWellLevel: ProductionTimeseriesAtom = {
      streamDid: 'stream_test_gas_well',
      anchorKind: 'well',
      anchorDid: 'well_42-501-30001',
      product: 'gas',
      granularity: 'monthly',
      sourceAdapter: 'RRC-PDQ',
      observations: [],
      confidence: { provenance: 'asserted', mean: 0.95 },
      sourceCitation: 'RRC PR query 2024-10',
      accessPolicy: 'public-free'
    };
    
    expect(validateReportingSplit(gasStreamAtWellLevel)).toBe(true);
  });
  
  it('should reject gas production at rrc-lease grain (invalid per ADR)', () => {
    const gasStreamAtLeaseLevel: ProductionTimeseriesAtom = {
      streamDid: 'stream_test_gas_lease',
      anchorKind: 'rrc-lease',  // Invalid: gas must be at well grain
      anchorDid: 'rrclease_08-12345',
      product: 'gas',
      granularity: 'monthly',
      sourceAdapter: 'RRC-PDQ',
      observations: [],
      confidence: { provenance: 'asserted', mean: 0.95 },
      sourceCitation: 'RRC PR query 2024-10',
      accessPolicy: 'public-free'
    };
    
    expect(validateReportingSplit(gasStreamAtLeaseLevel)).toBe(false);
  });
  
  it('should allow water and injection at either grain', () => {
    const waterAtWell: ProductionTimeseriesAtom = {
      streamDid: 'stream_water_well',
      anchorKind: 'well',
      anchorDid: 'well_42-501-30001',
      product: 'water',
      granularity: 'monthly',
      sourceAdapter: 'RRC-PDQ',
      observations: [],
      confidence: { provenance: 'asserted', mean: 0.95 },
      sourceCitation: 'RRC PR query 2024-10',
      accessPolicy: 'public-free'
    };
    
    const injectionAtLease: ProductionTimeseriesAtom = {
      streamDid: 'stream_injection_lease',
      anchorKind: 'rrc-lease',
      anchorDid: 'rrclease_08-12345',
      product: 'injection',
      granularity: 'monthly',
      sourceAdapter: 'RRC-PDQ',
      observations: [],
      confidence: { provenance: 'asserted', mean: 0.95 },
      sourceCitation: 'RRC PR query 2024-10',
      accessPolicy: 'public-free'
    };
    
    // Water and injection don't have the reporting split rule - both grains are valid
    expect(validateReportingSplit(waterAtWell)).toBe(true);
    expect(validateReportingSplit(injectionAtLease)).toBe(true);
  });
});

describe('Mapping Layer', () => {
  let fixtureData: FixtureFile;
  
  beforeAll(() => {
    const content = readFileSync(join(process.cwd(), 'fixtures', 'reeves-wells-01.json'), 'utf-8');
    fixtureData = JSON.parse(content) as FixtureFile;
  });
  
  it('should map well atom to view model', () => {
    const wellAtom = fixtureData.wells[0];
    const mapped = mapWellAtomToViewModel(wellAtom, [], undefined);
    
    expect(mapped).toBeDefined();
    expect(mapped.id).toBeTypeOf('number');
    expect(mapped.lng).toBe(wellAtom.surfaceLocation.lng);
    expect(mapped.lat).toBe(wellAtom.surfaceLocation.lat);
    expect(mapped.padName).toBe(wellAtom.wellName);
    expect(mapped.cluster).toContain('District');
    
    // Operational metrics should have default values when no production/equipment data
    expect(mapped.equipment_health).toBeGreaterThanOrEqual(0);
    expect(mapped.equipment_health).toBeLessThanOrEqual(100);
    expect(mapped.well_communication).toBeGreaterThanOrEqual(0);
    expect(mapped.well_communication).toBeLessThanOrEqual(100);
    expect(mapped.sensor_reliability).toBeGreaterThanOrEqual(0);
    expect(mapped.sensor_reliability).toBeLessThanOrEqual(100);
  });
  
  it('should preserve geographic coordinates through mapping', () => {
    const wells = fixtureData.wells;
    const mapped = wells.map(w => mapWellAtomToViewModel(w, [], undefined));
    
    wells.forEach((wellAtom, i) => {
      expect(mapped[i].lng).toBe(wellAtom.surfaceLocation.lng);
      expect(mapped[i].lat).toBe(wellAtom.surfaceLocation.lat);
    });
  });
});
