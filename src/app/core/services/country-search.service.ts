import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

export interface CountryResult {
  name: { common: string; official?: string };
  translations?: Record<string, { common: string }>;
  altSpellings?: string[];
  flags: { png: string; svg: string };
}

@Injectable({ providedIn: 'root' })
export class CountrySearchService {
  private allCountries: CountryResult[] = [];

  constructor(private http: HttpClient) {}

  /** Charge une fois pour toutes la liste des pays */
  loadAll(): Observable<CountryResult[]> {
    if (this.allCountries.length) {
      return of(this.allCountries);
    }
    return this.http.get<CountryResult[]>(
      'https://restcountries.com/v3.1/all',
      { params: { fields: 'name,translations,altSpellings,flags' } }
    ).pipe(
      tap(list => this.allCountries = list)
    );
  }

  /** Normalisation simple (é→e, minuscules, -/_→espace, trim) */
  normalize(str: string): string {
    return str
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Propose jusqu’à 10 suggestions dont common, traductions ou altSpellings contiennent le fragment */
  suggest(fragment: string): CountryResult[] {
    const term = this.normalize(fragment);
    return this.allCountries
      .filter(c => {
        if (this.normalize(c.name.common).includes(term)) {
          return true;
        }
        if (c.translations) {
          for (const t of Object.values(c.translations)) {
            if (this.normalize(t.common).includes(term)) {
              return true;
            }
          }
        }
        if (c.altSpellings?.some(a => this.normalize(a).includes(term))) {
          return true;
        }
        return false;
      })
      .slice(0, 10);
  }
}
