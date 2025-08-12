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
      console.log('Tentative de connexion pour:', email);
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Connexion réussie:', response);
          
          // ⭐ REDIRECTION BASÉE SUR LE RÔLE
          this.redirectUserBasedOnRole();
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

  private redirectUserBasedOnRole(): void {
    const userRole = this.authService.getUserRole();
    console.log('Rôle utilisateur détecté:', userRole);
    
    // Vérifier le rôle et rediriger en conséquence
    if (userRole === 'ADMIN' || userRole === 'admin') {
      console.log('Redirection vers admin');
      this.router.navigate(['/admin']);
    } else {
      console.log('Redirection vers accueil (utilisateur normal)');
      this.router.navigate(['/']); 
    }
  }

  
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}