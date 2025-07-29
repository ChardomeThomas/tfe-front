import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from '../../../core/services/photo.service';
import { Photo } from '../../../../interfaces/country.interface';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { NgxMasonryComponent, NgxMasonryModule } from 'ngx-masonry';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
    selector: 'app-photos',
    imports: [CommonModule, BackgroundComponent,
        NgxMasonryModule,
        HttpClientModule
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

  constructor(
    private route: ActivatedRoute,
    private photoService: PhotoService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const dayId = this.route.snapshot.paramMap.get('jourId');
    const role = localStorage.getItem('role') || '';
    
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
}