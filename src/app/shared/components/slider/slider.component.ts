import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CountryService } from '../../../core/services/country.service';
import { Country } from '../../../../interfaces/country.interface';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { Router } from '@angular/router';


@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SliderComponent implements OnInit, AfterViewInit {
  @ViewChild('swiperEl', { read: ElementRef }) swiperEl!: ElementRef<HTMLElement>;

  slides: { name: string; flag: string; id: number }[] = [];

  constructor(
    private countryService: CountryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.countryService.getCountries()
      .subscribe((countries: Country[]) => {
        // Ne garder que les countries publiés
        this.slides = countries
          .filter(c => c.status === 'PUBLISHED')
          .map(c => ({
            name: c.name,
            flag: c.flag,
            id: c.countryId
          }));
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const el = (this.swiperEl?.nativeElement as any);
      if (el?.initialize) {
        el.initialize();
      } else {
        console.error('Impossible d’initialiser le slider');
      }
    });
  }

  onCountryClick(countryId: number) {
    this.router.navigate([`countries/${countryId}/voyages`]);
  }

  // Exemple de suppression depuis le slider
  remove(countryId: number) {
    this.countryService.deleteCountry(countryId)
      .subscribe(() => {
        this.slides = this.slides.filter(s => s.id !== countryId);
      });
  }
  
}