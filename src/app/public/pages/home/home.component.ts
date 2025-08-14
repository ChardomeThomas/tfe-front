import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { Country } from '../../../interfaces/country.interface';
import { CountryService } from '../../../core/services/country.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    CarouselModule,
    ButtonModule,
    TagModule,
    LottieComponent,
    RouterModule
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
 countries: Country[] = [];
  voyageDescription: string = '';
      baseText = 'Nous sommes a la recherche du prochain pays à découvrir';
        dotCount = 0;
  intervalId: any;
  displayText = '';
loaderOptions: AnimationOptions = {
  path: '/assets/lottie/Search.json'
};
  constructor(private countryService: CountryService) {}

  ngOnInit(): void {
    // Démarrer l'animation du texte avec des points
    this.intervalId = setInterval(() => {
      this.dotCount = (this.dotCount + 1) % 4; // 0 → 1 → 2 → 3 → 0
      this.displayText = this.baseText + '.'.repeat(this.dotCount);
    }, 500);

    this.countryService.getCountries().subscribe({
      next: (countries: Country[]) => {
        this.countries = countries;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoyer l'intervalle pour éviter les fuites mémoire
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
    }

