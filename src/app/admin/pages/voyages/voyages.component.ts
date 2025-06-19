import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
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
import { Voyage } from '../../../../interfaces/country.interface';
import { VoyageService } from '../../../core/services/voyage.service';



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
    MatInputModule
  ],
  templateUrl: './voyages.component.html',
  styleUrls: ['./voyages.component.css']
})
export class AdminVoyagesComponent implements OnInit {
  countryId!: number;
  voyages: Voyage[] = [];
  deletedVoyages: Voyage[] = [];
  voyageForm = new FormGroup({
    name:        new FormControl<string>('', Validators.required),
    date_debut:  new FormControl<string>('', Validators.required),
    date_fin:    new FormControl<string>('', Validators.required),
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
          console.error('Erreur chargement voyages actifs :', err);
          return of([] as Voyage[]);
        })
      )
      .subscribe(list => this.voyages = list);
  }

  private loadDeletedVoyages() {
    this.voyageService.getDeletedVoyagesByCountryId(this.countryId)
      .pipe(
        catchError(err => {
          console.error('Erreur chargement voyages supprimés :', err);
          return of([] as Voyage[]);
        })
      )
      .subscribe(list => this.deletedVoyages = list);
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
      .subscribe(() => this.loadVoyages());
  }

  unpublish(v: Voyage) {
    this.voyageService.unpublishVoyage(v.voyageId)
      .subscribe(() => this.loadVoyages());
  }

  delete(v: Voyage) {
    this.voyageService.deleteVoyage(v.voyageId)
      .subscribe(() => {
        this.loadVoyages();
        this.loadDeletedVoyages();
      });
  }

  restore(v: Voyage) {
    this.voyageService.restoreVoyage(v.voyageId)
      .subscribe(() => {
        this.loadVoyages();
        this.loadDeletedVoyages();
      });
  }
}
