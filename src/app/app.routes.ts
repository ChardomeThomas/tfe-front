import { Routes } from '@angular/router';
import { HomeComponent } from './public/pages/home/home.component';
import { VoyagesComponent } from './public/pages/voyages/voyages.component';
import { PhotosComponent } from './public/pages/photos/photos.component';
import { AdminPhotosComponent } from './admin/pages/photos/photos.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { JoursComponent } from './public/pages/jours/jours.component';
import { AdminVoyagesComponent } from './admin/pages/voyages/voyages.component';
import { AdminJoursComponent } from './admin/pages/jours/jours.component';
import { LoginComponent } from './public/pages/login/login.component';

export const routes: Routes = [
  // Public…
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'countries/:countryId/voyages', component: VoyagesComponent },
  { path: 'countries/:countryId/voyages/:voyageId/jours', component: JoursComponent },
  { path: 'countries/:countryId/voyages/:voyageId/jours/:jourId/photos', component: PhotosComponent },
  // { path: 'countries/:countryId/voyages/:voyageId/destinations', component: DestinationsComponent },
  // { path: 'countries/:countryId/voyages/:voyageId/destinations/:destId/jours', component: JoursComponent },
  // { path: 'countries/:countryId/voyages/:voyageId/destinations/:destId/jours/:jourId/photos', component: PhotosComponent },

  // Admin
  { path: 'admin', component: DashboardComponent },
  { path: 'admin/countries/:countryId/voyages', component: AdminVoyagesComponent },
  // { path: 'admin/countries/:countryId/voyages/:voyageId/destinations', component: AdminDestinationsComponent },
  { path: 'admin/countries/:countryId/voyages/:voyageId/jours', component: AdminJoursComponent },
  { path: 'admin/countries/:countryId/voyages/:voyageId/jours/:jourId/photos', component: AdminPhotosComponent },

  // Fallback
  { path: '**', redirectTo: '' }
];
