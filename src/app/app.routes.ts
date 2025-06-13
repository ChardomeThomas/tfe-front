import { Routes } from '@angular/router';
import { HomeComponent } from './public/pages/home/home.component';
import { VoyagesComponent } from './public/pages/voyages/voyages.component';
import { PhotosComponent } from './public/pages/photos/photos.component';
import { DestinationsComponent } from './public/pages/destinations/destinations.component';
import { AdminPaysComponent } from './admin/pages/pays/pays.component';
import { AdminVillesComponent } from './admin/pages/villes/villes.component';
import { AdminDestinationsComponent } from './admin/pages/destinations/destinations.component';
import { AdminPhotosComponent } from './admin/pages/photos/photos.component';
import { UsersComponent } from './admin/users/users.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'voyages/:countryId',
    component: VoyagesComponent
  },
  {
    path: 'destinations/:voyageId',
    component: DestinationsComponent
  },
  {
    path: 'photos/:destinationId',
    component: PhotosComponent
  },
  {
    path: 'admin',
    component: DashboardComponent
  },
  {
    path: 'admin/users',
    component: UsersComponent
  },
  {
    path: 'admin/pays',
    component: AdminPaysComponent
  },
  {
    path: 'admin/villes/:countryId',
    component: AdminVillesComponent
  },
  {
    path: 'admin/destinations/:voyageId',
    component: AdminDestinationsComponent
  },
  {
    path: 'admin/photos/:destinationId',
    component: AdminPhotosComponent
  }
];
