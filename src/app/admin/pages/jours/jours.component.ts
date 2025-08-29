import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ItemTableComponent } from '../../../shared/components/item-table/item-table.component';
import { Jour } from '../../../interfaces/jour.interface';
import { DayService } from '../../../core/services/day.service';
import { DayAdminService } from '../../../core/services/admin/dayAdminService.service';
import { PhotoService } from '../../../core/services/photo.service';
import { VoyageService } from '../../../core/services/voyage.service';
import { Voyage } from '../../../interfaces/voyage.interface';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { Country } from '../../../interfaces/country.interface';
import { CountryService } from '../../../core/services/country.service';

@Component({
  selector: 'app-admin-jours',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ItemTableComponent,
    BreadcrumbComponent
  ],
  templateUrl: './jours.component.html',
  styleUrl: './jours.component.css'
})
export class AdminJoursComponent implements OnInit {
   countrySlug!: string;
  voyageSlug!: string;
  countryId!: number;
  voyageId!: number;
  voyage: Voyage | null = null;
  jours: Jour[] = []; // Jours actifs (publiés)
  unpublishedJours: Jour[] = []; // Jours non publiés
  deletedJours: Jour[] = []; // Jours supprimés

  // Edit functionality properties
  editingJour: Jour | null = null;
  editForm: FormGroup;

  // Create functionality properties
  showCreateForm: boolean = false;
  createForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dayService: DayService,
    private dayAdminService: DayAdminService,
    private photoService: PhotoService,
    private voyageService: VoyageService,
    private countryService: CountryService
  ) {
    // Initialize edit form
    this.editForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required])
    });

    // Initialize create form
    this.createForm = new FormGroup({
      date: new FormControl(null, [Validators.required]), // Date object instead of string
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      destinations: new FormControl('') // Optionnel
    });
  }

  ngOnInit() {
    // Récupérer les slugs depuis l'URL
    this.countrySlug = this.route.snapshot.paramMap.get('countrySlug')!;
    this.voyageSlug = this.route.snapshot.paramMap.get('voyageSlug')!;
    
    // console.log('Country slug:', this.countrySlug);
    // console.log('Voyage slug:', this.voyageSlug);

    // D'abord récupérer le pays
    this.countryService.getCountryBySlug(this.countrySlug).subscribe({
      next: (country) => {
        this.countryId = country.id;
        // console.log('Country ID:', this.countryId);
        
        // Puis récupérer le voyage
        this.loadVoyageFromSlug();
      },
      error: (error) => {
        console.error('Erreur récupération pays:', error);
      }
    });
  }

private loadVoyageFromSlug() {
  this.voyageService.getVoyageBySlug(this.countrySlug, this.voyageSlug).subscribe({
    next: (voyage) => {
      this.voyage = voyage;
      this.voyageId = voyage.id; // Maintenant vous récupérez l'ID depuis l'objet voyage
      this.loadJours(); // Une fois l'ID récupéré, vous pouvez charger les jours
    },
    error: (error) => {
      console.error('Erreur lors du chargement du voyage:', error);
    }
  });
}

  private loadJours() {
    this.dayAdminService.getAdminSummary(this.voyageId).subscribe({
      next: (summary) => {
        this.jours = summary.published;
        this.unpublishedJours = summary.drafts;
        this.deletedJours = summary.deleted;
        
        // console.log('Jours actifs:', this.jours);
        // console.log('Jours non publiés:', this.unpublishedJours);
        // console.log('Jours supprimés:', this.deletedJours);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des jours:', error);
      }
    });
  }

  publish(jour: Jour) {
    this.dayAdminService.publishDay(jour.id).subscribe({
      next: () => {
        // console.log('Jour publié avec succès');
        this.loadJours(); // Recharger les données
      },
      error: (error) => {
        console.error('Erreur lors de la publication:', error);
      }
    });
  }

  unpublish(jour: Jour) {
    this.dayAdminService.unpublishDay(jour.id).subscribe({
      next: () => {
        // console.log('Jour dépublié avec succès');
        this.loadJours(); // Recharger les données
      },
      error: (error) => {
        console.error('Erreur lors de la dépublication:', error);
      }
    });
  }

  delete(jour: Jour) {
    this.dayAdminService.deleteDay(jour.id).subscribe({
      next: () => {
        // console.log('Jour supprimé avec succès');
        this.loadJours(); // Recharger les données
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    });
  }

  restore(jour: Jour) {
    this.dayAdminService.restoreDay(jour.id).subscribe({
      next: () => {
        // console.log('Jour restauré avec succès');
        this.loadJours(); // Recharger les données
      },
      error: (error) => {
        console.error('Erreur lors de la restauration:', error);
      }
    });
  }

  // Edit functionality methods
  editJour(jour: Jour) {
    this.editingJour = jour;
    this.editForm.patchValue({
      title: jour.title,
      description: jour.description
    });
  }

  saveJour() {
    if (this.editForm.valid && this.editingJour) {
      const updatedJour = {
        ...this.editingJour,
        title: this.editForm.value.title,
        description: this.editForm.value.description
      };

      this.dayAdminService.updateDay(this.editingJour.id, updatedJour).subscribe({
        next: () => {
          // console.log('Jour modifié avec succès');
          this.cancelEdit();
          this.loadJours(); // Recharger les données
        },
        error: (error: any) => {
          console.error('Erreur lors de la modification:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.editingJour = null;
    this.editForm.reset();
  }

  // Helper method to format destinations display
  getDestinationsDisplay(destinations: any[]): string {
    if (!destinations || destinations.length === 0) {
      return 'Aucune destination';
    }
    return destinations.map(dest => dest.name || dest).join(', ');
  }

  // Create functionality methods
  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
  }

  createJour() {
    if (this.createForm.valid) {
      const formData = this.createForm.value;
      
      // Formater la date au format attendu par l'API (YYYY-MM-DD)
      const dateFormatted = formData.date ? 
        new Date(formData.date).toISOString().split('T')[0] : '';
      
      // Préparer les destinations comme tableau de noms (destinationNames)
      const destinationNames = formData.destinations 
        ? formData.destinations.split(',').map((dest: string) => dest.trim()).filter((dest: string) => dest.length > 0)
        : [];

      const newJour = {
        date: dateFormatted,
        title: formData.title,
        description: formData.description,
        tripId: this.voyageId,
        destinationNames: destinationNames // Changé de 'destinations' à 'destinationNames'
      };

      // console.log('Données envoyées à l\'API:', newJour); // Pour débugger

      this.dayAdminService.createDay(newJour).subscribe({
        next: (response: any) => {
          // console.log('Jour créé avec succès:', response);
          this.resetCreateForm();
          this.showCreateForm = false;
          this.loadJours(); // Recharger les données
        },
        error: (error: any) => {
          console.error('Erreur lors de la création du jour:', error);
        }
      });
    }
  }

  resetCreateForm() {
    this.createForm.reset();
  }

  onLogoClick() {
    this.router.navigate(['']);
  }
    getJourSlug(jour: any): string {
    return jour.title.toLowerCase()
      .replace(/[àáâäãå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
