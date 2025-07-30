import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VoyageService } from '../../../core/services/voyage.service';
import { PhotoService } from '../../../core/services/photo.service';
import { CountryService } from '../../../core/services/country.service';
import { Voyage, Country } from '../../../../interfaces/country.interface';
import { BackgroundComponent } from "../../../shared/components/background/background.component";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AnimationOptions } from 'ngx-lottie';
import { LottieComponent } from 'ngx-lottie';

@Component({
    selector: 'app-voyages',
    imports: [CommonModule, BackgroundComponent, MatCardModule, MatButtonModule, LottieComponent],
    standalone: true,
    templateUrl: './voyages.component.html',
    styleUrl: './voyages.component.css'
})
export class VoyagesComponent implements OnInit {
    voyages: Voyage[] = [];
    countryName: string | null = null;
    baseText = 'Voyages en cours';
  displayText = '';
  dotCount = 0;
  intervalId: any;
loaderOptions: AnimationOptions = {
  path: '/assets/lottie/Earth.json'
};
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private voyageService: VoyageService,
        private countryService: CountryService,
        private photoService: PhotoService
    ) {}

    ngOnInit(): void {
         this.intervalId = setInterval(() => {
      this.dotCount = (this.dotCount + 1) % 4; // 0 → 1 → 2 → 3 → 0
      this.displayText = this.baseText + '.'.repeat(this.dotCount);
    }, 500); // Vitesse (500ms entre chaque ajout de point)
          const countryId = this.route.snapshot.paramMap.get('countryId');
        
        if (countryId) {
            this.voyageService.getVoyagesByPointOfInterestId(+countryId)
                .subscribe(voyages => {
                    this.voyages = voyages;
                    console.log('Voyages récupérés:', this.voyages);
                    // Pour chaque voyage, récupérer la photo favorite aléatoire
                    this.voyages.forEach(voyage => {
                        console.log('Appel photo pour voyage.id =', voyage.id);
                        this.photoService.getRandomFavoritePhotoByTripId(voyage.id).subscribe({
                            next: (res) => {
                                voyage.photoUrl = res.url;
                                console.log(`Photo URL pour voyage ${voyage.id}:`, voyage.photoUrl);
                            },
                            error: () => {
                                voyage.photoUrl = 'https://material.angular.dev/assets/img/examples/shiba2.jpg';
                                console.log(`Photo URL par défaut pour voyage ${voyage.id}:`, voyage.photoUrl);
                            }
                        });
                    });
                });
            this.countryService.getCountries()
                .subscribe(countries => {
                    const country = countries.find(c => c.id.toString() === countryId);
                    this.countryName = country ? country.name : null;
                    console.log('Country Name:', this.countryName);
                });
        }
    }

    goToDays(voyageId: number) {
        const countryId = this.route.snapshot.paramMap.get('countryId');
        if (countryId) {
            this.router.navigate(['/countries', countryId, 'voyages', voyageId, 'jours']);
        }
    }
      ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
