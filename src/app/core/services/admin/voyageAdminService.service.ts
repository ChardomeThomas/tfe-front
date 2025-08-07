// src/app/core/services/admin/VoyageAdminService.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Voyage } from '../../../interfaces/voyage.interface';

@Injectable({ providedIn: 'root' })
export class VoyageAdminService {
  private apiUrl = 'http://localhost:48080/api/trips';

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

  // Récupère le résumé admin des voyages pour un point d'intérêt (pays)
  getAdminSummary(pointOfInterestId: number): Observable<{ deleted: Voyage[]; drafts: Voyage[]; published: Voyage[] }> {
    return this.http
      .get<any>(this.buildUrl(`/admin-summary?pointOfInterestId=${pointOfInterestId}`), { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('Réponse brute admin-summary:', response);
          
          // Fonction utilitaire pour transformer un trip API en Voyage
          const transformTrip = (trip: any): Voyage => ({
            id: trip.id,
            title: trip.title,
            description: trip.description || '',
            startDate: trip.startDate,
            endDate: trip.endDate,
            published: trip.published,
            publishedDate: trip.publishedDate,
            pointOfInterestId: trip.pointOfInterestId,
            pointOfInterestName: trip.pointOfInterestName || '',
            photoUrl: trip.photoUrl,
            deletedAt: trip.deletedAt,
            status: trip.status
          });

          // Si le backend renvoie déjà les catégories séparées
          if (response.published || response.drafts || response.deleted || response.draftsOrUnpublished || response.scheduled) {
            console.log('Réponse déjà catégorisée par le backend');
            return {
              published: (response.published || []).map(transformTrip),
              drafts: (response.drafts || response.draftsOrUnpublished || []).map(transformTrip), // Gérer les deux noms de clé
              deleted: (response.deleted || []).map(transformTrip)
            };
          }

          // Sinon, on fait la catégorisation côté client
          const allTrips: any[] = [];
          Object.keys(response).forEach(key => {
            if (Array.isArray(response[key])) {
              console.log(`Voyages dans la catégorie ${key}:`, response[key]);
              allTrips.push(...response[key]);
            }
          });

          const voyages: Voyage[] = allTrips.map(transformTrip);

          // Logique de catégorisation basée sur les propriétés des voyages
          // D'abord, on sépare les voyages supprimés (qui ont deletedAt non null)
          const deleted = voyages.filter(v => v.deletedAt && v.deletedAt !== null);
          
          // Ensuite, parmi les voyages non supprimés, on catégorise selon leur statut de publication
          const nonDeletedVoyages = voyages.filter(v => !v.deletedAt || v.deletedAt === null);
          const published = nonDeletedVoyages.filter(v => v.published === true && v.publishedDate);
          const drafts = nonDeletedVoyages.filter(v => v.published === false || !v.publishedDate);

          console.log('Voyages catégorisés côté client:', { 
            published: published.length, 
            drafts: drafts.length, 
            deleted: deleted.length 
          });
          console.log('Détail published:', published);
          console.log('Détail drafts:', drafts);
          console.log('Détail deleted:', deleted);

          return { published, drafts, deleted };
        }),
        catchError(error => {
          console.error('Erreur getAdminSummary voyages:', error);
          return throwError(error);
        })
      );
  }

  // Ajouter un voyage
  addVoyage(data: {
    pointOfInterestId: number;
    title: string;
    startDate: string;
    endDate: string;
    description?: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur addVoyage:', error);
          return throwError(error);
        })
      );
  }

  // Publier un voyage
  publishVoyage(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/publish`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur publishVoyage:', error);
          return throwError(error);
        })
      );
  }

  // Dépublier un voyage
  unpublishVoyage(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/unpublish`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur unpublishVoyage:', error);
          return throwError(error);
        })
      );
  }

  // Supprimer un voyage (soft delete)
  deleteVoyage(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/delete`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur deleteVoyage:', error);
          return throwError(error);
        })
      );
  }

  // Restaurer un voyage
  restoreVoyage(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/restore`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur restoreVoyage:', error);
          return throwError(error);
        })
      );
  }
}
