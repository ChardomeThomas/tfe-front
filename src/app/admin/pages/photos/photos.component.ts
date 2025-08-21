import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule }    from '@angular/material/card';
import { MatTableModule }   from '@angular/material/table';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Photo } from '../../../interfaces/photo.interface';
import { PhotoAdminService } from '../../../core/services/admin/photoAdminService.service';
import { ItemTableComponent } from '../../../shared/components/item-table/item-table.component';

@Component({
    selector: 'app-admin-photos',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        MatToolbarModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatCheckboxModule,
        ItemTableComponent
    ],
    templateUrl: './photos.component.html',
    styleUrl: './photos.component.css'
})
export class AdminPhotosComponent implements OnInit, OnDestroy {
  countryId!: number;
  voyageId!: number;
  jourId!: number;
  
  photos: Photo[] = [];
  deletedPhotos: Photo[] = [];
  unpublishedPhotos: Photo[] = []; // Photos non publiées
  
  selectedFiles: File[] = []; // Pour l'upload multiple
  fileDescriptions: string[] = []; // Descriptions individuelles par index
  fileIsFavorite: boolean[] = []; // Si chaque fichier est favori
  fileIsPublic: boolean[] = []; // Si chaque fichier est public
  fileIsPublished: boolean[] = []; // Si chaque fichier sera publié
  
  private objectUrls: string[] = []; // Pour nettoyer les URLs d'objet
  private imageUrls: Map<File, string> = new Map(); // Cache des URLs d'images

  // Propriétés pour les tableaux
  photoColumns = ['image', 'description', 'status', 'datePublished'];
  unpublishedPhotoColumns = ['image', 'description', 'status'];
  deletedPhotoColumns = ['image', 'description', 'deletedDate'];

  multiplePhotoForm = new FormGroup({
    description: new FormControl<string>('')
  });  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private photoAdminService: PhotoAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.countryId = Number(this.route.snapshot.paramMap.get('countryId'));
    this.voyageId = Number(this.route.snapshot.paramMap.get('voyageId'));
    this.jourId = Number(this.route.snapshot.paramMap.get('jourId'));
    this.loadAdminSummary();
  }

  private loadAdminSummary() {
    this.photoAdminService.getAdminSummary(this.jourId)
      .pipe(
        catchError(err => {
          console.error('Erreur chargement résumé admin photos :', err);
          return of({ deleted: [], drafts: [], published: [] });
        })
      )
      .subscribe(summary => {
        this.photos = summary.published;
        this.unpublishedPhotos = summary.drafts;
        this.deletedPhotos = summary.deleted;
        console.log('Photos publiées:', this.photos);
        console.log('Photos non publiées:', this.unpublishedPhotos);
        console.log('Photos supprimées:', this.deletedPhotos);
      });
  }

  onMultipleFilesSelected(event: any) {
    const newFiles = Array.from(event.target.files) as File[];
    
    if (newFiles.length > 0) {
      // Ajouter les nouveaux fichiers aux fichiers existants (éviter les doublons)
      newFiles.forEach(newFile => {
        const existingIndex = this.selectedFiles.findIndex(file => 
          file.name === newFile.name && file.size === newFile.size && file.lastModified === newFile.lastModified
        );
        
        if (existingIndex === -1) {
          this.selectedFiles.push(newFile);
          
          // Créer l'URL d'aperçu une seule fois et la mettre en cache
          const url = URL.createObjectURL(newFile);
          this.imageUrls.set(newFile, url);
          this.objectUrls.push(url);
          
          // Initialiser les options par défaut pour le nouveau fichier
          this.fileDescriptions.push('');
          this.fileIsFavorite.push(false); // Non favori par défaut
          this.fileIsPublic.push(false); // Privé par défaut (sera désactivé car brouillon)
          this.fileIsPublished.push(false); // Brouillon par défaut
        }
      });
      
      // Réinitialiser l'input file pour permettre de sélectionner les mêmes fichiers à nouveau
      event.target.value = '';
      
      console.log('Fichiers sélectionnés:', this.selectedFiles.length);
    }
  }

  updateFileDescription(index: number, description: string) {
    console.log(`=== updateFileDescription appelée ===`);
    console.log('Index:', index);
    console.log('Description reçue:', `"${description}"`);
    
    if (index >= 0 && index < this.fileDescriptions.length) {
      this.fileDescriptions[index] = description;
      console.log('Description stockée:', `"${this.fileDescriptions[index]}"`);
    } else {
      console.error('Index invalide:', index, 'Taille tableau:', this.fileDescriptions.length);
    }
  }

  removeSelectedFile(index: number) {
    if (index >= 0 && index < this.selectedFiles.length) {
      // Nettoyer l'URL de l'image avant suppression
      const file = this.selectedFiles[index];
      const url = this.imageUrls.get(file);
      if (url) {
        URL.revokeObjectURL(url);
        this.imageUrls.delete(file);
        const urlIndex = this.objectUrls.indexOf(url);
        if (urlIndex > -1) {
          this.objectUrls.splice(urlIndex, 1);
        }
      }
      
      // Supprimer le fichier et toutes ses propriétés correspondantes
      this.selectedFiles.splice(index, 1);
      this.fileDescriptions.splice(index, 1);
      this.fileIsFavorite.splice(index, 1);
      this.fileIsPublic.splice(index, 1);
      this.fileIsPublished.splice(index, 1);
      
      console.log('Fichier supprimé à l\'index:', index, 'Fichiers restants:', this.selectedFiles.length);
    }
  }

  getFileDescription(index: number): string {
    return this.fileDescriptions[index] || '';
  }

  toggleFileFavorite(index: number) {
    if (index >= 0 && index < this.fileIsFavorite.length) {
      this.fileIsFavorite[index] = !this.fileIsFavorite[index];
      console.log(`Photo ${index + 1} - Favori:`, this.fileIsFavorite[index]);
      
      // Règle métier : une photo favorite doit être publique
      if (this.fileIsFavorite[index]) {
        this.fileIsPublic[index] = true;
        console.log(`Photo ${index + 1} - Automatiquement mise en public car favorite`);
      }
    }
  }

  toggleFilePublic(index: number) {
    if (index >= 0 && index < this.fileIsPublic.length) {
      // Empêcher de mettre en privé si la photo est favorite
      if (!this.fileIsPublic[index] && this.fileIsFavorite[index]) {
        console.log(`Photo ${index + 1} - Impossible de mettre en privé : photo favorite`);
        return;
      }
      
      this.fileIsPublic[index] = !this.fileIsPublic[index];
      console.log(`Photo ${index + 1} - Public:`, this.fileIsPublic[index]);
    }
  }

  // Méthode pour vérifier si le bouton privé doit être désactivé
  isPublicToggleDisabled(index: number): boolean {
    return this.fileIsFavorite[index] && this.fileIsPublic[index];
  }

  // Méthode pour afficher le tooltip du bouton public/privé
  getPublicButtonTooltip(index: number): string {
    if (!this.fileIsPublished[index]) {
      return 'Publiez d\'abord la photo pour gérer sa visibilité';
    }
    if (this.isPublicToggleDisabled(index)) {
      return 'Les photos favorites doivent rester publiques';
    }
    return this.fileIsPublic[index] ? 'Mettre en privé' : 'Mettre en public';
  }

  toggleFilePublished(index: number) {
    if (index >= 0 && index < this.fileIsPublished.length) {
      this.fileIsPublished[index] = !this.fileIsPublished[index];
      console.log(`Photo ${index + 1} - Publié:`, this.fileIsPublished[index]);
      // Si on met en brouillon, on rend automatiquement privé
      if (!this.fileIsPublished[index]) {
        this.fileIsPublic[index] = false;
        console.log(`Photo ${index + 1} - Automatiquement mis en privé car brouillon`);
      } else {
        // Si on remet en publié, on remet public par défaut
        this.fileIsPublic[index] = true;
        console.log(`Photo ${index + 1} - Automatiquement mis en public car publié`);
      }
    }
  }

  getImagePreview(file: File): string {
    // Retourner l'URL mise en cache au lieu de créer une nouvelle
    return this.imageUrls.get(file) || '';
  }

  ngOnDestroy() {
    // Nettoyer toutes les URLs d'objet pour éviter les fuites mémoire
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls = [];
    this.imageUrls.clear();
  }

  clearAllSelectedFiles() {
    // Nettoyer toutes les URLs d'objet avant de vider la sélection
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls = [];
    this.imageUrls.clear();
    
    this.selectedFiles = [];
    this.fileDescriptions = [];
    this.fileIsFavorite = [];
    this.fileIsPublic = [];
    this.fileIsPublished = [];
    console.log('Tous les fichiers supprimés');
  }

  private finishUpload() {
    // Nettoyer toutes les URLs d'objet après un upload réussi
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls = [];
    this.imageUrls.clear();
    
    // Réinitialiser seulement après un upload réussi
    this.multiplePhotoForm.reset();
    this.selectedFiles = [];
    this.fileDescriptions = [];
    this.fileIsFavorite = [];
    this.fileIsPublic = [];
    this.fileIsPublished = [];
    this.loadAdminSummary();
    console.log('Upload terminé avec succès');
  }

  uploadMultiplePhotos() {
    if (this.selectedFiles.length === 0) return;

    console.log('=== DÉBUT UPLOAD AVEC MISE À JOUR DES PROPRIÉTÉS ===');
    console.log('selectedFiles.length:', this.selectedFiles.length);
    console.log('fileDescriptions.length:', this.fileDescriptions.length);
    console.log('fileDescriptions entier:', this.fileDescriptions);
    
    // Préparer les données pour l'upload (on upload tout, puis on ajuste)
    const filesWithOptions = this.selectedFiles.map((file, index) => {
      const description = this.getFileDescription(index);
      console.log(`=== DEBUG Photo ${index + 1} ===`);
      console.log('Fichier:', file.name);
      console.log('Description brute:', `"${description}"`);
      console.log('Description length:', description.length);
      console.log('fileDescriptions[' + index + ']:', `"${this.fileDescriptions[index]}"`);
      console.log('Index valide?', index >= 0 && index < this.fileDescriptions.length);
      
      return {
        file,
        description: description,
        isFavorite: this.fileIsFavorite[index] || false,
        isPublic: this.fileIsPublic[index] || false,
        isPublished: this.fileIsPublished[index] || false
      };
    });
    
    console.log('Photos à uploader:', filesWithOptions);
    
    // Upload toutes les photos d'abord
    this.photoAdminService.uploadMultiplePhotosWithDescriptions(filesWithOptions, this.jourId)
      .subscribe({
        next: (uploadedPhotos) => {
          console.log('Photos uploadées, mise à jour des propriétés...');
          
          // Créer les promesses de mise à jour pour chaque photo (en séquence)
          const updatePromises: Promise<any>[] = [];
          
          uploadedPhotos.forEach((photo: any, index: number) => {
            const originalIndex = index;
            const shouldBeFavorite = this.fileIsFavorite[originalIndex] || false;
            const shouldBePublic = this.fileIsPublic[originalIndex] || false;
            const shouldBePublished = this.fileIsPublished[originalIndex] || false;
            
            console.log(`Photo ${photo.id} - État actuel vs souhaité:`, {
              actualFavorite: photo.favorite, shouldBeFavorite,
              actualPublic: photo.isPublic, shouldBePublic,
              actualPublished: !!photo.publishedDate, shouldBePublished,
              description: photo.description
            });
            
            // Créer une chaîne de promesses pour cette photo (séquentiel)
            let photoUpdateChain = Promise.resolve();
            
            // 1. D'abord gérer le statut publication
            if (shouldBePublished && !photo.publishedDate) {
              photoUpdateChain = photoUpdateChain.then(() => 
                this.photoAdminService.publishPhoto(photo.id).toPromise()
                  .then(() => console.log(`Photo ${photo.id} publiée`))
              );
            } else if (!shouldBePublished && photo.publishedDate) {
              photoUpdateChain = photoUpdateChain.then(() => 
                this.photoAdminService.unpublishPhoto(photo.id).toPromise()
                  .then(() => console.log(`Photo ${photo.id} dépubliée (brouillon)`))
              );
            }
            
            // 2. Ensuite gérer le statut public/privé (seulement si doit être publié)
            if (shouldBePublished) {
              if (!shouldBePublic && photo.isPublic) {
                // CAS SPÉCIAL : Photo publiée mais doit être privée
                console.log(`Photo ${photo.id} - Cas spécial: publié + privé`);
                photoUpdateChain = photoUpdateChain.then(() => 
                  this.photoAdminService.togglePublic(photo.id).toPromise()
                    .then(() => {
                      console.log(`Photo ${photo.id} mise en privé`);
                      // Republier immédiatement pour s'assurer qu'elle reste publiée
                      console.log(`Photo ${photo.id} - Republication pour maintenir published_date`);
                      return this.photoAdminService.publishPhoto(photo.id).toPromise();
                    })
                    .then(() => console.log(`Photo ${photo.id} republiée (privée mais publiée)`))
                );
              } else if (shouldBePublic && !photo.isPublic) {
                photoUpdateChain = photoUpdateChain.then(() => 
                  this.photoAdminService.togglePublic(photo.id).toPromise()
                    .then(() => console.log(`Photo ${photo.id} mise en public`))
                );
              }
            }
            
            // 3. Enfin gérer le statut favorite
            if (shouldBeFavorite && !photo.favorite) {
              photoUpdateChain = photoUpdateChain.then(() => 
                this.photoAdminService.toggleFavorite(photo.id).toPromise()
                  .then(() => console.log(`Photo ${photo.id} marquée comme favorite`))
              );
            } else if (!shouldBeFavorite && photo.favorite) {
              photoUpdateChain = photoUpdateChain.then(() => 
                this.photoAdminService.toggleFavorite(photo.id).toPromise()
                  .then(() => console.log(`Photo ${photo.id} retirée des favorites`))
              );
            }
            
            updatePromises.push(photoUpdateChain);
          });
          
          // Attendre que toutes les mises à jour soient terminées
          Promise.all(updatePromises)
            .then(() => {
              console.log('Toutes les propriétés mises à jour avec succès');
              this.finishUpload();
            })
            .catch(error => {
              console.error('Erreur lors de la mise à jour des propriétés:', error);
              this.finishUpload(); // On termine quand même l'upload
            });
        },
        error: (error) => {
          console.error('Erreur lors de l\'upload des photos:', error);
        }
      });
  }

  publish(photo: Photo) {
    this.photoAdminService.publishPhoto(photo.id)
      .subscribe(() => {
        this.loadAdminSummary();
      });
  }

  unpublish(photo: Photo) {
    this.photoAdminService.unpublishPhoto(photo.id)
      .subscribe(() => {
        this.loadAdminSummary();
      });
  }

  delete(photo: Photo) {
    // Si la photo est publiée, on la dépublie d'abord
    if (photo.isPublic) {
      this.photoAdminService.unpublishPhoto(photo.id)
        .subscribe({
          next: () => {
            // Maintenant on supprime la photo dépubliée
            this.photoAdminService.deletePhoto(photo.id)
              .subscribe(() => {
                this.loadAdminSummary();
              });
          },
          error: (error) => {
            console.error('Erreur lors de la dépublication avant suppression:', error);
          }
        });
    } else {
      // La photo n'est pas publiée, suppression directe
      this.photoAdminService.deletePhoto(photo.id)
        .subscribe(() => {
          this.loadAdminSummary();
        });
    }
  }

  restore(photo: Photo) {
    console.log('Restauration de la photo:', photo);
    this.photoAdminService.restorePhoto(photo.id)
      .subscribe({
        next: (response) => {
          console.log('Photo restaurée avec succès:', response);
          this.loadAdminSummary();
        },
        error: (error) => {
          console.error('Erreur lors de la restauration:', error);
        }
      });
  }

  toggleFavorite(photo: Photo) {
    this.photoAdminService.toggleFavorite(photo.id)
      .subscribe({
        next: () => {
          this.loadAdminSummary();
        },
        error: (error) => {
          console.error('Erreur lors du toggle favori:', error);
        }
      });
  }

  togglePublic(photo: Photo) {
    this.photoAdminService.togglePublic(photo.id)
      .subscribe({
        next: () => {
          this.loadAdminSummary();
        },
        error: (error) => {
          console.error('Erreur lors du toggle public:', error);
        }
      });
  }

  editDescription(photo: Photo, newDescription: string) {
    this.photoAdminService.updatePhoto(photo.id, { description: newDescription })
      .subscribe({
        next: () => {
          this.loadAdminSummary();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la description:', error);
        }
      });
  }
 




}
