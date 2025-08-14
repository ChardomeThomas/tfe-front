// src/app/core/services/voyage.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Voyage } from '../../interfaces/voyage.interface';
import { environment } from '../../../environments/environment';
import { CountryService } from './country.service';

@Injectable({ providedIn: 'root' })
export class VoyageService {
  private apiUrl = `${environment.apiUrl}/trips`;

  constructor(
    private http: HttpClient,
    private countryService: CountryService 
  ) {}

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
    getVoyagesByCountrySlug(countrySlug: string): Observable<Voyage[]> {
    return this.countryService.getCountryIdBySlug(countrySlug).pipe(
      switchMap(countryId => this.getVoyagesByCountryId(countryId))
    );
  }

  /** Récupère un voyage par le slug du pays et le slug du voyage */
  getVoyageBySlug(countrySlug: string, voyageSlug: string): Observable<Voyage> {
    return this.getVoyagesByCountrySlug(countrySlug).pipe(
      map(voyages => {
        const voyage = voyages.find(v => this.createSlug(v.title) === voyageSlug);
        if (!voyage) {
          throw new Error(`Voyage avec le slug "${voyageSlug}" non trouvé`);
        }
        return voyage;
      })
    );
  }

  /** Crée un slug à partir d'un titre */
  private createSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[àáâäãå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
}
