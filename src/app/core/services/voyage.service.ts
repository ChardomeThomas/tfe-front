// src/app/core/services/voyage.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Voyage } from '../../../interfaces/country.interface';

@Injectable({ providedIn: 'root' })
export class VoyageService {
  private apiUrl = 'https://thomas-chardome.be/ajout-json/voyages.php';
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  /** Voyages actifs pour un pays */
  getVoyagesByCountryId(countryId: number): Observable<Voyage[]> {
    const params = new HttpParams().set('countryId', countryId.toString());
    return this.http
      .get<{voyages: Voyage[]}>(this.apiUrl, { params })
      .pipe(map(r => r.voyages));
  }

  /** Voyages supprimés pour un pays */
  getDeletedVoyagesByCountryId(countryId: number): Observable<Voyage[]> {
    const params = new HttpParams()
        .set('countryId', countryId.toString())
        .set('deleted', '1');
    return this.http
      .get<{voyages: Voyage[]}>(this.apiUrl, { params })
      .pipe(map(r => r.voyages));
  }

  /** Voyages dépubliés pour un pays */
  getUnpublishedVoyagesByCountryId(countryId: number): Observable<Voyage[]> {
    const params = new HttpParams()
        .set('countryId', countryId.toString())
        .set('unpublished', '1');
    return this.http
      .get<{voyages: Voyage[]}>(this.apiUrl, { params })
      .pipe(map(r => r.voyages));
  }

  addVoyage(data: {
    countryId: number;
    name: string;
    date_debut: string;
    date_fin: string;
  }): Observable<{ voyageId: number }> {
    return this.http.post<{ voyageId: number }>(
      this.apiUrl,
      data,
      { headers: this.headers }
    );
  }

  publishVoyage(id: number): Observable<any> {
    return this.http.post(this.apiUrl, { action: 'publish', voyageId: id }, { headers: this.headers });
  }

  unpublishVoyage(id: number): Observable<any> {
    return this.http.post(this.apiUrl, { action: 'unpublish', voyageId: id }, { headers: this.headers });
  }

  deleteVoyage(id: number): Observable<any> {
    return this.http.post(this.apiUrl, { action: 'delete', voyageId: id }, { headers: this.headers });
  }

  restoreVoyage(id: number): Observable<any> {
    return this.http.post(this.apiUrl, { action: 'restore', voyageId: id }, { headers: this.headers });
  }
}
