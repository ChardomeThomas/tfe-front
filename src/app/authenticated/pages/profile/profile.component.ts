import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from "../../../shared/components/breadcrumb/breadcrumb.component";
import { NewsletterService } from '../../../core/services/newsletter.service';
import { Newsletter, CountryWithTrips } from '../../../interfaces/newsletter.interface';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  countriesWithTrips: CountryWithTrips[] = [];
  mySubscriptions: Newsletter[] = [];
  loading = true;



  constructor(
    private newsletterService: NewsletterService,
    private authService: AuthService // Ajoutez ceci
  ) {}

  ngOnInit(): void {
    // Ajoutez ces logs de debug comme dans votre dashboard
    // console.log('Token info:', this.authService.getUserInfo());
    // console.log('User role:', this.authService.getUserRole());
    // console.log('User email:', this.authService.getUserEmail());
    
    this.loadData();
  }

  private loadData(): void {
    this.loadCountriesWithTrips();
    this.loadMySubscriptions();
  }

private loadCountriesWithTrips(): void {
  // console.log('Début de loadCountriesWithTrips');
  this.newsletterService.getCountriesWithTrips()
    .pipe(
      catchError(err => {
        console.error('ERREUR CATCHÉE dans loadCountriesWithTrips:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        return of([]);
      })
    )
    .subscribe({
      next: (countries) => {
        // console.log('SUCCESS: Données reçues pour countriesWithTrips:', countries);
        this.countriesWithTrips = countries;
        this.checkIfDataLoaded();
      },
      error: (err) => {
        console.error('ERREUR FINALE dans subscribe:', err);
        this.checkIfDataLoaded();
      }
    });
}

  private loadMySubscriptions(): void {
    this.newsletterService.getMySubscriptions()
      .pipe(
        catchError(err => {
          console.error('Erreur lors du chargement des abonnements:', err);
          return of([]);
        })
      )
      .subscribe(subscriptions => {
        this.mySubscriptions = subscriptions;
        // console.log('mySubscriptions:', this.mySubscriptions);
        this.checkIfDataLoaded();
      });
  }

  private checkIfDataLoaded(): void {
    // Vérification simple comme dans votre dashboard
    this.loading = false;
  }

  isSubscribedToCountry(countryId: number): boolean {
    return this.newsletterService.isSubscribedToCountry(this.mySubscriptions, countryId);
  }

  isSubscribedToTrip(tripId: number): boolean {
    return this.newsletterService.isSubscribedToTrip(this.mySubscriptions, tripId);
  }

  onCountryToggle(countryId: number): void {
    this.newsletterService.toggleSubscription({
      targetType: 'PAYS',
      targetId: countryId
    }).subscribe({
      next: (response) => {
        if (response.success) {
          // console.log('Toggle pays réussi');
          // Recharge immédiatement la liste des abonnements pour mettre à jour l'état des cases
          this.loadMySubscriptions();
        }
      },
      error: (error) => {
        console.error('Erreur lors du toggle pays:', error);
      }
    });
  }

  onTripToggle(tripId: number): void {
    this.newsletterService.toggleSubscription({
      targetType: 'DESTINATION',
      targetId: tripId
    }).subscribe({
      next: (response) => {
        if (response.success) {
          // console.log('Toggle voyage réussi');
          this.loadMySubscriptions();
        }
      },
      error: (error) => {
        console.error('Erreur lors du toggle voyage:', error);
      }
    });
  }
}