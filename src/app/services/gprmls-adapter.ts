import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { MlsAdapter } from './mls-adapter.interface';
import { Property, PropertySearchFilters } from '../models/property.model';
import { mockProperties } from '../data/mock-properties';

/**
 * Greater Plains Regional MLS adapter (Nebraska).
 * Covers the Greater Omaha and Lincoln metro areas.
 *
 * Mock implementation: returns data from mock-properties.ts.
 * Production swap: replace search/getById/getSold bodies with
 * HTTP calls to the GPRMLS RESO Web API endpoint.
 */
@Injectable({ providedIn: 'root' })
export class GprmlsAdapter implements MlsAdapter {
  readonly mlsId = 'GPRMLS';
  readonly displayName = 'Greater Plains Regional MLS';
  readonly coverageStates = ['NE'];

  search(filters?: PropertySearchFilters): Observable<Property[]> {
    return of(applyFilters(mockProperties, filters)).pipe(delay(80));
  }

  getById(id: string): Observable<Property | undefined> {
    return of(mockProperties.find(p => p.id === id)).pipe(delay(80));
  }

  getSold(): Observable<Property[]> {
    return of(mockProperties.filter(p => p.status === 'sold')).pipe(delay(80));
  }
}

function applyFilters(properties: Property[], filters?: PropertySearchFilters): Property[] {
  let results = [...properties];

  if (!filters) {
    return results.filter(p => p.status !== 'sold');
  }

  if (filters.status && filters.status !== 'all') {
    results = results.filter(p => p.status === filters.status);
  } else if (!filters.status) {
    results = results.filter(p => p.status !== 'sold');
  }

  if (filters.query?.trim()) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter(p =>
      p.address.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.propertyType.toLowerCase().includes(q)
    );
  }

  if (filters.minPrice != null) results = results.filter(p => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) results = results.filter(p => p.price <= filters.maxPrice!);
  if (filters.minBeds != null) results = results.filter(p => p.bedrooms >= filters.minBeds!);
  if (filters.minBaths != null) results = results.filter(p => p.bathrooms >= filters.minBaths!);

  if (filters.propertyType && filters.propertyType !== 'all') {
    results = results.filter(p => p.propertyType === filters.propertyType);
  }

  if (filters.neighborhood) {
    results = results.filter(p =>
      p.neighborhood.toLowerCase() === filters.neighborhood!.toLowerCase()
    );
  }

  return results;
}
