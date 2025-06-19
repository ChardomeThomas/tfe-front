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
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { Voyage } from '../../../../interfaces/country.interface';
import { VoyageService } from '../../../core/services/voyage.service';
import { ItemTableComponent } from '../../../shared/components/item-table/item-table.component';

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
    ItemTableComponent
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
  voyages: Voyage[] = [];
  deletedVoyages: Voyage[] = [];
  unpublishedVoyages: Voyage[] = []; // Voyages dépubliés
  voyageForm = new FormGroup({
    name:        new FormControl<string>('', Validators.required),
    date_debut:  new FormControl<string>('', [
      Validators.required,
      this.startDateValidator()
    ]),
    date_fin:    new FormControl<string>('', [
      Validators.required,
      this.endDateValidator()
    ])
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private voyageService: VoyageService
  ) {}

  ngOnInit() {
    this.countryId = Number(this.route.snapshot.paramMap.get('countryId'));
    this.loadVoyages();
    this.loadDeletedVoyages();
  }

  onLogoClick() {
    this.router.navigate(['']);
  }

  private loadVoyages() {
    this.voyageService.getVoyagesByCountryId(this.countryId)
      .pipe(
        catchError(err => {
          console.error('Erreur chargement voyages :', err);
          return of([] as Voyage[]);
        })
      )
      .subscribe(list => {
        this.voyages = list.filter(v => v.status === 'PUBLISHED');
        this.unpublishedVoyages = list.filter(v => v.status === 'DRAFT');
      });
  }

  private loadDeletedVoyages() {
    this.voyageService.getDeletedVoyagesByCountryId(this.countryId)
      .pipe(
        catchError(err => {
          console.error('Erreur chargement voyages supprimés :', err);
          return of([] as Voyage[]);
        })
      )
      .subscribe(list => {
        this.deletedVoyages = list;
      });
  }

  addVoyage() {
    if (this.voyageForm.invalid) return;

    // On s'assure que ce sont bien des string, grâce à la déclaration FormControl<string>
    const name: string       = this.voyageForm.get('name')!.value!;
    const date_debut: string = this.voyageForm.get('date_debut')!.value!;
    const date_fin: string   = this.voyageForm.get('date_fin')!.value!;

    this.voyageService.addVoyage({
      countryId:  this.countryId,
      name,
      date_debut,
      date_fin
    }).subscribe(() => {
      this.voyageForm.reset();
      this.loadVoyages();
    });
  }

  publish(v: Voyage) {
    this.voyageService.publishVoyage(v.voyageId)
      .subscribe(() => {
        // Retirer le voyage de la liste des non publiés
        this.unpublishedVoyages = this.unpublishedVoyages.filter(voyage => voyage.voyageId !== v.voyageId);

        // Ajouter le voyage à la liste des publiés
        this.voyages = [...this.voyages, { ...v, status: 'PUBLISHED' }];
      });
  }

  unpublish(voyage: Voyage) {
    this.voyageService.unpublishVoyage(voyage.voyageId).subscribe(() => {
      // Retirer le voyage de la liste des publiés
      this.voyages = this.voyages.filter(v => v.voyageId !== voyage.voyageId);

      // Ajouter le voyage à la liste des non publiés
      this.unpublishedVoyages = [...this.unpublishedVoyages, { ...voyage, status: 'DRAFT' }];
    });
  }

  delete(v: Voyage) {
    this.voyageService.deleteVoyage(v.voyageId)
      .subscribe(() => {
        // Retirer le voyage des listes actives et non publiées
        this.voyages = this.voyages.filter(voyage => voyage.voyageId !== v.voyageId);
        this.unpublishedVoyages = this.unpublishedVoyages.filter(voyage => voyage.voyageId !== v.voyageId);

        // Recharger la liste des voyages supprimés
        this.loadDeletedVoyages();
      });
  }

  restore(v: Voyage) {
    this.voyageService.restoreVoyage(v.voyageId)
      .subscribe(() => {
        // Recharger les listes des voyages actifs et supprimés
        this.loadVoyages();
        this.loadDeletedVoyages();
      });
  }

  private startDateValidator() {
    return (control: AbstractControl) => {
      const startDate = new Date(control.value);
      const endDate = new Date(this.voyageForm?.get('date_fin')?.value || '');
      if (endDate && startDate > endDate) {
        return { afterEndDate: true };
      }
      return null;
    };
  }

  private endDateValidator() {
    return (control: AbstractControl) => {
      const endDate = new Date(control.value);
      const startDate = new Date(this.voyageForm?.get('date_debut')?.value || '');
      if (startDate && startDate > endDate) {
        return { beforeStartDate: true };
      }
      return null;
    };
  }
}
