import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Country } from '../../../interfaces/country.interface';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private countriesUrl = 'https://thomas-chardome.be/ajout-json/countries.json';
 private addUrl       = 'https://thomas-chardome.be/ajout-json/countries.php';
  constructor(private http: HttpClient) {}

  /** Retourne directement Country[] au lieu de {countries: Country[]} */
  getCountries(): Observable<Country[]> {
    return this.http
      .get<{ countries: Country[] }>(this.countriesUrl)
      .pipe(map(response => response.countries));
  }
    addCountry(country: { name: string; flag: string; }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.addUrl, country, { headers });
  }
  deleteCountry(country: Country): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete(this.addUrl, { headers, body: { countryId: country.countryId } });
  }
}
