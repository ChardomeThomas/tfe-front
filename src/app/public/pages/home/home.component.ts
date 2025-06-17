import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { SliderComponent } from "../../../shared/components/slider/slider.component";


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
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent {



}
