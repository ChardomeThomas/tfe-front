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
import { RegisterComponent } from './public/pages/register/register.component';
import { AuthGuard } from './core/guards/auth.guards';
import { RoleGuard } from './core/guards/role.guards';
export const routes: Routes = [
  // Public…
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'countries/:countryId/voyages', component: VoyagesComponent },
  { path: 'countries/:countryId/voyages/:voyageId/jours', component: JoursComponent },
  { path: 'countries/:countryId/voyages/:voyageId/jours/:jourId/photos', component: PhotosComponent },


  // Admin
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'countries/:countryId/voyages', component: AdminVoyagesComponent },
      { path: 'countries/:countryId/voyages/:voyageId/jours', component: AdminJoursComponent },
      { path: 'countries/:countryId/voyages/:voyageId/jours/:jourId/photos', component: AdminPhotosComponent }
    ]
  },
  // Fallback
  { path: '**', redirectTo: '' }
];
