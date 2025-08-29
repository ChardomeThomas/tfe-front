// src/app/core/services/admin/dayAdminService.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Jour } from '../../../interfaces/jour.interface';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DayAdminService {
  private apiUrl = `${environment.apiUrl}/days`;

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

  // Récupère le résumé admin des jours pour un voyage
  getAdminSummary(tripId: number): Observable<{ deleted: Jour[]; drafts: Jour[]; published: Jour[] }> {
    return this.http
      .get<any>(this.buildUrl(`/trip/${tripId}`), { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('Réponse brute admin-summary jours:', response);

          // Si le backend renvoie déjà les catégories séparées
          if (response.published || response.drafts || response.deleted || response.draftsOrUnpublished || response.scheduled) {
            console.log('Réponse déjà catégorisée par le backend');
            return {
              published: (response.published || []),
              drafts: (response.drafts || response.draftsOrUnpublished || []),
              deleted: (response.deleted || [])
            };
          }

          // Si la réponse est un tableau simple (comme c'est le cas ici)
          if (Array.isArray(response)) {
            console.log('Réponse en format tableau simple');
            const jours: any[] = response;
            
            // Logique de catégorisation basée sur les propriétés des jours
            // D'abord, on sépare les jours supprimés (qui ont deletedAt non null)
            const deleted = jours.filter(j => j.deletedAt && j.deletedAt !== null);
            
            // Ensuite, parmi les jours non supprimés, on catégorise selon leur statut de publication
            const nonDeletedJours = jours.filter(j => !j.deletedAt || j.deletedAt === null);
            
            // Log pour déboguer
            console.log('Tous les jours:', jours);
            nonDeletedJours.forEach((j, index) => {
              console.log(`Jour ${index}:`, {
                id: j.id,
                publishedDate: j.publishedDate,
                publishedDateType: typeof j.publishedDate,
                isNull: j.publishedDate === null,
                isUndefined: j.publishedDate === undefined
              });
            });
            
            const published = nonDeletedJours.filter(j => j.publishedDate !== null && j.publishedDate !== undefined);
            const drafts = nonDeletedJours.filter(j => !j.publishedDate || j.publishedDate === null);

            console.log('Jours catégorisés côté client:', { 
              published: published.length, 
              drafts: drafts.length, 
              deleted: deleted.length 
            });
            console.log('Détail published:', published);
            console.log('Détail drafts:', drafts);
            console.log('Détail deleted:', deleted);

            return { published, drafts, deleted };
          }

          // Fallback : traiter comme objet avec propriétés
          const allDays: any[] = [];
          Object.keys(response).forEach(key => {
            if (Array.isArray(response[key])) {
              console.log(`Jours dans la catégorie ${key}:`, response[key]);
              allDays.push(...response[key]);
            }
          });

          const jours: any[] = allDays;

          // Logique de catégorisation basée sur les propriétés des jours
          // D'abord, on sépare les jours supprimés (qui ont deletedAt non null)
          const deleted = jours.filter(j => j.deletedAt && j.deletedAt !== null);
          
          // Ensuite, parmi les jours non supprimés, on catégorise selon leur statut de publication
          const nonDeletedJours = jours.filter(j => !j.deletedAt || j.deletedAt === null);
          const published = nonDeletedJours.filter(j => j.publishedDate !== null && j.publishedDate !== undefined);
          const drafts = nonDeletedJours.filter(j => !j.publishedDate || j.publishedDate === null);

          console.log('Jours catégorisés côté client (fallback):', { 
            published: published.length, 
            drafts: drafts.length, 
            deleted: deleted.length 
          });

          return { published, drafts, deleted };
        }),
        catchError(error => {
          console.error('Erreur getAdminSummary jours:', error);
          return throwError(error);
        })
      );
  }

  // Ajouter un jour
  addDay(data: {
    tripId: number;
    date: string;
    description?: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur addDay:', error);
          return throwError(error);
        })
      );
  }

  // Publier un jour
  publishDay(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/publish`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur publishDay:', error);
          return throwError(error);
        })
      );
  }

  // Dépublier un jour
  unpublishDay(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/unpublish`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur unpublishDay:', error);
          return throwError(error);
        })
      );
  }

  // Supprimer un jour (soft delete)
  deleteDay(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/delete`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur deleteDay:', error);
          return throwError(error);
        })
      );
  }

  // Restaurer un jour
  restoreDay(id: number): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}/restore`), {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur restoreDay:', error);
          return throwError(error);
        })
      );
  }

  // Modifier un jour
  updateDay(id: number, jourData: Partial<Jour>): Observable<any> {
    return this.http.patch(this.buildUrl(`/${id}`), jourData, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur updateDay:', error);
          return throwError(error);
        })
      );
  }

  // Créer un nouveau jour
  createDay(jourData: any): Observable<any> {
    return this.http.post(this.buildUrl(''), jourData, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur createDay:', error);
          return throwError(error);
        })
      );
  }
  getDay(dayId: string): Observable<Jour> {
  return this.http.get<Jour>(`${this.apiUrl}/days/${dayId}`);
}
}