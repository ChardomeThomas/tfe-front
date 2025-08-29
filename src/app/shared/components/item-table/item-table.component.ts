import { Component, Input, TemplateRef, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-item-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule],
  templateUrl: './item-table.component.html',
  styleUrls: ['./item-table.component.css']
})
export class ItemTableComponent implements OnChanges, OnInit {
  @Input() title!: string;
  @Input() dataSource: any[] = [];
  @Input() columns: string[] = [];
  @Input() actionsTemplate?: TemplateRef<any>;
  @Input() statusFilter?: string;
  
  private isPreviewVisible = false;
  public isMobileDevice = false;
  displayedColumns: string[] = [];
  filteredDataSource: any[] = [];

  // Variables pour la prévisualisation photo
  private photoPreviewElement: HTMLElement | null = null;

  ngOnInit() {
    this.isMobileDevice = this.detectMobileDevice();
  }

  detectMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  // Méthode unifiée pour gérer les événements tactiles et souris
  handlePointerStart(event: Event, thumbnailUrl: string) {
    if (this.isMobileDevice) {
      this.togglePhotoPreview(event, thumbnailUrl);
    } else {
      this.showPhotoPreview(event, thumbnailUrl);
    }
  }

  handlePointerEnd() {
    if (!this.isMobileDevice) {
      this.hidePhotoPreview();
    }
  }

  handlePointerMove(event: Event) {
    if (!this.isMobileDevice) {
      this.updatePhotoPreviewPosition(event);
    }
  }

  togglePhotoPreview(event: Event, thumbnailUrl: string) {
    if (this.isPreviewVisible) {
      this.hidePhotoPreview();
    } else {
      this.showPhotoPreview(event, thumbnailUrl);
    }
  }

  ngOnChanges() {
    this.displayedColumns = this.actionsTemplate
      ? [...this.columns, 'actions']
      : [...this.columns];

    // Appliquer le filtre de statut si défini
    this.filteredDataSource = this.statusFilter
      ? this.dataSource.filter(item => item.status === this.statusFilter)
      : this.dataSource;
  }

  // Helper method to format destinations display
  formatDestinations(destinations: any[]): string {
    if (!destinations || destinations.length === 0) {
      return 'Aucune destination';
    }
    return destinations.map(dest => dest.name || dest).join(', ');
  }

  // Méthodes pour la prévisualisation photo - Version unifiée
showPhotoPreview(event: Event, imageUrl: string) {
  this.hidePhotoPreview();
  this.isPreviewVisible = true;

  this.photoPreviewElement = document.createElement('div');
  
  if (this.isMobileDevice) {
    // Version mobile - prévisualisation centrée et plus grande
    this.photoPreviewElement.className = 'fixed inset-4 bg-gray-100 border-4 border-blue-600 rounded-xl shadow-2xl transition-opacity duration-200 opacity-0 z-50';
    this.photoPreviewElement.style.cssText = `
      background-image: url('${imageUrl}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 9999;
    `;
    
    // Ajouter un bouton de fermeture pour mobile
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center text-xl font-bold';
    closeButton.onclick = () => this.hidePhotoPreview();
    this.photoPreviewElement.appendChild(closeButton);
    
    // Centrer sur l'écran (mobile)
    document.body.appendChild(this.photoPreviewElement);
  } else {
    // Version desktop - prévisualisation qui suit la souris
    this.photoPreviewElement.className = 'fixed w-75 h-50 bg-gray-100 border-4 border-blue-600 rounded-xl shadow-2xl pointer-events-none transition-opacity duration-200 opacity-0';
    this.photoPreviewElement.style.cssText = `
      background-image: url('${imageUrl}');
      background-size: cover;
      background-position: center;
      z-index: 9999;
      width: 300px;
      height: 200px;
    `;
    
    document.body.appendChild(this.photoPreviewElement);
    this.updatePhotoPreviewPosition(event);
  }

  // Animation d'entrée
  setTimeout(() => {
    if (this.photoPreviewElement) {
      this.photoPreviewElement.classList.remove('opacity-0');
      this.photoPreviewElement.classList.add('opacity-100');
    }
  }, 10);
}

  hidePhotoPreview() {
    if (this.photoPreviewElement) {
      this.isPreviewVisible = false;
      // Utilisation des classes Tailwind pour l'animation de sortie
      this.photoPreviewElement.classList.remove('opacity-100');
      this.photoPreviewElement.classList.add('opacity-0');
      
      setTimeout(() => {
        if (this.photoPreviewElement && this.photoPreviewElement.parentNode) {
          this.photoPreviewElement.parentNode.removeChild(this.photoPreviewElement);
        }
        this.photoPreviewElement = null;
      }, 200);
    }
  }

  // Fonction utilitaire pour extraire les coordonnées d'un événement
  private getEventCoordinates(event: Event): { clientX: number, clientY: number } {
    if (event instanceof MouseEvent) {
      return { clientX: event.clientX, clientY: event.clientY };
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
    } else if (event instanceof TouchEvent && event.changedTouches.length > 0) {
      return { clientX: event.changedTouches[0].clientX, clientY: event.changedTouches[0].clientY };
    }
    return { clientX: 0, clientY: 0 };
  }

updatePhotoPreviewPosition(event: Event) {
  // Ne repositionner que sur desktop
  if (!this.photoPreviewElement || this.isMobileDevice) return;

  const { clientX: x, clientY: y } = this.getEventCoordinates(event);
  const previewWidth = 300;
  const previewHeight = 200;
  const margin = 20;

  // Calculer la position pour éviter de sortir de l'écran
  let left = x + margin;
  let top = y - previewHeight / 2;

  // Ajuster si on sort à droite de l'écran
  if (left + previewWidth > window.innerWidth) {
    left = x - previewWidth - margin;
  }

  // Ajuster si on sort en haut ou en bas de l'écran
  if (top < margin) {
    top = margin;
  } else if (top + previewHeight > window.innerHeight - margin) {
    top = window.innerHeight - previewHeight - margin;
  }

  this.photoPreviewElement.style.left = `${left}px`;
  this.photoPreviewElement.style.top = `${top}px`;
}
}