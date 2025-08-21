import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Newsletter, CountryWithTrips, ToggleSubscriptionRequest } from '../../interfaces/newsletter.interface';

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private apiUrl = `${environment.apiUrl}/newsletter`;

  constructor(private http: HttpClient) {}

  getCountriesWithTrips(): Observable<CountryWithTrips[]> {
    return this.http.get<CountryWithTrips[]>(`${this.apiUrl}/countries-with-trips`).pipe(
      map(response => {
        if (response && Array.isArray(response)) {
          return response;
        } else if (response && (response as any).data) {
          return (response as any).data;
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des pays avec voyages:', error);
        throw error;
      })
    );
  }

  getMySubscriptions(): Observable<Newsletter[]> {
    return this.http.get<Newsletter[]>(`${this.apiUrl}/my-subscriptions`).pipe(
      map(response => {
        if (response && Array.isArray(response)) {
          return response;
        } else if (response && (response as any).subscriptions) {
          return (response as any).subscriptions;
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des abonnements:', error);
        throw error;
      })
    );
  }
toggleSubscription(request: ToggleSubscriptionRequest): Observable<{ success: boolean; message?: string }> {
  console.log('Request headers:', this.http);
  console.log('Request body:', JSON.stringify(request));
  
  return this.http.patch<{ success: boolean; message?: string }>(`${this.apiUrl}/toggle`, request, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).pipe(
    catchError(error => {
      console.error('Erreur détaillée toggle:', error);
      console.error('Error body:', error.error);
      throw error;
    })
  );
}
  // Méthodes utilitaires
  isSubscribedToCountry(subscriptions: Newsletter[], countryId: number): boolean {
    return subscriptions.some(sub => 
      sub.targetType === 'COUNTRY' && sub.targetId === countryId
    );
  }

  isSubscribedToTrip(subscriptions: Newsletter[], tripId: number): boolean {
    return subscriptions.some(sub => 
      sub.targetType === 'TRIP' && sub.targetId === tripId
    );
  }

  getSubscribedTripIds(subscriptions: Newsletter[]): number[] {
    return subscriptions
      .filter(sub => sub.type === 'TRIP' && sub.isActive && typeof sub.entityId === 'number')
      .map(sub => sub.entityId as number);
  }

  getSubscribedCountryIds(subscriptions: Newsletter[]): number[] {
    return subscriptions
      .filter(sub => sub.type === 'COUNTRY' && sub.isActive && typeof sub.entityId === 'number')
      .map(sub => sub.entityId as number);
  }
}