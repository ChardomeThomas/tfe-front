import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from '../../../core/services/photo.service';
import { Photo } from '../../../interfaces/photo.interface';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { NgxMasonryComponent, NgxMasonryModule } from 'ngx-masonry';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
    selector: 'app-photos',
    imports: [CommonModule,
        NgxMasonryModule,
        HttpClientModule,
        LottieComponent
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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const dayId = this.route.snapshot.paramMap.get('jourId');
    const role = localStorage.getItem('role') || '';
                 this.intervalId = setInterval(() => {
      this.dotCount = (this.dotCount + 1) % 4; // 0 → 1 → 2 → 3 → 0
      this.displayText = this.baseText + '.'.repeat(this.dotCount);
    }, 500); 
    if (dayId) {
      this.photoService.getPhotosByDay(+dayId, role).subscribe({
        next: (photos) => {
          console.log('Réponse API photos:', photos);
          this.photos = photos;
          this.loading = false;
          
          // Si pas de photos, on peut directement afficher
          if (photos.length === 0) {
            this.allLoaded = true;
          }
          
          // Debug: vérifier si les images se chargent
          console.log('Photos reçues, début préchargement...');
        },
        error: (err) => {
          console.error('Erreur API:', err);
          this.error = 'Erreur lors du chargement des photos';
          this.loading = false;
          this.allLoaded = true;
        }
      });
    } else {
      this.error = 'Aucun jour sélectionné';
      this.loading = false;
      this.allLoaded = true;
    }

    // Sécurité : affichage forcé si bug de chargement
    setTimeout(() => {
      if (!this.allLoaded) {
        console.warn('Timeout atteint, on affiche quand même');
        console.log(`Images chargées: ${this.loadedImagesCount}/${this.photos.length}`);
        this.allLoaded = true;
      }
    }, 15000);
  }

  onImageLoad() {
    this.loadedImagesCount++;
    console.log(`Image chargée: ${this.loadedImagesCount}/${this.photos.length}`);
    
    if (this.loadedImagesCount === this.photos.length) {
      console.log('Toutes les images sont chargées!');
      this.allLoaded = true;
      
      // Masonry sera visible et ViewChild dispo après le DOM render
      setTimeout(() => {
        this.masonry?.reloadItems();
        this.masonry?.layout();
      });
    }
  }

  onImageError() {
    this.loadedImagesCount++;
    console.log(`Erreur image: ${this.loadedImagesCount}/${this.photos.length}`);
    
    if (this.loadedImagesCount === this.photos.length) {
      console.log('Toutes les images traitées (avec erreurs)');
      this.allLoaded = true;
      
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