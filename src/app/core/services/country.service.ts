// src/app/core/services/country.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Country } from '../../interfaces/country.interface';

@Injectable({ providedIn: 'root' })
export class CountryService {
  // private apiUrl = 'http://localhost:48080/api/points-of-interest';
  private apiUrl = 'http://localhost:48080/api/points-of-interest/countries'; // URL relative pour utiliser le proxy
  //  const deleteUrl = `http://localhost:48080/api/points-of-interest/${id}/delete`;
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token récupéré:', token); // Debug

    // Vérifier si le token est expiré
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        console.log('Token expire à:', new Date(payload.exp * 1000));
        console.log('Maintenant:', new Date(now * 1000));
        console.log('Token expiré?', payload.exp < now);
      } catch (e) {
        console.error('Erreur lors du décodage du token:', e);
      }
    }

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /** Pays non supprimés */
  getCountries(): Observable<Country[]> {
    return this.http
      .get<any>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map(r => {
          console.log('Réponse complète de l\'API:', r);
          console.log('Type de la réponse:', typeof r);
          console.log('Propriétés de la réponse:', Object.keys(r));
          
          // Vérifier différentes structures possibles
          if (r && r.countries) {
            return r.countries;
          } else if (Array.isArray(r)) {
            return r;
          } else if (r && r.data) {
            return r.data;
          } else {
            console.error('Structure de réponse inattendue:', r);
            return [];
          }
        }),
        catchError(error => {
          console.error('Erreur lors de la récupération des pays:', error);
          return throwError(error);
        })
      );
  }

  /** Pays supprimés (soft-delete) */
  getDeletedCountries(): Observable<Country[]> {
    return this.http
      .get<{ countries: Country[] }>(`${this.apiUrl}?deleted=1`, { headers: this.getHeaders() })
      .pipe(map(r => r.countries));
  }

  addCountry(country: { name: string; flag: string }): Observable<{ countryId: number }> {
    // Construction du payload pour points-of-interest
    const payload = {
      url: country.flag,
      name: country.name,
      type: 'PAYS'
    };
    const endpoint = 'http://localhost:48080/api/points-of-interest';
    return this.http.post<{ countryId: number }>(
      endpoint,
      payload,
      { headers: this.getHeaders() }
    );
  }

  publishCountry(id: number) {
    return this.http.post(this.apiUrl, { action: 'publish', countryId: id }, { headers: this.getHeaders() });
  }

  unpublishCountry(id: number) {
    return this.http.post(this.apiUrl, { action: 'unpublish', countryId: id }, { headers: this.getHeaders() });
  }

deleteCountry(id: number) {
  console.log('ID passé à deleteCountry:', id); // Debug pour vérifier l'id
  const deleteUrl = `http://localhost:48080/api/points-of-interest/${id}/delete`;
  return this.http.patch(deleteUrl, {}, { headers: this.getHeaders() });
}

  restoreCountry(id: number) {
    return this.http.post(this.apiUrl, { action: 'restore', countryId: id }, { headers: this.getHeaders() });
  }
}
