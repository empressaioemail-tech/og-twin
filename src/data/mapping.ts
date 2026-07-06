import type { WellAtom, ProductionTimeseriesAtom, EquipmentStateAtom } from '../types/atoms';
import type { Well } from '../types/view-models';

/**
 * Mapping layer: atoms → view-model shapes.
 * 
 * This mapping IS the future BFF client contract. It converts atoms from the
 * atom contract schemas into the view-model shapes the UI consumes. Both sides
 * are typed so changes surface at compile time.
 */

/**
 * Maps a well atom to the view-model Well shape.
 * The view model includes operational metrics derived from production and equipment state.
 */
export function mapWellAtomToViewModel(
  wellAtom: WellAtom,
  productionStreams: ProductionTimeseriesAtom[],
  equipmentState?: EquipmentStateAtom
): Well {
  // Find production variance from oil stream (if any)
  const oilStream = productionStreams.find(
    s => s.anchorKind === 'well' && s.anchorDid === wellAtom.wellDid && s.product === 'oil'
  );
  
  // Compute production variance from recent observations (last 2 periods)
  let production_variance = 0;
  if (oilStream && oilStream.observations.length >= 2) {
    const recent = oilStream.observations[oilStream.observations.length - 1].volume;
    const previous = oilStream.observations[oilStream.observations.length - 2].volume;
    production_variance = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
  }
  
  // Equipment health from equipment state (if present)
  const equipment_health = equipmentState?.stateSnapshot?.health as number ?? 85;
  const well_communication = equipmentState?.stateSnapshot?.communication as number ?? 92;
  const sensor_reliability = equipmentState?.stateSnapshot?.sensorReliability as number ?? 95;
  
  // Extract well ID as integer from API-14
  const wellId = parseInt(wellAtom.apiNumber14.replace(/\D/g, '').slice(-6), 10) || 0;
  
  return {
    id: wellId,
    lng: wellAtom.surfaceLocation.lng,
    lat: wellAtom.surfaceLocation.lat,
    cluster: `${wellAtom.district} District`,
    padName: wellAtom.wellName,
    production_variance,
    active_exceptions: 0, // Derived from separate exception/alert atoms (not in minimal fixture)
    downtime_exposure: 0, // Derived from production gaps
    pressure_anomaly: 0,  // Derived from pressure telemetry (not in minimal fixture)
    equipment_health,
    well_communication,
    sensor_reliability,
    recent_changes: 0     // Derived from event atoms (not in minimal fixture)
  };
}

/**
 * Maps multiple well atoms to view-model wells.
 */
export function mapWellAtomsToViewModels(
  wellAtoms: WellAtom[],
  productionStreams: ProductionTimeseriesAtom[],
  equipmentStates: EquipmentStateAtom[]
): Well[] {
  return wellAtoms.map(wellAtom => {
    const wellStreams = productionStreams.filter(
      s => s.anchorKind === 'well' && s.anchorDid === wellAtom.wellDid
    );
    const wellEquipment = equipmentStates.find(e => e.wellDid === wellAtom.wellDid);
    return mapWellAtomToViewModel(wellAtom, wellStreams, wellEquipment);
  });
}

/**
 * Validates the Texas reporting split rule: oil at rrc-lease grain, gas at well grain.
 * This is a load-bearing validation from the ADR and task spec.
 */
export function validateReportingSplit(stream: ProductionTimeseriesAtom): boolean {
  if (stream.product === 'oil' && stream.anchorKind !== 'rrc-lease') {
    return false; // Oil must anchor to rrc-lease
  }
  if (stream.product === 'gas' && stream.anchorKind !== 'well') {
    return false; // Gas must anchor to well
  }
  return true;
}
