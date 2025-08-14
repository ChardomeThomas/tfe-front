import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Country } from '../../interfaces/country.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private apiUrl = `${environment.apiUrl}/points-of-interest/countries`;

  constructor(private http: HttpClient) {}


  getCountries(): Observable<Country[]> {
    return this.http
      .get<any>(this.apiUrl)
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

}