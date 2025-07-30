import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photo } from '../../../interfaces/country.interface';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  /** Récupère une photo favorite aléatoire pour un voyage */
  getRandomFavoritePhotoByTripId(tripId: number): Observable<{ url: string }> {
    const url = `http://localhost:48080/api/photos/trip/${tripId}/random-favorite`;
    return this.http.get<{ url: string }>(url);
  }
  constructor(private http: HttpClient) { }

  getPhotosByDay(dayId: number, role: string = ''): Observable<Photo[]> {
    let url = '';
    if (['admin', 'superadmin', 'amis'].includes(role)) {
      url = `http://localhost:48080/api/photos/day/${dayId}`;
    } else {
      url = `http://localhost:48080/api/photos/day/${dayId}/public`;
    }
    return this.http.get<Photo[]>(url);
  }

  getRandomPhotoByDay(dayId: number, role: string = ''): Observable<Photo | null> {
    return new Observable(observer => {
      this.getPhotosByDay(dayId, role).subscribe(photos => {
        if (photos.length > 0) {
          const randomIndex = Math.floor(Math.random() * photos.length);
          observer.next(photos[randomIndex]);
        } else {
          observer.next(null);
        }
        observer.complete();
      }, err => {
        observer.error(err);
      });
    });
  }
}
