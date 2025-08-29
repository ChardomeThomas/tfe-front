import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photo } from '../../interfaces/photo.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly baseUrl = `${environment.apiUrl}/photos`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (e) {
      console.error('Token invalide:', e);
      return false;
    }
  }

  getPhotosByDay(dayId: number, role: string = ''): Observable<Photo[]> {
    // Si un rôle est spécifié et que l'utilisateur est authentifié
    if (['ADMIN', 'SUPERADMIN', 'amis'].includes(role) && this.hasValidToken()) {
      const url = `${this.baseUrl}/day/${dayId}`;
      return this.http.get<Photo[]>(url, { headers: this.getHeaders() });
    } 
    // Si utilisateur connecté sans rôle spécifique
    else if (this.hasValidToken()) {
      const url = `${this.baseUrl}/day/${dayId}`;
      return this.http.get<Photo[]>(url, { headers: this.getHeaders() });
    } 
  
    else {
      const url = `${this.baseUrl}/day/${dayId}/public`;
      return this.http.get<Photo[]>(url);
    }
  }


  getPhotosByDayWithRole(dayId: number, role: string = ''): Observable<Photo[]> {
    if (['admin', 'superadmin', 'amis'].includes(role) && this.hasValidToken()) {
   
      const url = `${this.baseUrl}/day/${dayId}`;
      return this.http.get<Photo[]>(url, { headers: this.getHeaders() });
    } else {
   
      const url = `${this.baseUrl}/day/${dayId}/public`;
      return this.http.get<Photo[]>(url);
    }
  }

  getRandomFavoritePhotoByTripId(tripId: number): Observable<{ url: string }> {
    const url = `${this.baseUrl}/trip/${tripId}/random-favorite`;
    

    const isAuthenticated = this.hasValidToken();
    const options = isAuthenticated ? { headers: this.getHeaders() } : {};
    
    return this.http.get<{ url: string }>(url, options);
  }

  // Nouvelle méthode pour récupérer toutes les photos d'un voyage
  getPhotosByTrip(tripId: number): Observable<Photo[]> {
    const url = `${this.baseUrl}/trip/${tripId}`;
    
    if (this.hasValidToken()) {
      return this.http.get<Photo[]>(url, { headers: this.getHeaders() });
    } else {
      // Si pas authentifié, récupérer seulement les photos publiques
      const publicUrl = `${this.baseUrl}/trip/${tripId}/public`;
      return this.http.get<Photo[]>(publicUrl);
    }
  }

  // Méthode pour récupérer une photo aléatoire d'un voyage (favorite en priorité, sinon publique)

getRandomPhotoByTrip(tripId: number, includePrivate: boolean = false): Observable<Photo | null> {
    return new Observable(observer => {
      this.getPhotosByTrip(tripId).subscribe(photos => {
        if (photos.length > 0) {
          // Filtrer les photos selon le paramètre includePrivate
          let filteredPhotos = photos;
          if (!includePrivate) {
            // Si includePrivate est false, on exclut les photos privées
            filteredPhotos = photos.filter(photo => photo.isPublic); 
          }
          
          // Vérifier qu'il reste des photos après filtrage
          if (filteredPhotos.length === 0) {
            observer.next(null);
            observer.complete();
            return;
          }
          
          // Prioriser les photos favorites parmi les photos filtrées
          const favoritePhotos = filteredPhotos.filter(photo => photo.favorite);
          const photosToChooseFrom = favoritePhotos.length > 0 ? favoritePhotos : filteredPhotos;
          
          const randomIndex = Math.floor(Math.random() * photosToChooseFrom.length);
          observer.next(photosToChooseFrom[randomIndex]);
        } else {
          observer.next(null);
        }
        observer.complete();
      }, err => {
        observer.error(err);
      });
    });
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

  getPublicPhotosOnly(dayId: number): Observable<Photo[]> {
    const url = `${this.baseUrl}/day/${dayId}/public`;
    return this.http.get<Photo[]>(url);
  }

 
  canViewPrivatePhotos(): boolean {
    return this.hasValidToken();
  }
}