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
import { CommentsComponent } from "../../../shared/components/comments/comments.component";

@Component({
  selector: 'app-photos',
  imports: [CommonModule,
    NgxMasonryModule,
    HttpClientModule,
    LottieComponent,
    BreadcrumbComponent,
    CommentsComponent
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
  
  showModal = false;
  selectedPhoto: Photo | null = null;
  selectedIndex: number = -1;

  // Configuration de l'animation Lottie pour qu'elle ne boucle pas
  loaderOptions: AnimationOptions = {
    path: '/assets/lottie/Photo.json',
    loop: false // <-- C'est l'ajout le plus important
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
    const jourId = this.route.snapshot.params['jourId']; 
    
    this.intervalId = setInterval(() => {
      this.dotCount = (this.dotCount + 1) % 4; 
      this.displayText = this.baseText + '.'.repeat(this.dotCount);
    }, 500); 

    if (jourId) {
      this.loadPhotosByDayId(+jourId);
    } 
    else if (countrySlug && voyageSlug && jourSlug) {
      this.dayService.getDayBySlug(countrySlug, voyageSlug, jourSlug).subscribe({
        next: (jour) => {
          this.loadPhotosByDayId(jour.id);
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

    setTimeout(() => {
      if (!this.allLoaded) {
        this.allLoaded = true;
        this.cdr.detectChanges();
      }
    }, 15000);
  }

  private loadPhotosByDayId(dayId: number): void {
    this.photoService.getPhotosByDay(dayId).subscribe({
      next: (photos) => {
        this.photos = photos;
        this.loading = false;
        
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
      this.cdr.detectChanges();
      
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
    this.selectedIndex = this.photos.findIndex(p => p.id === photo.id);
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    this.selectedPhoto = null;
    this.selectedIndex = -1;
    document.body.style.overflow = 'auto';
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  previousPhoto(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.selectedPhoto = this.photos[this.selectedIndex];
    }
  }

  nextPhoto(): void {
    if (this.selectedIndex < this.photos.length - 1) {
      this.selectedIndex++;
      this.selectedPhoto = this.photos[this.selectedIndex];
    }
  }
}