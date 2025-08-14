import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Jour } from '../../interfaces/jour.interface';
import { environment } from '../../../environments/environment';
import { VoyageService } from './voyage.service';

@Injectable({
  providedIn: 'root'
})
export class DayService {
  constructor(
    private http: HttpClient,
    private voyageService: VoyageService
  ) { }

  getDaysByTrip(tripId: string): Observable<Jour[]> {
    return this.http.get<Jour[]>(`${environment.apiUrl}/days/trip/${tripId}`);
  }

  // Récupérer un jour par son slug dans un voyage spécifique
  getDayBySlug(countrySlug: string, voyageSlug: string, jourSlug: string): Observable<Jour> {
    return this.voyageService.getVoyageBySlug(countrySlug, voyageSlug).pipe(
      switchMap(voyage => this.getDaysByTrip(voyage.id.toString())),
      map((jours: Jour[]) => {
        const jour = jours.find((j: Jour) => this.createSlug(j.title) === jourSlug);
        if (!jour) {
          throw new Error(`Jour avec le slug "${jourSlug}" non trouvé`);
        }
        return jour;
      })
    );
  }

  // Créer un slug à partir d'un titre
  private createSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[àáâäãå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
