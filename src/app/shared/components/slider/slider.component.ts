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

  slides: { name: string; flag: string, id: number }[] = [];

  constructor(private countryService: CountryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.countryService.getCountries()
      .subscribe((countries: Country[]) => {             
        this.slides = countries.map(country => ({
          name: country.name,
          flag: country.flag,
          id: country.countryId
        }));
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const el = (this.swiperEl?.nativeElement as any);
      if (el && typeof el.initialize === 'function') {
        el.initialize();
      } else {
        console.error('Impossible d\u2019initialiser le slider');
      }
    });
  }

    onCountryClick(country: number) {
    this.router.navigate([`countries/${country}/voyages`]);
  }
}
