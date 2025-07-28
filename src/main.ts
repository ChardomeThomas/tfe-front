import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import { importProvidersFrom, ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { appConfig } from './app/app.config';  // supposé exposer un ApplicationConfig

registerSwiperElements();

// On crée un tableau de providers qui mélange :
const providers: ApplicationConfig['providers'] = [
  // 1) Le router + tous tes providers définis dans appConfig
  ...appConfig.providers,

  // 2) Le nouveau provider HTTP standalone
  provideHttpClient(),
  
];

bootstrapApplication(AppComponent, { providers })
  .catch(err => console.error(err));
