import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { CountryService } from '../../../core/services/country.service';
import { VoyageService } from '../../../core/services/voyage.service';
import { DayService } from '../../../core/services/day.service';

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
    private dayService: DayService
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
    
    if (segments.length > 0) {
      const countrySlug = segments[0];
      
      // Récupérer le vrai nom du pays
      this.countryService.getCountryBySlug(countrySlug).subscribe({
        next: (country) => {
          if (country) {
            // Remplacer le breadcrumb du pays par le vrai nom
            const countryBreadcrumbIndex = this.breadcrumbs.findIndex(b => b.url === `/${countrySlug}`);
            if (countryBreadcrumbIndex >= 0) {
              this.breadcrumbs[countryBreadcrumbIndex].label = country.name;
            } else {
              this.breadcrumbs.push({ label: country.name, url: `/${countrySlug}` });
            }
          }
        },
        error: () => {
          // Fallback au nom généré depuis le slug
          const countryName = this.slugToName(countrySlug);
          this.breadcrumbs.push({ label: countryName, url: `/${countrySlug}` });
        }
      });
      
      // Si on a plus de segments, ajouter les suivants
      if (segments.length > 1) {
        const voyageSlug = segments[1];
        
        if (voyageSlug === 'voyages') {
          this.breadcrumbs.push({ label: 'Voyages', url: `/${countrySlug}/voyages` });
        } else {
          // C'est un voyage spécifique, récupérer le vrai titre
          this.voyageService.getVoyageBySlug(countrySlug, voyageSlug).subscribe({
            next: (voyage) => {
              // Remplacer le breadcrumb du voyage par le vrai titre
              const voyageBreadcrumbIndex = this.breadcrumbs.findIndex(b => b.url === `/${countrySlug}/${voyageSlug}`);
              if (voyageBreadcrumbIndex >= 0) {
                this.breadcrumbs[voyageBreadcrumbIndex].label = voyage.title;
              } else {
                this.breadcrumbs.push({ label: voyage.title, url: `/${countrySlug}/${voyageSlug}` });
              }
              
              // Si on a un troisième segment
              if (segments.length > 2) {
                const thirdSegment = segments[2];
                
                // Ancienne route : /country/voyage/jour/ID/photos
                if (thirdSegment === 'jour' && segments.length > 4 && segments[4] === 'photos') {
                  this.breadcrumbs.push({ label: 'Photos', url: `/${countrySlug}/${voyageSlug}/jour/${segments[3]}/photos` });
                }
                // Nouvelle route : /country/voyage/jourSlug/photos  
                else if (segments.length > 3 && segments[3] === 'photos') {
                  const jourSlug = thirdSegment;
                  // Essayer de récupérer le vrai nom du jour
                  this.dayService.getDayBySlug(countrySlug, voyageSlug, jourSlug).subscribe({
                    next: (jour) => {
                      this.breadcrumbs.push({ label: jour.title, url: `/${countrySlug}/${voyageSlug}/${jourSlug}/photos` });
                    },
                    error: () => {
                      // Fallback au nom généré depuis le slug
                      const jourName = this.slugToName(jourSlug);
                      this.breadcrumbs.push({ label: jourName, url: `/${countrySlug}/${voyageSlug}/${jourSlug}/photos` });
                    }
                  });
                }
              }
            },
            error: () => {
              // Fallback au nom généré depuis le slug
              const voyageName = this.slugToName(voyageSlug);
              this.breadcrumbs.push({ label: voyageName, url: `/${countrySlug}/${voyageSlug}` });
              
              // Si on a un troisième segment
              if (segments.length > 2) {
                const thirdSegment = segments[2];
                
                // Ancienne route : /country/voyage/jour/ID/photos
                if (thirdSegment === 'jour' && segments.length > 4 && segments[4] === 'photos') {
                  this.breadcrumbs.push({ label: 'Photos', url: `/${countrySlug}/${voyageSlug}/jour/${segments[3]}/photos` });
                }
                // Nouvelle route : /country/voyage/jourSlug/photos  
                else if (segments.length > 3 && segments[3] === 'photos') {
                  const jourSlug = thirdSegment;
                  const jourName = this.slugToName(jourSlug);
                  this.breadcrumbs.push({ label: jourName, url: `/${countrySlug}/${voyageSlug}/${jourSlug}/photos` });
                }
              }
            }
          });
        }
      }
    }
  }

  private slugToName(slug: string): string {
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  }
}