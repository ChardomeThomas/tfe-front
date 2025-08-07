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
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { catchError, of } from 'rxjs';

import { CountryResult } from '../../interfaces/country-result.model';
import { CountrySearchService } from '../../core/services/country-search.service';
import { Country } from '../../interfaces/country.interface';
import { User } from '../../interfaces/user.interface';
import { CountryAdminService } from '../../core/services/admin/countryAdmin.service';
import { UserService } from '../../core/services/admin/userService.service';
import { AuthService } from '../../core/services/auth.service';
import { ItemTableComponent } from '../../shared/components/item-table/item-table.component';

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
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    MatMenuModule,
    ItemTableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('existsDialog') existsDialog!: TemplateRef<any>;

  users: User[] = [];
  dataSource = new MatTableDataSource<User>(this.users);
  displayedColumns = ['username', 'email', 'role', 'actions'];

  // Gestion des rôles
  currentUserRole: string = '';
  availableRoles: string[] = [];
  allRoles = ['INVITED', 'FRIEND', 'ADMIN', 'SUPERADMIN'];

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
    private userService: UserService,
    private authService: AuthService,
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
    this.loadUsers();
    this.setCurrentUserRole();
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

  private loadUsers() {
    this.userService.getUsers()
      .pipe(
        catchError(err => {
          console.error('Erreur lors du chargement des utilisateurs :', err);
          return of([]);
        })
      )
      .subscribe(users => {
        this.users = users;
        this.dataSource.data = this.users;
      });
  }

  private setCurrentUserRole() {
    // D'abord essayer de récupérer le rôle depuis le token JWT
    const roleFromToken = this.authService.getUserRole();
    if (roleFromToken) {
      this.currentUserRole = roleFromToken;
      console.log('Current user role from token:', this.currentUserRole);
      this.setAvailableRoles();
      return;
    }

    // Si pas de rôle dans le token, récupérer via l'email
    const email = this.authService.getUserEmail();
    if (email) {
      console.log('Fetching user role via email:', email);
      this.userService.getCurrentUser(email).subscribe({
        next: (user) => {
          if (user) {
            this.currentUserRole = user.role;
            console.log('Current user role from API:', this.currentUserRole);
            this.setAvailableRoles();
          } else {
            console.error('Utilisateur non trouvé avec l\'email:', email);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la récupération du rôle utilisateur:', error);
        }
      });
    } else {
      console.error('Impossible de récupérer l\'email du token');
    }
    
    console.log('Token info:', this.authService.getUserInfo());
  }

  private setAvailableRoles() {
    if (this.currentUserRole === 'ROLE_SUPERADMIN') {
      this.availableRoles = ['INVITED', 'FRIEND', 'ADMIN'];
    } else if (this.currentUserRole === 'ROLE_ADMIN') {
      this.availableRoles = ['INVITED', 'FRIEND'];
    } else {
      this.availableRoles = [];
    }
    console.log('Available roles set to:', this.availableRoles);
  }

  canChangeRole(userRole: string): boolean {
    // Un utilisateur ne peut pas modifier son propre rôle
    // Et ne peut modifier que les rôles inférieurs au sien
    console.log('canChangeRole check:', {
      currentUserRole: this.currentUserRole,
      userRole: userRole,
      canChange: this.currentUserRole === 'ROLE_SUPERADMIN' ? userRole !== 'SUPERADMIN' : false
    });
    
    if (this.currentUserRole === 'ROLE_SUPERADMIN') {
      return userRole !== 'SUPERADMIN';
    } else if (this.currentUserRole === 'ROLE_ADMIN') {
      return userRole === 'INVITED' || userRole === 'FRIEND';
    }
    return false;
  }

  onRoleChange(user: User, newRole: string) {
    if (!this.canChangeRole(user.role)) {
      return;
    }

    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        console.log(`Rôle de ${user.username} changé vers ${newRole}`);
        // Mettre à jour localement
        user.role = newRole;
        this.dataSource.data = [...this.users];
      },
      error: (error) => {
        console.error('Erreur lors du changement de rôle:', error);
        // Optionnel: afficher un message d'erreur à l'utilisateur
      }
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
