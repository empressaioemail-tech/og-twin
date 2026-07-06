import { SyntheticDataSource } from './data/SyntheticDataSource';
import { SeededReevesDataSource } from './data/SeededReevesDataSource';
import type { TwinDataSource } from './data/TwinDataSource';

/**
 * Main application entry - wires the mockup UI to TwinDataSource.
 * Implements ?source=seeded|synthetic toggle and adds honesty badges.
 */

// Parse query params to determine data source
function getDataSource(): 'seeded' | 'synthetic' {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  return source === 'synthetic' ? 'synthetic' : 'seeded'; // default seeded
}

// Initialize the appropriate data source
async function initializeDataSource(): Promise<TwinDataSource> {
  const sourceType = getDataSource();
  
  if (sourceType === 'synthetic') {
    console.log('[og-twin] Using SyntheticDataSource (basin-wide mockup generators)');
    return new SyntheticDataSource();
  } else {
    console.log('[og-twin] Using SeededReevesDataSource (Reeves County fixtures)');
    const source = new SeededReevesDataSource();
    await source.loadFixtures();
    return source;
  }
}

// Add honesty badges to operator overlay panels when seeded source is active
function addHonestyBadges(sourceId: 'seeded' | 'synthetic') {
  if (sourceId !== 'seeded') return;
  
  // Find the operational layers section
  const layerList = document.getElementById('layer-list');
  if (!layerList) return;
  
  // Panels that require operator overlay when using seeded data
  const overlayMetrics = [
    'equipment_health',
    'sensor_reliability', 
    'well_communication',
    'pressure_anomaly'
  ];
  
  // Add badge to each operator-overlay metric
  setTimeout(() => {
    overlayMetrics.forEach(metricId => {
      const layerRow = document.querySelector(`[data-id="${metricId}"]`);
      if (layerRow && !layerRow.querySelector('.honesty-badge')) {
        const badge = document.createElement('span');
        badge.className = 'honesty-badge';
        badge.textContent = 'OPERATOR OVERLAY · SEEDED';
        badge.title = 'This metric uses operator-provided data (not public RRC data)';
        badge.style.cssText = `
          display: inline-block;
          font-size: 8.5px;
          color: #f0b14e;
          background: rgba(240,177,78,0.12);
          border: 1px solid rgba(240,177,78,0.35);
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        `;
        layerRow.appendChild(badge);
      }
    });
  }, 500);
  
  // Also add badge to Field Health Index KPI
  setTimeout(() => {
    const kpis = document.querySelectorAll('.kpi');
    kpis.forEach(kpi => {
      const label = kpi.querySelector('.lbl')?.textContent;
      if (label?.includes('Field Health Index') && !kpi.querySelector('.honesty-badge')) {
        const badge = document.createElement('div');
        badge.className = 'honesty-badge';
        badge.textContent = 'OPERATOR OVERLAY · SEEDED';
        badge.style.cssText = `
          font-size: 9px;
          color: #f0b14e;
          margin-top: 6px;
          font-weight: 600;
          letter-spacing: 0.08em;
        `;
        kpi.appendChild(badge);
      }
    });
  }, 500);
}

// Render the application
async function renderApp(dataSource: TwinDataSource) {
  const wells = dataSource.getWells();
  const clusters = dataSource.getClusters();
  const timelineEvents = dataSource.getTimelineEvents();
  const causeBreakdown = dataSource.getCauseBreakdown();
  const fieldOverview = dataSource.getFieldOverview();
  
  console.log(`[og-twin] Loaded ${wells.length} wells from ${dataSource.sourceId} source`);
  console.log(`[og-twin] Field overview:`, fieldOverview);
  console.log(`[og-twin] Clusters: ${clusters.length}, Timeline events: ${timelineEvents.length}`);
  
  // Expose data to window for mockup scripts
  (window as any).TWIN_DATA = {
    wells,
    clusters,
    timelineEvents,
    causeBreakdown,
    fieldOverview,
    source: dataSource
  };
  
  // Add honesty badges if using seeded source
  addHonestyBadges(dataSource.sourceId);
  
  // Initialize MapLibre (basic integration)
  if (typeof (window as any).maplibregl !== 'undefined') {
    const mapEl = document.getElementById('map');
    if (mapEl) {
      const maplibregl = (window as any).maplibregl;
      const map = new maplibregl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [-102.30, 31.85],
        zoom: 8.4,
        pitch: 50,
        bearing: 0
      });
      
      (window as any).map = map;
      
      map.on('load', () => {
        console.log('[og-twin] Map loaded successfully');
      });
    }
  }
  
  // Populate rail with basic content
  const layerList = document.getElementById('layer-list');
  if (layerList) {
    const metrics = [
      { id: 'production_variance', label: 'Production variance', sample: '-2.4 %' },
      { id: 'active_exceptions', label: 'Active exceptions', sample: '7.5 /pad' },
      { id: 'downtime_exposure', label: 'Downtime exposure', sample: '86.3k hrs' },
      { id: 'pressure_anomaly', label: 'Pressure instability', sample: '35 psi' },
      { id: 'equipment_health', label: 'Equipment health', sample: '60 /100' },
      { id: 'well_communication', label: 'Well communication', sample: '104 /100' },
      { id: 'sensor_reliability', label: 'Sensor confidence', sample: '105 /100' },
      { id: 'recent_changes', label: 'Recent change events', sample: '8343' }
    ];
    
    layerList.innerHTML = metrics.map((m, i) => `
      <div class="layer-row ${i === 0 ? 'active' : ''}" data-id="${m.id}">
        <span><span class="dot"></span>${m.label}</span>
        <span class="val">${m.sample}</span>
      </div>
    `).join('');
  }
  
  // Populate cause breakdown
  const causeList = document.getElementById('cause-list');
  if (causeList) {
    const causes: Record<string, { label: string; color: string }> = {
      surface_equipment: { label: 'Surface equipment', color: 'rgb(240,177,78)' },
      artificial_lift: { label: 'Artificial lift', color: 'rgb(240,130,60)' },
      reservoir_pressure: { label: 'Reservoir pressure', color: 'rgb(214,51,78)' },
      completion_geometry: { label: 'Completion geometry', color: 'rgb(180,100,220)' },
      healthy: { label: 'Healthy', color: 'rgb(63,185,80)' }
    };
    
    causeList.innerHTML = causeBreakdown.map(c => {
      const cause = causes[c.id];
      if (!cause) return '';
      return `
        <div class="row">
          <span class="swatch" style="background:${cause.color}"></span>
          <span class="label">${cause.label}</span>
          <span class="bar-wrap"><span class="bar" style="background:${cause.color};width:${c.pct * 2.4}%"></span></span>
          <span class="pct">${c.pct}%</span>
        </div>
      `;
    }).join('');
  }
  
  // Populate top/bottom performers
  const topPerf = document.getElementById('top-performers');
  const bottomPerf = document.getElementById('bottom-performers');
  if (topPerf && bottomPerf) {
    const sorted = wells.slice().sort((a, b) => b.equipment_health - a.equipment_health);
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3).reverse();
    
    topPerf.innerHTML = top3.map(w => `
      <div class="well-action perf-high">
        <div class="action-name">${w.padName || `Well #${w.id}`}</div>
        <div class="action-meta">
          <span>${w.cluster}</span>
          <span class="val">${w.equipment_health.toFixed(0)} /100</span>
        </div>
      </div>
    `).join('');
    
    bottomPerf.innerHTML = bottom3.map(w => `
      <div class="well-action perf-low">
        <div class="action-name">${w.padName || `Well #${w.id}`}</div>
        <div class="action-meta">
          <span>${w.cluster}</span>
          <span class="val">${w.equipment_health.toFixed(0)} /100</span>
        </div>
      </div>
    `).join('');
  }
  
  // Populate filter chips
  const clusterChips = document.getElementById('cluster-chips');
  if (clusterChips) {
    clusterChips.innerHTML = clusters.map(c => 
      `<button type="button" class="filter-chip active" data-cluster="${c.name}">${c.name}</button>`
    ).join('');
  }
  
  // Set filter stats
  const filterStats = document.getElementById('filter-stats');
  if (filterStats) {
    filterStats.innerHTML = `<b>${wells.length}</b> of <b>${wells.length}</b> wells visible`;
  }
  
  // Update header mode text
  const headerMode = document.getElementById('header-mode');
  if (headerMode) {
    headerMode.textContent = `Day 30 of 30 · Using ${dataSource.sourceId} data source`;
  }
  
  console.log('[og-twin] Application initialized successfully');
}

// Application initialization
async function main() {
  try {
    console.log('[og-twin] Initializing application...');
    const dataSource = await initializeDataSource();
    await renderApp(dataSource);
  } catch (error) {
    console.error('[og-twin] Failed to initialize application:', error);
    const app = document.getElementById('map-wrap');
    if (app) {
      app.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    padding: 20px; background: rgba(214,51,78,0.15); border: 1px solid rgb(214,51,78); 
                    border-radius: 8px; color: #d6dde8; max-width: 500px;">
          <h2 style="margin: 0 0 10px; color: rgb(214,51,78);">Initialization Error</h2>
          <p style="margin: 0;">Failed to load data: ${error instanceof Error ? error.message : String(error)}</p>
        </div>
      `;
    }
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
