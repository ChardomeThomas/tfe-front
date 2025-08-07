// login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BackgroundComponent } from '../../../shared/components/background/background.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, BackgroundComponent, RouterModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;
      console.log(email);
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Connexion réussie:', response);
          // Rediriger vers l'admin après connexion
          this.router.navigate(['/admin']);
        },
        error: (error) => {
          console.error('Erreur de connexion:', error);
          this.errorMessage = 'Email ou mot de passe incorrect';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.loginForm.markAllAsTouched();
    }
  }

  // Getters pour faciliter l'accès aux contrôles dans le template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}