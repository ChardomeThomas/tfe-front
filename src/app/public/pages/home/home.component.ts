import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { Country } from '../../../interfaces/country.interface';
import { CountryService } from '../../../core/services/country.service';
import { ActivatedRoute, RouterModule } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    CarouselModule,
    ButtonModule,
    TagModule,
  
    RouterModule
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
 countries: Country[] = [];

  constructor(private countryService: CountryService) {}

  ngOnInit(): void {
    this.countryService.getCountries().subscribe({
      next: (countries: Country[]) => {
        this.countries = countries;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }
    }

