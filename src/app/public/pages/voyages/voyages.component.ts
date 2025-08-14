import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VoyageService } from '../../../core/services/voyage.service';
import { PhotoService } from '../../../core/services/photo.service';
import { CountryService } from '../../../core/services/country.service';
import { Voyage } from '../../../interfaces/voyage.interface';
import { Country } from '../../../interfaces/country.interface';
import { BackgroundComponent } from "../../../shared/components/background/background.component";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AnimationOptions } from 'ngx-lottie';
import { LottieComponent } from 'ngx-lottie';
import { BreadcrumbComponent } from "../../../shared/components/breadcrumb/breadcrumb.component";

@Component({
    selector: 'app-voyages',
    imports: [CommonModule, MatCardModule, MatButtonModule, LottieComponent, BreadcrumbComponent, RouterModule],
    standalone: true,
    templateUrl: './voyages.component.html',
    styleUrl: './voyages.component.css'
})
export class VoyagesComponent implements OnInit, OnDestroy {
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
        // Démarrer l'animation du texte
        this.intervalId = setInterval(() => {
            this.dotCount = (this.dotCount + 1) % 4;
            this.displayText = this.baseText + '.'.repeat(this.dotCount);
        }, 500);

        // Récupérer le slug du pays depuis l'URL
        const countrySlug = this.route.snapshot.params['countrySlug'];
        
        if (countrySlug) {
            // Récupérer les voyages par slug du pays
            this.voyageService.getVoyagesByCountrySlug(countrySlug).subscribe({
                next: (allVoyages) => {
                    // Filtrer pour ne garder que les voyages publiés
                    this.voyages = allVoyages.filter(voyage => 
                        voyage.published === true && 
                        voyage.publishedDate !== null && 
                        voyage.publishedDate !== undefined
                    );
                    console.log('Tous les voyages récupérés:', allVoyages);
                    console.log('Voyages publiés filtrés:', this.voyages);
                    
                    // Pour chaque voyage publié, récupérer la photo favorite aléatoire
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
                },
                error: (error) => {
                    console.error('Erreur lors de la récupération des voyages:', error);
                    this.voyages = [];
                }
            });

            // Récupérer le nom du pays pour l'affichage
            this.countryService.getCountryBySlug(countrySlug).subscribe({
                next: (country) => {
                    this.countryName = country?.name || null;
                    console.log('Country Name:', this.countryName);
                },
                error: (error) => {
                    console.error('Erreur lors de la récupération du pays:', error);
                }
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
  getCountrySlug(): string {
  // Récupérer le slug du pays depuis l'URL actuelle
  const slug = this.route.snapshot.params['countrySlug'] || '';
  console.log('Country slug récupéré:', slug);
  return slug;
}

debugNavigation(voyage: any) {
  const countrySlug = this.getCountrySlug();
  const voyageSlug = this.getVoyageSlug(voyage);
  const fullPath = `/${countrySlug}/${voyageSlug}`;
  console.log('Navigation vers:', fullPath);
  console.log('Voyage sélectionné:', voyage);
}

getVoyageSlug(voyage: any): string {
  const slug = voyage.title.toLowerCase()
    .replace(/[àáâäãå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  console.log('Voyage slug généré:', slug, 'pour voyage:', voyage.title);
  return slug;
}
}
