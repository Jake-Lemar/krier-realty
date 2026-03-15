import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Property, PropertySearchFilters } from '../models/property.model';
import { MlsAdapter } from './mls-adapter.interface';

interface ApiListingsResponse {
  data: Property[];
  count: number;
}

interface ApiPropertyResponse {
  data: Property;
}

@Injectable({ providedIn: 'root' })
export class ApiAdapter implements MlsAdapter {
  readonly mlsId = 'API';
  readonly displayName = 'API (NE + IA)';
  readonly coverageStates = ['NE', 'IA'];

  private readonly base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  search(filters?: PropertySearchFilters): Observable<Property[]> {
    let params = new HttpParams();
    if (filters?.state)        params = params.set('state', filters.state);
    if (filters?.minPrice)     params = params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice)     params = params.set('maxPrice', String(filters.maxPrice));
    if (filters?.minBeds)      params = params.set('minBeds', String(filters.minBeds));
    if (filters?.minBaths)     params = params.set('minBaths', String(filters.minBaths));
    if (filters?.propertyType) params = params.set('propertyType', filters.propertyType);
    if (filters?.query)        params = params.set('query', filters.query);

    return this.http
      .get<ApiListingsResponse>(`${this.base}/api/listings`, { params })
      .pipe(
        map(res => res.data),
        catchError(err => {
          console.error('[ApiAdapter.search]', err);
          return of([]);
        })
      );
  }

  getById(id: string): Observable<Property | undefined> {
    return this.http
      .get<ApiPropertyResponse>(`${this.base}/api/listing/${id}`)
      .pipe(
        map(res => res.data),
        catchError(err => {
          console.error('[ApiAdapter.getById]', err);
          return of(undefined);
        })
      );
  }

  getSold(state?: string): Observable<Property[]> {
    let params = new HttpParams();
    if (state) params = params.set('state', state);

    return this.http
      .get<ApiListingsResponse>(`${this.base}/api/listings/sold`, { params })
      .pipe(
        map(res => res.data),
        catchError(err => {
          console.error('[ApiAdapter.getSold]', err);
          return of([]);
        })
      );
  }
}
