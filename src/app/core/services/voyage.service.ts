import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Voyage } from '../../../interfaces/country.interface';

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private voyagesUrl = 'https://thomas-chardome.be/ajout-json/voyages.json';

  constructor(private http: HttpClient) {}

  /** Retourne les voyages filtrés par countryId */
  getVoyagesByCountryId(countryId: number): Observable<Voyage[]> {
    return this.http
      .get<{ voyage: Voyage[] }>(this.voyagesUrl)
      .pipe(map(response => response.voyage.filter(v => v.countryId === countryId)));
  }
}
