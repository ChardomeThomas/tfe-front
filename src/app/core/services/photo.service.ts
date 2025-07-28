import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photo } from '../../../interfaces/country.interface';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  constructor(private http: HttpClient) { }

  getPhotosByDay(dayId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`http://localhost:48080/api/photos/day/${dayId}`);
  }

  getRandomPhotoByDay(dayId: number): Observable<Photo | null> {
    return new Observable(observer => {
      this.getPhotosByDay(dayId).subscribe(photos => {
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
