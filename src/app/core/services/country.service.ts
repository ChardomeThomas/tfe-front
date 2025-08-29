import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Country } from '../../interfaces/country.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private apiUrl = `${environment.apiUrl}/points-of-interest/countries`;
  private countriesCache: Map<string, Country> = new Map();
  private idToSlugMap: Map<number, string> = new Map();

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(r => {
        let countries = [];
        if (r && r.countries) {
          countries = r.countries;
        } else if (Array.isArray(r)) {
          countries = r;
        } else if (r && r.data) {
          countries = r.data;
        }

        // Construire le cache slug/country
        countries.forEach((country: Country) => {
          const slug = this.createSlug(country.name);
          this.countriesCache.set(slug, country);
          this.idToSlugMap.set(country.id, slug);
        });

        return countries;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des pays:', error);
        return throwError(error);
      })
    );
  }

  // Nouvelles méthodes pour les slugs
  getCountryBySlug(slug: string): Observable<Country> {
    if (this.countriesCache.has(slug)) {
      return of(this.countriesCache.get(slug)!);
    }
    return this.getCountries().pipe(
      map(countries => countries.find(c => this.createSlug(c.name) === slug)!)
    );
  }

  getCountryIdBySlug(slug: string): Observable<number> {
    return this.getCountryBySlug(slug).pipe(
      map(country => country.id)
    );
  }

  getCountrySlugById(id: number): Observable<string> {
    if (this.idToSlugMap.has(id)) {
      return of(this.idToSlugMap.get(id)!);
    }
    return this.getCountries().pipe(
      map(() => this.idToSlugMap.get(id) || 'inconnu')
    );
  }

  createSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[àáâäãå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}