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
import { ProfileComponent } from './authenticated/pages/profile/profile.component';
export const routes: Routes = [
  // Public…
  // { path: '', component: HomeComponent },
  // { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent },
  // { path: 'countries/:countryId/voyages', component: VoyagesComponent },
  // { path: 'countries/:countryId/voyages/:voyageId/jours', component: JoursComponent },
  // { path: 'countries/:countryId/voyages/:voyageId/jours/:jourId/photos', component: PhotosComponent },
 // Public
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Admin routes doivent être avant les routes génériques
    {
    path: 'connected',
    canActivate: [AuthGuard], // Juste connecté suffit
    children: [
      { path: 'profile', component: ProfileComponent },
      // Autres pages pour utilisateurs connectés
    ]
  },
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
  
  // NOUVELLES ROUTES avec slugs - plus spécifiques en premier
  { path: ':countrySlug/:voyageSlug/jour/:jourId/photos', component: PhotosComponent }, // Photos avec ID (backward compatibility)
  { path: ':countrySlug/:voyageSlug/:jourSlug/photos', component: PhotosComponent }, // Photos avec slug (nouveau)
  { path: ':countrySlug/:voyageSlug', component: JoursComponent }, // Jours d'un voyage
  { path: ':countrySlug', component: VoyagesComponent }, // Page des voyages du pays
  // Fallback
  { path: '**', redirectTo: '' }
];
