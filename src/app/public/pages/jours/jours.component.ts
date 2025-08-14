import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { Jour } from '../../../interfaces/jour.interface';
import { DayService } from '../../../core/services/day.service';
import { CommonModule, DatePipe } from '@angular/common';
import { PhotoService } from '../../../core/services/photo.service';
import { Photo } from '../../../interfaces/photo.interface';
import { VoyageService } from '../../../core/services/voyage.service';
import { Voyage } from '../../../interfaces/voyage.interface';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { BreadcrumbComponent } from "../../../shared/components/breadcrumb/breadcrumb.component";

@Component({
  selector: 'app-jours',
  imports: [BackgroundComponent, CommonModule, DatePipe, LottieComponent, RouterModule, BreadcrumbComponent],
  templateUrl: './jours.component.html',
  styleUrl: './jours.component.css'
})
export class JoursComponent implements OnInit {
  jours: Jour[] = [];
  randomPhotos: { [dayId: number]: Photo | null } = {};
  voyageDescription: string = '';
      baseText = 'Nous sommes en route vers notre prochaine destination';
        dotCount = 0;
  intervalId: any;
  displayText = '';
loaderOptions: AnimationOptions = {
  path: '/assets/lottie/Travel.json'
};
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dayService: DayService,
    private photoService: PhotoService,
    private voyageService: VoyageService
  ) {}
  
  getJourPhotoRoute(jour: Jour): string[] {
    const countrySlug = this.route.snapshot.params['countrySlug'];
    const voyageSlug = this.route.snapshot.params['voyageSlug'];
    if (countrySlug && voyageSlug && jour.id) {
      const jourSlug = this.createJourSlug(jour);
      return ['/', countrySlug, voyageSlug, jourSlug, 'photos'];
    }
    return ['/'];
  }

  // Créer un slug à partir du titre du jour
  createJourSlug(jour: Jour): string {
    return jour.title.toLowerCase()
      .replace(/[àáâäãå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.dotCount = (this.dotCount + 1) % 4; // 0 → 1 → 2 → 3 → 0
      this.displayText = this.baseText + '.'.repeat(this.dotCount);
    }, 500); 
    
    const countrySlug = this.route.snapshot.params['countrySlug'];
    const voyageSlug = this.route.snapshot.params['voyageSlug'];
    
    console.log('JoursComponent - Paramètres reçus:');
    console.log('  countrySlug:', countrySlug);
    console.log('  voyageSlug:', voyageSlug);
    console.log('  URL complète:', this.router.url);
    
    if (countrySlug && voyageSlug) {
      // Récupérer le voyage par ses slugs
      this.voyageService.getVoyageBySlug(countrySlug, voyageSlug).subscribe({
        next: (voyage: Voyage) => {
          this.voyageDescription = voyage.description;
          
          // Récupérer les jours du voyage
          this.dayService.getDaysByTrip(voyage.id.toString())
            .subscribe(jours => {
              // Filtrer pour ne garder que les jours publiés
              this.jours = jours.filter(jour => 
                jour.publishedDate !== null && 
                jour.publishedDate !== undefined &&
                !jour.deletedAt // Exclure les jours supprimés
              );
              console.log('Tous les jours récupérés:', jours);
              console.log('Jours publiés filtrés:', this.jours);
              
              this.jours.forEach(jour => {
                this.photoService.getRandomPhotoByDay(jour.id).subscribe(photo => {
                  if (photo && photo.url && !photo.url.startsWith('http')) {
                    photo.url = `http://localhost:8080/${photo.url.replace(/^\/+/, '')}`;
                  }
                  this.randomPhotos[jour.id] = photo;
                });
              });
            });
        },
        error: (error) => {
          console.error('Erreur lors de la récupération du voyage:', error);
        }
      });
    }
  }
}
