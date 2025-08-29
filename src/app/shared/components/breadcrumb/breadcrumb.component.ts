import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { CountryService } from '../../../core/services/country.service';
import { VoyageService } from '../../../core/services/voyage.service';
import { DayService } from '../../../core/services/day.service';
import { CountryAdminService } from '../../../core/services/admin/countryAdmin.service';
import { VoyageAdminService } from '../../../core/services/admin/voyageAdminService.service';
import { DayAdminService } from '../../../core/services/admin/dayAdminService.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: { label: string; url: string }[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private countryService: CountryService,
    private voyageService: VoyageService,
    private dayService: DayService,
    private countryAdminService: CountryAdminService,
    private voyageAdminService : VoyageAdminService,
    private dayAdminService: DayAdminService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.buildBreadcrumbs());
      
    this.buildBreadcrumbs();
  }

  private buildBreadcrumbs() {
    const url = this.router.url;
    this.breadcrumbs = [{ label: 'Accueil', url: '/' }];
    
    const segments = url.split('/').filter(segment => segment);
    
    if (segments.length === 0) {
      return; // Page d'accueil seulement
    }

    const firstSegment = segments[0];
    
    // Routes /connected/*
    if (firstSegment === 'connected') {
      this.handleConnectedRoutes(segments);
      return;
    }
    
    // Routes /admin/*
    if (firstSegment === 'admin') {
      this.handleAdminRoutes(segments);
      return;
    }
    
    // Routes publiques avec login/register
    if (firstSegment === 'login') {
      this.breadcrumbs.push({ label: 'Connexion', url: '/login' });
      return;
    }
    
    if (firstSegment === 'register') {
      this.breadcrumbs.push({ label: 'Inscription', url: '/register' });
      return;
    }
    
    // Routes dynamiques avec slugs (pays/voyages)
    this.handlePublicRoutes(segments);
  }

  private handleConnectedRoutes(segments: string[]) {
    if (segments.length < 2) return;
    
    switch (segments[1]) {
      case 'profile':
        this.breadcrumbs.push({ label: 'Profil', url: '/connected/profile' });
        break;
      // Ajouter d'autres routes connected ici
      default:
        this.breadcrumbs.push({ label: segments[1], url: `/connected/${segments[1]}` });
    }
  }


// Dans breadcrumb.component.ts
private handleAdminRoutes(segments: string[]) {
  this.breadcrumbs.push({ label: 'Administration', url: '/admin' });
  
  if (segments.length >= 2) {
    const countrySlug = segments[1];
    
    this.countryService.getCountryBySlug(countrySlug).subscribe({
      next: (country) => {
        this.breadcrumbs.push({
          label: country.name,
          url: `/admin/${countrySlug}`
        });

        if (segments.length >= 3) {
          const voyageSlug = segments[2];
          this.voyageService.getVoyageBySlug(countrySlug, voyageSlug).subscribe({
            next: (voyage) => {
              this.breadcrumbs.push({
                label: voyage.title,
                url: `/admin/${countrySlug}/${voyageSlug}`
              });

              if (segments.length >= 5 && segments[4] === 'photos') {
                const jourSlug = segments[3];
                const jourName = jourSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                this.breadcrumbs.push({
                  label: jourName,
                  url: `/admin/${countrySlug}/${voyageSlug}/${jourSlug}/photos`
                });
              }
            }
          });
        }
      }
      
    });

  }
  
}
// private updateBreadcrumbForCountry(countryName: string, countryId: string, segments: string[]) {
//   // Supprimer le dernier breadcrumb "Pays" s'il existe et le remplacer
//   if (this.breadcrumbs.length > 1 && this.breadcrumbs[this.breadcrumbs.length - 1].label === 'Pays') {
//     this.breadcrumbs.pop();
//   }
  
//   this.breadcrumbs.push({ 
//     label: countryName, 
//     url: `/admin/countries/${countryId}/voyages` 
//   });
  
//   // Si c'est une route vers les jours : /admin/countries/1/voyages/2/jours
//   if (segments.length >= 6 && segments[4] === 'voyages') {
//     const voyageId = segments[5];
    
//     // Pour maintenant, on utilise un nom générique pour le voyage
//     // Vous pourrez l'améliorer plus tard avec un appel API
//     this.breadcrumbs.push({ 
//       label: `Voyage ${voyageId}`, 
//       url: `/admin/countries/${countryId}/voyages/${voyageId}/jours` 
//     });
    
//     // Si c'est une route vers les photos : /admin/countries/1/voyages/2/jours/3/photos
//     if (segments.length >= 8 && segments[6] === 'jours' && segments[8] === 'photos') {
//       const jourId = segments[7];
//       this.breadcrumbs.push({ 
//         label: `Jour ${jourId}`, 
//         url: `/admin/countries/${countryId}/voyages/${voyageId}/jours/${jourId}/photos` 
//       });
//     }
//   }
// }
  private handlePublicRoutes(segments: string[]) {
    const countrySlug = segments[0];
    
    // Récupérer le nom du pays
    this.countryService.getCountryBySlug(countrySlug).subscribe({
      next: (country) => {
        if (country) {
          this.breadcrumbs.push({ label: country.name, url: `/${countrySlug}` });
          this.handleVoyageRoutes(segments, countrySlug);
        }
      },
      error: () => {
        const countryName = this.slugToName(countrySlug);
        this.breadcrumbs.push({ label: countryName, url: `/${countrySlug}` });
        this.handleVoyageRoutes(segments, countrySlug);
      }
    });
  }

  private handleVoyageRoutes(segments: string[], countrySlug: string) {
    if (segments.length < 2) return;
    
    const voyageSlug = segments[1];
    
    // Récupérer le nom du voyage
    this.voyageService.getVoyageBySlug(countrySlug, voyageSlug).subscribe({
      next: (voyage) => {
        this.breadcrumbs.push({ label: voyage.title, url: `/${countrySlug}/${voyageSlug}` });
        this.handleDayRoutes(segments, countrySlug, voyageSlug);
      },
      error: () => {
        const voyageName = this.slugToName(voyageSlug);
        this.breadcrumbs.push({ label: voyageName, url: `/${countrySlug}/${voyageSlug}` });
        this.handleDayRoutes(segments, countrySlug, voyageSlug);
      }
    });
  }

  private handleDayRoutes(segments: string[], countrySlug: string, voyageSlug: string) {
    if (segments.length < 3) return;
    
    const thirdSegment = segments[2];
    
    // Route ancienne: /country/voyage/jour/ID/photos
    if (thirdSegment === 'jour' && segments.length > 4 && segments[4] === 'photos') {
      const jourId = segments[3];
      this.breadcrumbs.push({ 
        label: 'Photos', 
        url: `/${countrySlug}/${voyageSlug}/jour/${jourId}/photos` 
      });
      return;
    }
    
    // Route nouvelle: /country/voyage/jourSlug/photos
    if (segments.length > 3 && segments[3] === 'photos') {
      const jourSlug = thirdSegment;
      
      this.dayService.getDayBySlug(countrySlug, voyageSlug, jourSlug).subscribe({
        next: (jour) => {
          this.breadcrumbs.push({ 
            label: jour.title, 
            url: `/${countrySlug}/${voyageSlug}/${jourSlug}/photos` 
          });
        },
        error: () => {
          const jourName = this.slugToName(jourSlug);
          this.breadcrumbs.push({ 
            label: jourName, 
            url: `/${countrySlug}/${voyageSlug}/${jourSlug}/photos` 
          });
        }
      });
    }
  }

  private slugToName(slug: string): string {
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  }
}