import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Country } from '../../../interfaces/country.interface';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private countriesUrl = 'https://thomas-chardome.be/ajout-json/countries.json';

  constructor(private http: HttpClient) {}

  /** Retourne directement Country[] au lieu de {countries: Country[]} */
  getCountries(): Observable<Country[]> {
    return this.http
      .get<{ countries: Country[] }>(this.countriesUrl)
      .pipe(map(response => response.countries));
  }
}
