import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { Voyage } from '../../../interfaces/voyage.interface';
import { ItemTableComponent } from '../../../shared/components/item-table/item-table.component';
import { VoyageAdminService } from '../../../core/services/admin/voyageAdminService.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { CountryService } from '../../../core/services/country.service';

export const EUROPEAN_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-voyages',
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
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTooltipModule,
    ItemTableComponent,
    BreadcrumbComponent
  ],
  templateUrl: './voyages.component.html',
  styleUrls: ['./voyages.component.css'],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: EUROPEAN_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'fr' },
  ]
})
export class AdminVoyagesComponent implements OnInit {
  countryId!: number;
  countrySlug!: string;
  voyages: Voyage[] = [];
  deletedVoyages: Voyage[] = [];
  unpublishedVoyages: Voyage[] = []; // Voyages dépubliés
  voyageForm = new FormGroup({
    title:       new FormControl<string>('', Validators.required),
    startDate:   new FormControl<string>('', [
      Validators.required,
      this.startDateValidator()
    ]),
    endDate:     new FormControl<string>('', [
      Validators.required,
      this.endDateValidator()
    ])
  });

  showSuccess = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private voyageAdminService: VoyageAdminService,
    private countryService: CountryService
  ) {}

  ngOnInit() {
    this.countryId = Number(this.route.snapshot.paramMap.get('countryId'));
    this.loadAdminSummary();
 this.countrySlug = this.route.snapshot.paramMap.get('countrySlug')!;
    // console.log('Country slug récupéré:', this.countrySlug);

    // Récupérer l'ID du pays à partir du slug
    this.countryService.getCountryBySlug(this.countrySlug).subscribe({
      next: (country) => {
        this.countryId = country.id;
        // console.log('Country ID trouvé:', this.countryId);
        this.loadAdminSummary(); // Maintenant on peut charger les voyages
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du pays:', error);
      }
    });
  }

  onLogoClick() {
    this.router.navigate(['']);
  }

  private loadAdminSummary() {
    this.voyageAdminService.getAdminSummary(this.countryId)
      .pipe(
        catchError(err => {
          console.error('Erreur chargement résumé admin voyages :', err);
          return of({ deleted: [], drafts: [], published: [] });
        })
      )
      .subscribe(summary => {
        // Filtrer les voyages pour ne garder que ceux du pays sélectionné
        this.voyages = summary.published.filter(v => v.pointOfInterestId === this.countryId);
        this.unpublishedVoyages = summary.drafts.filter(v => v.pointOfInterestId === this.countryId);
        this.deletedVoyages = summary.deleted.filter(v => v.pointOfInterestId === this.countryId);
        // console.log('Voyages actifs:', this.voyages);
        // console.log('Voyages non publiés:', this.unpublishedVoyages);
        // console.log('Voyages supprimés:', this.deletedVoyages);
      });
  }

  addVoyage() {
    if (this.voyageForm.invalid) return;

    try {
      const title: string = this.voyageForm.get('title')!.value!;
      const startDateValue = this.voyageForm.get('startDate')!.value!;
      const endDateValue = this.voyageForm.get('endDate')!.value!;

      const startDate = this.formatDateToBackend(startDateValue);
      const endDate = this.formatDateToBackend(endDateValue);

      // console.log('Dates formatées pour le backend:', { startDate, endDate });

      this.voyageAdminService.addVoyage({
        pointOfInterestId: this.countryId,
        title,
        startDate,
        endDate,
        description: ''
      }).subscribe({
        next: () => {
          this.voyageForm.reset();
          // Retire l'état touched/dirty pour enlever le rouge
          Object.keys(this.voyageForm.controls).forEach(key => {
            this.voyageForm.get(key)?.markAsUntouched();
            this.voyageForm.get(key)?.markAsPristine();
          });
          this.loadAdminSummary();
          this.showSuccess = true;
          setTimeout(() => { this.showSuccess = false; }, 2000);
          // console.log('Voyage ajouté avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du voyage:', error);
        }
      });
    } catch (error) {
      console.error('Erreur de formatage des dates:', error);
    }
  }

  // Méthode pour convertir une date au format DD-MM-YYYY
  private formatDateToBackend(dateValue: string): string {
    const date = new Date(dateValue);
    
    // Vérifier que la date est valide
    if (isNaN(date.getTime())) {
      throw new Error('Date invalide');
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 car getMonth() retourne 0-11
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  publish(v: Voyage) {
    this.voyageAdminService.publishVoyage(v.id)
      .subscribe(() => {
        this.loadAdminSummary();
      });
  }

  unpublish(voyage: Voyage) {
    this.voyageAdminService.unpublishVoyage(voyage.id).subscribe(() => {
      this.loadAdminSummary();
    });
  }

  delete(v: Voyage) {
    // Si le voyage est publié, on le dépublie d'abord
    if (v.published) {
      this.voyageAdminService.unpublishVoyage(v.id)
        .subscribe({
          next: () => {
            // Maintenant on supprime le voyage dépublié
            this.voyageAdminService.deleteVoyage(v.id)
              .subscribe(() => {
                this.loadAdminSummary();
              });
          },
          error: (error) => {
            console.error('Erreur lors de la dépublication avant suppression:', error);
          }
        });
    } else {
      // Le voyage n'est pas publié, suppression directe
      this.voyageAdminService.deleteVoyage(v.id)
        .subscribe(() => {
          this.loadAdminSummary();
        });
    }
  }

  restore(v: Voyage) {
    // console.log('Restauration du voyage:', v);
    this.voyageAdminService.restoreVoyage(v.id)
      .subscribe({
        next: (response) => {
          // console.log('Voyage restauré avec succès:', response);
          this.loadAdminSummary();
        },
        error: (error) => {
          console.error('Erreur lors de la restauration:', error);
        }
      });
  }

  private startDateValidator() {
    return (control: AbstractControl) => {
      const startDate = new Date(control.value);
      const endDate = new Date(this.voyageForm?.get('endDate')?.value || '');
      if (endDate && startDate > endDate) {
        return { afterEndDate: true };
      }
      return null;
    };
  }

  private endDateValidator() {
    return (control: AbstractControl) => {
      const endDate = new Date(control.value);
      const startDate = new Date(this.voyageForm?.get('startDate')?.value || '');
      if (startDate && startDate > endDate) {
        return { beforeStartDate: true };
      }
      return null;
    };
  }
   getVoyageSlug(voyage: any): string {
    return voyage.title.toLowerCase()
      .replace(/[àáâäãå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
