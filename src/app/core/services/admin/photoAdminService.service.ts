// src/app/core/services/admin/PhotoAdminService.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Photo } from '../../../interfaces/photo.interface';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PhotoAdminService {
  private apiUrl = `${environment.apiUrl}/photos`;

  constructor(private http: HttpClient) {}
  
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
  
  private buildUrl(path: string): string {
    return `${this.apiUrl}${path}`;
  }

  // Récupère le résumé admin des photos pour un jour (dayId)
  getAdminSummary(dayId: number): Observable<{ deleted: Photo[]; drafts: Photo[]; published: Photo[] }> {
    return this.http
      .get<Photo[] | { deleted: Photo[]; drafts: Photo[]; published: Photo[] }>(`${environment.apiUrl}/photos/admin/day/${dayId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('Réponse admin-summary photos:', response);
          
          // Si le backend renvoie déjà un objet avec les catégories séparées
          if (response && typeof response === 'object' && !Array.isArray(response) && 
              ('published' in response || 'drafts' in response || 'deleted' in response)) {
            return {
              published: (response as any).published || [],
              drafts: (response as any).drafts || [],
              deleted: (response as any).deleted || []
            };
          }

          // Si le backend renvoie un tableau de photos, on fait la catégorisation côté client
          const allPhotos: Photo[] = Array.isArray(response) ? response : [];
          
          console.log('Photos reçues du backend:', allPhotos);
          
          // Logique de catégorisation basée sur les propriétés des photos
          const deleted = allPhotos.filter(p => {
            // Une photo est supprimée si deletedAt a une valeur (pas null, undefined ou vide)
            const deletedAtValue = p.deletedAt;
            const isDeleted = deletedAtValue && deletedAtValue !== null && deletedAtValue !== undefined && deletedAtValue !== '';
            console.log(`Photo ${p.id}: deletedAt = "${deletedAtValue}", type = ${typeof deletedAtValue}, isDeleted = ${isDeleted}`);
            return isDeleted;
          });
          
          const nonDeletedPhotos = allPhotos.filter(p => {
            // Une photo n'est pas supprimée si deletedAt est null, undefined ou vide
            const deletedAtValue = p.deletedAt;
            const isNotDeleted = !deletedAtValue || deletedAtValue === null || deletedAtValue === undefined || deletedAtValue === '';
            console.log(`Photo ${p.id}: deletedAt = "${deletedAtValue}", isNotDeleted = ${isNotDeleted}`);
            return isNotDeleted;
          });
          
          const published = nonDeletedPhotos.filter(p => {
            // Une photo est publiée si elle a une publishedDate (peu importe isPublic)
            const publishedDateValue = p.publishedDate;
            const isPublished = publishedDateValue && publishedDateValue !== null && publishedDateValue !== undefined && publishedDateValue !== '';
            console.log(`Photo ${p.id}: publishedDate = "${publishedDateValue}", type = ${typeof publishedDateValue}, isPublished = ${isPublished}`);
            return isPublished;
          });
          
          const drafts = nonDeletedPhotos.filter(p => {
            // Une photo est en brouillon si elle n'a pas de publishedDate
            const publishedDateValue = p.publishedDate;
            const isDraft = !publishedDateValue || publishedDateValue === null || publishedDateValue === undefined || publishedDateValue === '';
            console.log(`Photo ${p.id}: publishedDate = "${publishedDateValue}", isDraft = ${isDraft}`);
            return isDraft;
          });

          console.log('Catégorisation détaillée:', {
            total: allPhotos.length,
            published: published.length,
            drafts: drafts.length,
            deleted: deleted.length
          });

          return { published, drafts, deleted };
        }),
        catchError(error => {
          console.error('Erreur getAdminSummary photos:', error);
          return throwError(error);
        })
      );
  }

  // Ajouter une photo
  addPhoto(data: {
    dayId: number;
    url: string;
    thumbnailUrl?: string;
    description?: string;
    favorite?: boolean;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur addPhoto:', error);
          return throwError(error);
        })
      );
  }

  // Publier une photo
  publishPhoto(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/publish`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur publishPhoto:', error);
          return throwError(error);
        })
      );
  }

  // Dépublier une photo
  unpublishPhoto(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/unpublish`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur unpublishPhoto:', error);
          return throwError(error);
        })
      );
  }

  // Supprimer une photo (soft delete)
  deletePhoto(id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/photos/${id}/delete`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur deletePhoto:', error);
          return throwError(error);
        })
      );
  }

  // Restaurer une photo
  restorePhoto(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/restore`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur restorePhoto:', error);
          return throwError(error);
        })
      );
  }

  // Mettre à jour une photo
  updatePhoto(id: number, data: { description?: string; favorite?: boolean }): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}`), data, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur updatePhoto:', error);
          return throwError(error);
        })
      );
  }

  // Toggle favori d'une photo
  toggleFavorite(id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/photos/${id}/toggle-favorite`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur toggleFavorite:', error);
          return throwError(error);
        })
      );
  }

  // Toggle public/privé d'une photo
  togglePublic(id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/photos/${id}/toggle-public`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur togglePublic:', error);
          return throwError(error);
        })
      );
  }

  // Uploader une nouvelle photo
uploadPhoto(file: File, dayId: number, description?: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);  
  formData.append('dayId', dayId.toString());
  if (description) {
    formData.append('description', description);
  }

  let headers = new HttpHeaders();
  const token = localStorage.getItem('token');
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return this.http.post(`${this.apiUrl}/upload`, formData, { headers })
    .pipe(
      catchError(error => {
        console.error('Erreur uploadPhoto:', error);
        return throwError(error);
      })
    );
}

// Uploader plusieurs photos
uploadMultiplePhotos(files: File[], dayId: number, description?: string): Observable<any> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('dayId', dayId.toString());
  if (description) {
    formData.append('description', description);
  }

  let headers = new HttpHeaders();
  const token = localStorage.getItem('token');
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return this.http.post(`${this.apiUrl}/upload-multiple`, formData, { headers })
    .pipe(
      catchError(error => {
        console.error('Erreur uploadMultiplePhotos:', error);
        return throwError(error);
      })
    );
}

// Uploader plusieurs photos avec descriptions individuelles
uploadMultiplePhotosWithDescriptions(
  filesWithOptions: {
    file: File, 
    description: string, 
    isFavorite: boolean, 
    isPublic: boolean, 
    isPublished: boolean
  }[], 
  dayId: number
): Observable<any> {
  const formData = new FormData();
  
  console.log('=== SERVICE: Préparation FormData ===');
  console.log('Nombre de fichiers reçus:', filesWithOptions.length);
  
  filesWithOptions.forEach((item, index) => {
    console.log(`Service - Photo ${index + 1}:`, {
      filename: item.file.name,
      description: item.description,
      descriptionLength: item.description ? item.description.length : 0,
      isFavorite: item.isFavorite,
      isPublic: item.isPublic,
      isPublished: item.isPublished
    });
    
    formData.append('files', item.file);
    // Pour Spring Boot, envoyer chaque description comme un élément séparé du même paramètre
    formData.append('description', item.description || '');
    
    console.log(`FormData: description = "${item.description || ''}"`);
  });
  formData.append('dayId', dayId.toString());
  
  // Afficher tout le contenu de FormData pour debug
  console.log('=== CONTENU FINAL FormData ===');
  for (let pair of (formData as any).entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }
  
  console.log('FormData envoyée vers:', `${this.apiUrl}/upload-multiple`);

  let headers = new HttpHeaders();
  const token = localStorage.getItem('token');
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return this.http.post(`${this.apiUrl}/upload-multiple`, formData, { headers })
    .pipe(
      catchError(error => {
        console.error('Erreur uploadMultiplePhotosWithDescriptions:', error);
        return throwError(error);
      })
    );
}





}
