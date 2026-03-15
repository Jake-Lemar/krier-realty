import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Property, PropertySearchFilters, Lead } from '../models/property.model';
import { ApiAdapter } from './api-adapter';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  constructor(private api: ApiAdapter) {}

  /**
   * Returns active/pending listings. Pass filters to narrow results.
   */
  getListings(filters?: PropertySearchFilters): Observable<Property[]> {
    return this.api.search(filters).pipe(
      map(props => props.sort(
        (a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
      ))
    );
  }

  /** Returns first 3 active listings for the homepage. */
  getFeaturedListings(): Observable<Property[]> {
    return this.api.search().pipe(
      map(props =>
        props
          .filter(p => p.status === 'active')
          .sort((a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime())
          .slice(0, 3)
      )
    );
  }

  /** Finds a single listing by ID. */
  getListingById(id: string): Observable<Property | undefined> {
    return this.api.getById(id);
  }

  /**
   * Returns sold listings. Pass `state` to scope to 'NE' or 'IA'.
   */
  getSoldListings(state?: string): Observable<Property[]> {
    return this.api.getSold(state).pipe(
      map(props => props.sort(
        (a, b) => new Date(b.soldDate ?? b.listingDate).getTime() - new Date(a.soldDate ?? a.listingDate).getTime()
      ))
    );
  }

  /** Submits a lead to the backend. */
  submitLead(lead: Lead): Observable<{ success: boolean; message: string }> {
    console.log('[Lead submitted]', lead);
    return of({ success: true, message: 'Thank you! Aaron will be in touch shortly.' }).pipe(delay(800));
  }
}
