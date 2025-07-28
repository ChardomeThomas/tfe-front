import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { SliderComponent } from "../../../shared/components/slider/slider.component";
import { Country } from '../../../../interfaces/country.interface';
import { CountryService } from '../../../core/services/country.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    BackgroundComponent,
    MatSlideToggleModule,
    CarouselModule,
    ButtonModule,
    TagModule,
    SliderComponent
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
 countries: Country[] = [];
 cards = [
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
    {
      title: 'Noteworthy technology acquisitions 2021',
      description: 'Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.',
      imageUrl: '../../../assets/country.jpg'
    },
  ];
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

