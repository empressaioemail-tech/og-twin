import { SyntheticDataSource } from './data/SyntheticDataSource';
import { SeededReevesDataSource } from './data/SeededReevesDataSource';
import type { TwinDataSource } from './data/TwinDataSource';

/**
 * Main application entry point.
 * 
 * Implements the runtime toggle via query param ?source=seeded|synthetic (default seeded).
 * Initializes the selected data source and renders the UI.
 */

// Parse query params to determine data source
function getDataSource(): 'seeded' | 'synthetic' {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  
  if (source === 'synthetic') {
    return 'synthetic';
  }
  
  // Default to seeded per spec
  return 'seeded';
}

// Initialize the appropriate data source
async function initializeDataSource(): Promise<TwinDataSource> {
  const sourceType = getDataSource();
  
  if (sourceType === 'synthetic') {
    console.log('Using SyntheticDataSource (mockup generators)');
    return new SyntheticDataSource();
  } else {
    console.log('Using SeededReevesDataSource (fixture-based, Reeves County)');
    const source = new SeededReevesDataSource();
    await source.loadFixtures();
    return source;
  }
}

// Add honesty labels to operator overlay panels when seeded source is active
function addHonestyLabels(sourceId: 'seeded' | 'synthetic') {
  if (sourceId !== 'seeded') return;
  
  // The panels that public RRC data cannot feed must be labeled as OPERATOR OVERLAY
  const overlayPanels = [
    'Equipment health',
    'Sensor confidence', 
    'Well communication',
    'Pressure instability'
  ];
  
  console.log(`[Honesty labeling] Seeded source active. Panels requiring operator overlay: ${overlayPanels.join(', ')}`);
  
  // In a full implementation, these would be visually tagged in the UI
  // For now, we log the requirement and document it
}

// Render the UI
function renderUI(dataSource: TwinDataSource) {
  const wells = dataSource.getWells();
  const clusters = dataSource.getClusters();
  const timelineEvents = dataSource.getTimelineEvents();
  const causeBreakdown = dataSource.getCauseBreakdown();
  const fieldOverview = dataSource.getFieldOverview();
  
  console.log(`Loaded ${wells.length} wells from ${dataSource.sourceId} source`);
  console.log(`Field overview:`, fieldOverview);
  console.log(`Clusters:`, clusters.length);
  console.log(`Timeline events:`, timelineEvents.length);
  console.log(`Cause breakdown:`, causeBreakdown);
  
  // Add honesty labels if using seeded source
  addHonestyLabels(dataSource.sourceId);
  
  // Update DOM with data
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="padding: 20px; color: var(--text);">
        <h2>og-twin: Reeves County Field Health</h2>
        <p><strong>Data Source:</strong> ${dataSource.sourceId === 'seeded' ? 'Seeded (Reeves County fixtures)' : 'Synthetic (Basin-wide mockup)'}</p>
        <p><strong>Total Wells:</strong> ${wells.length}</p>
        <p><strong>Active Clusters:</strong> ${clusters.length}</p>
        <p><strong>Average Health:</strong> ${fieldOverview.averageHealth.toFixed(1)}/100</p>
        <p><strong>Total Production:</strong> ${fieldOverview.totalProduction.toLocaleString()} BOE/d</p>
        
        ${dataSource.sourceId === 'seeded' ? `
          <div style="margin-top: 20px; padding: 12px; background: rgba(240,177,78,0.15); border: 1px solid rgba(240,177,78,0.45); border-radius: 6px;">
            <strong style="color: #f0b14e;">HONESTY LABELING ACTIVE</strong>
            <p style="font-size: 12px; margin-top: 8px;">
              Panels requiring operator overlay data (Equipment health, Sensor confidence, Well communication, Pressure instability) 
              would be visibly tagged as "OPERATOR OVERLAY — seeded" in the full UI.
            </p>
          </div>
        ` : ''}
        
        <div style="margin-top: 20px;">
          <h3>Wells Sample (first 5):</h3>
          <ul style="font-size: 12px;">
            ${wells.slice(0, 5).map(w => `
              <li>
                <strong>${w.padName || `Well #${w.id}`}</strong> 
                (${w.lat.toFixed(3)}°, ${w.lng.toFixed(3)}°) 
                - Health: ${w.equipment_health.toFixed(0)}/100
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div style="margin-top: 20px;">
          <p style="font-size: 11px; color: var(--muted);">
            Toggle data source: 
            <a href="?source=seeded" style="color: var(--accent);">?source=seeded</a> | 
            <a href="?source=synthetic" style="color: var(--accent);">?source=synthetic</a>
          </p>
        </div>
      </div>
    `;
  }
  
  // In a full implementation, this would initialize MapLibre + deck.gl and render the 3D visualization
  // For now, we've demonstrated the data architecture and source toggle
}

// Application initialization
async function main() {
  try {
    const dataSource = await initializeDataSource();
    renderUI(dataSource);
  } catch (error) {
    console.error('Failed to initialize application:', error);
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div style="padding: 20px; color: var(--bad);">
          <h2>Error</h2>
          <p>Failed to load data: ${error instanceof Error ? error.message : String(error)}</p>
        </div>
      `;
    }
  }
}

// Start the application
main();
