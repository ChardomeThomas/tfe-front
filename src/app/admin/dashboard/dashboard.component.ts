// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { catchError, of } from 'rxjs';

import { CountryResult } from '../../models/country-result.model';
import { CountrySearchService } from '../../core/services/country-search.service';
import { Country } from '../../../interfaces/country.interface';
import { CountryAdminService } from '../../core/services/admin/countryAdmin.service';
import { ItemTableComponent } from '../../shared/components/item-table/item-table.component';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatDialogModule,
    ItemTableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('existsDialog') existsDialog!: TemplateRef<any>;

  users: User[] = [
    { id: 1, name: 'Alice', username: 'alice01', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob',   username: 'bob02',   email: 'bob@example.com',   role: 'User' }
  ];
  dataSource = new MatTableDataSource<User>(this.users);
  displayedColumns = ['name', 'username', 'email', 'role', 'actions'];

  query = '';
  suggestions: CountryResult[] = [];
  selectedCountry?: CountryResult;

  countryForm: FormGroup;
  countries: Country[] = [];
  deletedCountries: Country[] = [];
  unpublishedCountries: Country[] = [];

  constructor(
    private countrySearchService: CountrySearchService,
    private countryAdminService: CountryAdminService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.countryForm = new FormGroup({
      name: new FormControl('', Validators.required),
      flag: new FormControl('', [Validators.required, Validators.pattern('https?://.+')])
    });
  }

  ngOnInit() {
    this.countrySearchService.loadAll().subscribe();
    this.loadAdminSummary();
  }

  private loadAdminSummary() {
    this.countryAdminService.getAdminSummary()
      .pipe(
        catchError(err => {
          console.error('Échec chargement résumé admin :', err);
          return of({ deleted: [], drafts: [], published: [] });
        })
      )
      .subscribe(summary => {
        this.deletedCountries     = summary.deleted;
        this.unpublishedCountries = summary.drafts;
        this.countries            = summary.published;
      });
  }

  onChange(val: string) {
    this.suggestions = val.length >= 2
      ? this.countrySearchService.suggest(val)
      : [];
    this.selectedCountry = undefined;
  }

  selectCountry(c: CountryResult) {
    const name = c.translations?.['fra']?.common || c.name.common;
    this.query = this.countrySearchService.normalize(name);
    this.suggestions = [];
    this.selectedCountry = c;
    this.countryForm.patchValue({ name, flag: c.flags.png });
  }

addCountry() {
  if (this.countryForm.invalid) {
    console.error('Formulaire invalide.');
    return;
  }
  const { name, flag } = this.countryForm.value;
this.countryAdminService.addCountry({ name, flag }).subscribe({
    next: () => {
      this.loadAdminSummary();
      this.resetSelection();
    },
    error: err => {
      let userMsg = 'Erreur lors de l’ajout.'; // fallback général

      if (err.status === 409) {
        userMsg = err.error?.message || 'Le pays existe déjà.';
      }
      else if (err.status === 403) {
        userMsg = 'Le pays existe déjà.';
      }
      else if (err.status === 0) {
        userMsg = 'Impossible de joindre le serveur.';
      }

      this.dialog.open(this.existsDialog, {
        data: userMsg
      });
    }
  });
}


  publishCountry(c: Country) {
    this.countryAdminService.publishCountry(c.id)
      .subscribe(() => this.loadAdminSummary());
  }

  unpublishCountry(c: Country) {
    this.countryAdminService.unpublishCountry(c.id)
      .subscribe(() => this.loadAdminSummary());
  }

  deleteCountry(c: Country) {
    this.countryAdminService.deleteCountry(c.id)
      .subscribe(() => this.loadAdminSummary());
  }

  restoreCountry(c: Country) {
    this.countryAdminService.restoreCountry(c.id)
      .subscribe(() => this.loadAdminSummary());
  }

  onEditUser(user: User) {
    console.log('Edit user', user);
  }

  onDeleteUser(user: User) {
    this.users = this.users.filter(u => u.id !== user.id);
    this.dataSource.data = this.users;
  }

  onLogoClick() {
    this.router.navigate(['']);
  }

  private resetSelection() {
    this.query = '';
    this.selectedCountry = undefined;
    this.suggestions = [];
    this.countryForm.reset();
  }
}
