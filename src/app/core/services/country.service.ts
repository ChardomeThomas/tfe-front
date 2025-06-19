// src/app/core/services/country.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../../../interfaces/country.interface';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private apiUrl = 'https://thomas-chardome.be/ajout-json/countries.php';
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  /** Pays non supprimés */
  getCountries(): Observable<Country[]> {
    return this.http
      .get<{ countries: Country[] }>(this.apiUrl)
      .pipe(map(r => r.countries));
  }

  /** Pays supprimés (soft-delete) */
  getDeletedCountries(): Observable<Country[]> {
    return this.http
      .get<{ countries: Country[] }>(`${this.apiUrl}?deleted=1`)
      .pipe(map(r => r.countries));
  }

  addCountry(country: { name: string; flag: string }): Observable<{ countryId: number }> {
    return this.http.post<{ countryId: number }>(
      this.apiUrl,
      country,
      { headers: this.headers }
    );
  }

  publishCountry(id: number) {
    return this.http.post(this.apiUrl, { action: 'publish', countryId: id }, { headers: this.headers });
  }

  unpublishCountry(id: number) {
    return this.http.post(this.apiUrl, { action: 'unpublish', countryId: id }, { headers: this.headers });
  }

  deleteCountry(id: number) {
    return this.http.post(this.apiUrl, { action: 'delete', countryId: id }, { headers: this.headers });
  }

  restoreCountry(id: number) {
    return this.http.post(this.apiUrl, { action: 'restore', countryId: id }, { headers: this.headers });
  }
}
