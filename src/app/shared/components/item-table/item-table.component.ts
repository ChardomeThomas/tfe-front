import { Component, Input, TemplateRef, OnChanges } from '@angular/core';
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
export class ItemTableComponent implements OnChanges {
  @Input() title!: string;
  @Input() dataSource: any[] = [];
  @Input() columns: string[] = [];
  @Input() actionsTemplate?: TemplateRef<any>;
  @Input() statusFilter?: string; // Nouveau : Filtrer par statut

  displayedColumns: string[] = [];
  filteredDataSource: any[] = []; // Nouveau : Données filtrées

  // Variables pour la prévisualisation photo
  private photoPreviewElement: HTMLElement | null = null;

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

  // Méthodes pour la prévisualisation photo
  showPhotoPreview(event: MouseEvent, imageUrl: string) {
    this.hidePhotoPreview(); // S'assurer qu'aucune autre prévisualisation n'est active

    this.photoPreviewElement = document.createElement('div');
    this.photoPreviewElement.className = 'photo-preview-floating';
    this.photoPreviewElement.style.cssText = `
      position: fixed;
      width: 300px;
      height: 200px;
      background-image: url('${imageUrl}');
      background-size: cover;
      background-position: center;
      border: 3px solid #2563eb;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      pointer-events: none;
      transition: opacity 0.2s ease;
      background-color: #f3f4f6;
    `;

    document.body.appendChild(this.photoPreviewElement);
    this.updatePhotoPreviewPosition(event);

    // Animation d'entrée
    setTimeout(() => {
      if (this.photoPreviewElement) {
        this.photoPreviewElement.style.opacity = '1';
      }
    }, 10);
  }

  hidePhotoPreview() {
    if (this.photoPreviewElement) {
      this.photoPreviewElement.style.opacity = '0';
      setTimeout(() => {
        if (this.photoPreviewElement && this.photoPreviewElement.parentNode) {
          this.photoPreviewElement.parentNode.removeChild(this.photoPreviewElement);
        }
        this.photoPreviewElement = null;
      }, 200);
    }
  }

  updatePhotoPreviewPosition(event: MouseEvent) {
    if (!this.photoPreviewElement) return;

    const x = event.clientX;
    const y = event.clientY;
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
