import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jour } from '../../../interfaces/country.interface';

@Injectable({
  providedIn: 'root'
})
export class DayService {
  constructor(private http: HttpClient) { }

  getDaysByTrip(tripId: string): Observable<Jour[]> {
    return this.http.get<Jour[]>(`http://localhost:48080/api/days/trip/${tripId}`);
  }
}
