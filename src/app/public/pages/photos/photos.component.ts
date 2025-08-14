import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from '../../../core/services/photo.service';
import { DayService } from '../../../core/services/day.service';
import { Photo } from '../../../interfaces/photo.interface';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { NgxMasonryComponent, NgxMasonryModule } from 'ngx-masonry';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { BreadcrumbComponent } from "../../../shared/components/breadcrumb/breadcrumb.component";

@Component({
    selector: 'app-photos',
    imports: [CommonModule,
        NgxMasonryModule,
        HttpClientModule,
        LottieComponent,
        BreadcrumbComponent
    ],
    standalone: true,
    templateUrl: './photos.component.html',
    styleUrl: './photos.component.css'
})
export class PhotosComponent implements OnInit {
  @ViewChild(NgxMasonryComponent) masonry!: NgxMasonryComponent;
  
  photos: Photo[] = [];
  loading = true;
  error = '';
  loadedImagesCount = 0;
  allLoaded = false;
  baseText = 'Nous prenons les photos en ce moment';
  displayText = '';
  dotCount = 0;
  intervalId: any;
  
  // Variables pour le modal
  showModal = false;
  selectedPhoto: Photo | null = null;

loaderOptions: AnimationOptions = {
  path: '/assets/lottie/Photo.json'
};
  constructor(
    private route: ActivatedRoute,
    private photoService: PhotoService,
    private dayService: DayService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const countrySlug = this.route.snapshot.params['countrySlug'];
    const voyageSlug = this.route.snapshot.params['voyageSlug'];
    const jourSlug = this.route.snapshot.params['jourSlug'];
    const jourId = this.route.snapshot.params['jourId']; // Pour backward compatibility
    const role = localStorage.getItem('role') || '';
    
    this.intervalId = setInterval(() => {
      this.dotCount = (this.dotCount + 1) % 4; // 0 → 1 → 2 → 3 → 0
      this.displayText = this.baseText + '.'.repeat(this.dotCount);
    }, 500); 

    // Si on a un jourId (ancienne route), l'utiliser directement
    if (jourId) {
      this.loadPhotosByDayId(+jourId, role);
    } 
    // Sinon, utiliser la nouvelle méthode avec les slugs
    else if (countrySlug && voyageSlug && jourSlug) {
      // Récupérer le jour par ses slugs
      this.dayService.getDayBySlug(countrySlug, voyageSlug, jourSlug).subscribe({
        next: (jour) => {
          this.loadPhotosByDayId(jour.id, role);
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du jour par slug:', err);
          this.error = 'Jour non trouvé';
          this.loading = false;
          this.allLoaded = true;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.error = 'Paramètres manquants dans l\'URL';
      this.loading = false;
      this.allLoaded = true;
      this.cdr.detectChanges();
    }

    // Sécurité : affichage forcé si bug de chargement
    setTimeout(() => {
      if (!this.allLoaded) {
        this.allLoaded = true;
        this.cdr.detectChanges();
      }
    }, 15000);
  }

  private loadPhotosByDayId(dayId: number, role: string): void {
    this.photoService.getPhotosByDay(dayId, role).subscribe({
      next: (photos) => {
        this.photos = photos;
        this.loading = false;
        
        // Si pas de photos, on peut directement afficher
        if (photos.length === 0) {
          this.allLoaded = true;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Erreur API photos:', err);
        this.error = 'Erreur lors du chargement des photos';
        this.loading = false;
        this.allLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  onImageLoad() {
    this.loadedImagesCount++;
    
    if (this.loadedImagesCount === this.photos.length) {
      this.allLoaded = true;
      
      // Forcer la détection de changement
      this.cdr.detectChanges();
      
      // Masonry sera visible et ViewChild dispo après le DOM render
      setTimeout(() => {
        this.masonry?.reloadItems();
        this.masonry?.layout();
      });
    }
  }

  onImageError() {
    this.loadedImagesCount++;
    
    if (this.loadedImagesCount === this.photos.length) {
      this.allLoaded = true;
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.masonry?.reloadItems();
        this.masonry?.layout();
      });
    }
  }

  openModal(photo: Photo) {
    this.selectedPhoto = photo;
    this.showModal = true;
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    this.selectedPhoto = null;
    // Restaurer le scroll du body
    document.body.style.overflow = 'auto';
  }

  // Fermer le modal en cliquant sur l'overlay
  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}