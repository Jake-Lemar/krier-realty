import { Observable } from 'rxjs';
import { Property, PropertySearchFilters } from '../models/property.model';

/**
 * Common interface for all MLS data adapters.
 * Swap between MockAdapter, real REST adapters, or RESO Web API adapters
 * without changing any consumer code.
 */
export interface MlsAdapter {
  /** Unique MLS system identifier, e.g. 'GPRMLS' or 'IMLS' */
  readonly mlsId: string;
  /** Human-readable name shown in the UI */
  readonly displayName: string;
  /** State abbreviations this MLS covers, e.g. ['NE'] or ['IA'] */
  readonly coverageStates: string[];

  search(filters?: PropertySearchFilters): Observable<Property[]>;
  getById(id: string): Observable<Property | undefined>;
  getSold(): Observable<Property[]>;
}
