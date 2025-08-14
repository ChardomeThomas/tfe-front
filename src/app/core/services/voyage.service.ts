// src/app/core/services/voyage.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Voyage } from '../../interfaces/voyage.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VoyageService {
  private apiUrl = `${environment.apiUrl}/trips`;

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
    return `${this.apiUrl}${path}`;
  }

  /** Voyages actifs pour un pays */
  getVoyagesByCountryId(countryId: number): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(this.buildUrl(`/point-of-interest/${countryId}`), { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur getVoyagesByCountryId:', error);
          return throwError(error);
        })
      );
  }

  /** Voyages par point d'intérêt (id pays) - tous les voyages */
  getVoyagesByPointOfInterestId(pointOfInterestId: number): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(this.buildUrl(`/point-of-interest/${pointOfInterestId}`), { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur getVoyagesByPointOfInterestId:', error);
          return throwError(error);
        })
      );
  }

  /** Récupère un voyage par son id */
  getVoyageById(id: number): Observable<Voyage> {
    return this.http.get<Voyage>(this.buildUrl(`/${id}`), { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur getVoyageById:', error);
          return throwError(error);
        })
      );
  }
}
