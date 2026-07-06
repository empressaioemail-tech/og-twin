import type { Well, Cluster, TimelineEvent, CauseBreakdown, FieldOverview, WellLogCorrelationData } from '../types/view-models';

/**
 * TwinDataSource - the core data adapter interface.
 * 
 * All data structures the mockup consumes (wells, clusters, timeline events,
 * KPIs, cause breakdown, well-log correlation dataset, knowledge graph) are
 * accessed through this interface. Two implementations:
 * 
 * - SyntheticDataSource: the mockup's existing generators
 * - SeededReevesDataSource: loads JSON fixtures conforming to atom contract schemas
 */
export interface TwinDataSource {
  /** Source identifier for labeling */
  readonly sourceId: 'synthetic' | 'seeded';
  
  /** Get all wells */
  getWells(): Well[];
  
  /** Get all clusters/regions */
  getClusters(): Cluster[];
  
  /** Get timeline events for the scrubber */
  getTimelineEvents(): TimelineEvent[];
  
  /** Get cause breakdown percentages */
  getCauseBreakdown(): CauseBreakdown[];
  
  /** Get field-level KPIs */
  getFieldOverview(): FieldOverview;
  
  /** Get well log correlation case study data */
  getWellLogCorrelationData(): WellLogCorrelationData;
  
  /** Get knowledge graph nodes (for future BFF integration) */
  getKnowledgeGraphNodes(): Array<{id: string; type: string; label: string}>;
}
