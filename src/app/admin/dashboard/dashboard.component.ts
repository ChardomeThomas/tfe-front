import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule }  from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { MatTableDataSource, MatTableModule }         from '@angular/material/table';
import { MatToolbarModule }           from '@angular/material/toolbar';
import { MatCardModule }              from '@angular/material/card';
import { MatIconModule }              from '@angular/material/icon';
import { MatButtonModule }            from '@angular/material/button';
import { MatFormFieldModule }         from '@angular/material/form-field';
import { MatInputModule }             from '@angular/material/input';
import { MatListModule }              from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { catchError, of }             from 'rxjs';

import { CountryResult }             from '../../models/country-result.model';
import { CountryService }            from '../../core/services/country.service';
import { CountrySearchService }      from '../../core/services/country-search.service';
import { Country }                   from '../../../interfaces/country.interface';
import { ItemTableComponent }        from '../../shared/components/item-table/item-table.component';

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
  unpublishedCountries: Country[] = []; // Liste des pays non publiés

  constructor(
    private countrySearchService: CountrySearchService,
    private countryService: CountryService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.countryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      flag: new FormControl('', [Validators.required, Validators.pattern('https?://.+')])
    });
  }

  ngOnInit() {
    this.countrySearchService.loadAll().subscribe();
    this.loadCountries();
    this.loadDeletedCountries();
  }

  private loadCountries() {
    this.countryService.getCountries()
      .pipe(
        catchError(err => {
          console.error('Chargement pays actifs échoué :', err);
          return of([] as Country[]);
        })
      )
      .subscribe(list => {
        // Filtrer les pays actifs et non publiés
        this.countries = list.filter(country => country.status === 'PUBLISHED');
        this.unpublishedCountries = list.filter(country => country.status === 'DRAFT');
      });
  }

  private loadDeletedCountries() {
    this.countryService.getDeletedCountries()
      .pipe(
        catchError(err => {
          console.error('Chargement pays supprimés échoué :', err);
          return of([] as Country[]);
        })
      )
      .subscribe(list => {
        this.deletedCountries = list;
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
    this.countryService.addCountry({ name, flag })
      .subscribe({
        next: () => {
          this.loadCountries();
          this.resetSelection();
        },
        error: err => {
          if (err.status === 409) {
            this.dialog.open(this.existsDialog);
          } else {
            console.error('Erreur ajout :', err);
          }
        }
      });
  }

  publishCountry(c: Country) {
    this.countryService.publishCountry(c.countryId)
      .subscribe(() => this.loadCountries());
  }

  unpublishCountry(c: Country) {
    this.countryService.unpublishCountry(c.countryId).subscribe(() => {
      // Retirer le pays de la liste des actifs
      this.countries = this.countries.filter(country => country.countryId !== c.countryId);

      // Ajouter le pays à la liste des non publiés
      this.unpublishedCountries = [...this.unpublishedCountries, { ...c, status: 'DRAFT' }];
    });
  }

  deleteCountry(c: Country) {
    this.countryService.deleteCountry(c.countryId)
      .subscribe(() => {
        this.loadCountries();
        this.loadDeletedCountries();
      });
  }

  restoreCountry(c: Country) {
    this.countryService.restoreCountry(c.countryId)
      .subscribe(() => {
        this.loadCountries();
        this.loadDeletedCountries();
      });
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
