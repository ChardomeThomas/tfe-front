import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

import { CountryResult } from '../../models/country-result.model';
import { CountrySearchService } from '../../core/services/country-search.service';
import { Country } from '../../../interfaces/country.interface';
import { CountryService } from '../../core/services/country.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    RouterModule // Added RouterModule to support <router-outlet>
  ]
})
export class DashboardComponent implements OnInit {
  // Utilisateurs
  users: User[] = [
    { id: 1, name: 'Alice', username: 'alice01', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob',   username: 'bob02',   email: 'bob@example.com',   role: 'User' }
  ];
  dataSource = new MatTableDataSource<User>(this.users);
  displayedColumns: string[] = ['name', 'username', 'email', 'role', 'actions'];

  // Autocomplete pays
  query = '';
  suggestions: CountryResult[] = []
  selectedCountry?: CountryResult;

  // Formulaire d'envoi
  countryForm: FormGroup;

  // Liste des pays ajoutés
  countries: Country[] = [];

  constructor(
    private countrySearchService: CountrySearchService,
    private countryService: CountryService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute // Added ActivatedRoute
  ) {
    this.countryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      flag: new FormControl('', [Validators.required, Validators.pattern('https?://.+')])
    });
  }

  ngOnInit() {
    // précharge la liste des pays pour l'autocomplete
    this.countrySearchService.loadAll().subscribe();
    // charge la liste initiale depuis le backend
    this.refreshCountriesList();
  }

  // Gestion autocomplete
  onChange(val: string) {
    this.suggestions = val.length >= 2 ? this.countrySearchService.suggest(val) : [];
    this.selectedCountry = undefined;
  }

  selectCountry(c: CountryResult) {
    const name = c.translations?.['fra']?.common || c.name.common;
    this.query = this.countrySearchService.normalize(name);
    this.suggestions = [];
    this.selectedCountry = c;

    // Pré-remplit le formulaire
    this.countryForm.patchValue({
      name: name,
      flag: c.flags.png
    });
  }

  // Ajout local et envoi backend
  addCountry() {
    if (this.countryForm.valid) {
      const { name, flag } = this.countryForm.value;
      this.countryService.addCountry({ name, flag }).subscribe({
        next: resp => {
          console.log('Pays ajouté côté serveur :', resp);
          this.refreshCountriesList();
          this.resetSelection();
        },
        error: err => console.error('Erreur lors de l’ajout :', err)
      });
    } else {
      console.error('Le formulaire est invalide.');
    }
  }

  deleteCountry(country: Country) {
    this.countryService.deleteCountry(country).subscribe({
      next: () => {
        console.log(`Pays supprimé : ${country.name}`);
        this.refreshCountriesList();
      },
      error: err => console.error('Erreur lors de la suppression :', err)
    });
  }

  onEditUser(user: User) {
    console.log('Edit user', user);
  }

  onDeleteUser(user: User) {
    this.users = this.users.filter(u => u.id !== user.id);
    this.dataSource.data = this.users;
  }

  private resetSelection() {
    this.query = '';
    this.selectedCountry = undefined;
    this.suggestions = [];
    this.countryForm.reset();
  }

  private refreshCountriesList() {
    this.countryService.getCountries().subscribe(list => {
      this.countries = list.map(c => ({ flag: c.flag, name: c.name, countryId: c.countryId }));
    });
  }
     onLogoClick() {
     this.router.navigate(['']);
   }
   
onCountryClick(country: number) {
  this.router.navigate([`admin/countries/${country}/voyages`]);
}
}
