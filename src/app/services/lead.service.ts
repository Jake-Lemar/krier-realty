import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Lead } from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class LeadService {
  constructor(private http: HttpClient) {}

  submitLead(lead: Lead): Observable<{ success: boolean; message?: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${environment.apiBaseUrl}/api/leads`, lead)
      .pipe(
        catchError(err => {
          console.error('[LeadService]', err);
          return of({ success: false, message: 'Something went wrong. Please try again.' });
        })
      );
  }
}
