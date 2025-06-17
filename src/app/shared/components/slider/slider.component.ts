import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SliderComponent implements OnInit, AfterViewInit {
  @ViewChild('swiperEl', { read: ElementRef }) swiperEl!: ElementRef<HTMLElement>;

  slides: { name: string; flag: string }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ countries: { countryId: number; name: string; flag: string }[] }>('https://thomas-chardome.be/ajout-json/countries.json').subscribe((data) => {
      this.slides = data.countries.map((country) => ({
        name: country.name,
        flag: country.flag,
      }));
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.swiperEl) {
        const el = this.swiperEl.nativeElement as any;
        if (el && el.initialize) {
          el.initialize();
        }
      } else {
        console.error('swiperEl is undefined');
      }
    });
  }
}
