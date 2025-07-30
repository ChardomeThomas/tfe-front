// src/app/core/services/admin/countryAdmin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Country } from '../../../../interfaces/country.interface';

@Injectable({ providedIn: 'root' })
export class CountryAdminService {
  private readonly baseUrl = 'http://localhost:48080/api/points-of-interest';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * Récupère le résumé admin, puis ne garde que les éléments de type PAYS
   */
  getAdminSummary(): Observable<{ deleted: Country[]; drafts: Country[]; published: Country[] }> {
    return this.http
      .get<any>(this.buildUrl('/admin-summary'), { headers: this.getHeaders() })
      .pipe(
        map(r => ({
          deleted:   (r.deleted   || []).filter((c: Country) => c.type === 'PAYS'),
          drafts:    (r.drafts    || []).filter((c: Country) => c.type === 'PAYS'),
          published: (r.published || []).filter((c: Country) => c.type === 'PAYS'),
        })),
        catchError(error => {
          console.error('Erreur getAdminSummary:', error);
          return throwError(error);
        })
      );
  }

  addCountry(country: { name: string; flag: string }): Observable<{ countryId: number }> {
    const payload = { url: country.flag, name: country.name, type: 'PAYS' };
    return this.http.post<{ countryId: number }>(
      this.baseUrl,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        console.error('Erreur addCountry:', err);
        return throwError(err);
      })
    );
  }

  publishCountry(id: number): Observable<void> {
    return this.http.patch<void>(
      this.buildUrl(`/${id}/publish`),
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        console.error('Erreur publishCountry:', err);
        return throwError(err);
      })
    );
  }

  unpublishCountry(id: number): Observable<void> {
    return this.http.patch<void>(
      this.buildUrl(`/${id}/unpublish`),
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        console.error('Erreur unpublishCountry:', err);
        return throwError(err);
      })
    );
  }

  deleteCountry(id: number): Observable<void> {
    return this.http.patch<void>(
      this.buildUrl(`/${id}/delete`),
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        console.error('Erreur deleteCountry:', err);
        return throwError(err);
      })
    );
  }

  restoreCountry(id: number): Observable<void> {
    return this.http.patch<void>(
      this.buildUrl(`/${id}/restore`),
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        console.error('Erreur restoreCountry:', err);
        return throwError(err);
      })
    );
  }
}
